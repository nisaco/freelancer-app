const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Dispute = require('../models/Dispute');
const Job = require('../models/Job');
const Message = require('../models/Message');
const User = require('../models/User');

const ARTISAN_SHARE_RATIO = 0.9;

router.post('/', protect, async (req, res) => {
  try {
    const { jobId, reason, description, evidence } = req.body;

    if (!jobId || !reason) {
      return res.status(400).json({ message: 'jobId and reason are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isClient = job.client.toString() === req.user._id.toString();
    const isArtisan = job.artisan.toString() === req.user._id.toString();
    if (!isClient && !isArtisan) {
      return res.status(403).json({ message: 'Only participants in this job can open a dispute' });
    }

    const existing = await Dispute.findOne({ job: job._id });
    if (existing) {
      return res.status(409).json({ message: 'A dispute already exists for this job', dispute: existing });
    }

    const normalizedEvidence = Array.isArray(evidence)
      ? evidence
          .map((item) => ({
            imageUrl: item?.imageUrl,
            note: item?.note || '',
            uploadedBy: req.user._id
          }))
          .filter((item) => item.imageUrl)
      : [];

    const dispute = await Dispute.create({
      job: job._id,
      client: job.client,
      artisan: job.artisan,
      reason,
      description: description || '',
      raisedBy: req.user._id,
      evidence: normalizedEvidence
    });

    const hydrated = await Dispute.findById(dispute._id)
      .populate('job')
      .populate('client', 'username email')
      .populate('artisan', 'username email')
      .populate('raisedBy', 'username role')
      .populate('evidence.uploadedBy', 'username role');

    res.status(201).json(hydrated);
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ message: 'Failed to create dispute' });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ client: req.user._id }, { artisan: req.user._id }]
    })
      .populate('job')
      .populate('client', 'username')
      .populate('artisan', 'username')
      .populate('raisedBy', 'username role')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch disputes' });
  }
});

router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ['open', 'under_review', 'resolved'].includes(status)) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('job')
      .populate('client', 'username email')
      .populate('artisan', 'username email')
      .populate('raisedBy', 'username role')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load disputes' });
  }
});

router.get('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('job')
      .populate('client', 'username email')
      .populate('artisan', 'username email')
      .populate('raisedBy', 'username role')
      .populate('evidence.uploadedBy', 'username role')
      .populate('resolvedBy', 'username');

    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    const messages = await Message.find({
      $or: [
        { sender: dispute.client._id, recipient: dispute.artisan._id },
        { sender: dispute.artisan._id, recipient: dispute.client._id }
      ]
    })
      .select('sender recipient content createdAt')
      .sort({ createdAt: 1 });

    res.json({ dispute, messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dispute detail' });
  }
});

router.put('/:id/evidence', protect, async (req, res) => {
  try {
    const { imageUrl, note } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    const isClient = dispute.client.toString() === req.user._id.toString();
    const isArtisan = dispute.artisan.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isClient && !isArtisan && !isAdmin) {
      return res.status(403).json({ message: 'You are not allowed to add evidence to this dispute' });
    }

    dispute.evidence.push({
      imageUrl,
      note: note || '',
      uploadedBy: req.user._id
    });
    if (dispute.status === 'open') {
      dispute.status = 'under_review';
    }
    await dispute.save();

    const hydrated = await Dispute.findById(dispute._id)
      .populate('job')
      .populate('client', 'username email')
      .populate('artisan', 'username email')
      .populate('raisedBy', 'username role')
      .populate('evidence.uploadedBy', 'username role')
      .populate('resolvedBy', 'username');

    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add evidence' });
  }
});

router.put('/admin/:id/resolve', protect, authorize('admin'), async (req, res) => {
  try {
    const { resolution, adminNotes } = req.body;

    if (!['release_to_artisan', 'refund_client', 'hold_funds'].includes(resolution)) {
      return res.status(400).json({ message: 'Invalid resolution type' });
    }

    const dispute = await Dispute.findById(req.params.id).populate('job');
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (!dispute.job) return res.status(404).json({ message: 'Linked job not found' });

    const job = await Job.findById(dispute.job._id);
    const artisan = await User.findById(dispute.artisan);
    if (!job || !artisan) return res.status(404).json({ message: 'Job/Artisan missing for resolution' });

    const artisanShare = Number(job.amount || 0) * ARTISAN_SHARE_RATIO;

    if (resolution === 'release_to_artisan') {
      const releasable = Math.min(Math.max(artisan.pendingBalance || 0, 0), artisanShare);
      artisan.pendingBalance = Math.max(0, (artisan.pendingBalance || 0) - releasable);
      artisan.walletBalance = (artisan.walletBalance || 0) + releasable;
      job.status = 'completed';
      await artisan.save();
      await job.save();
    }

    if (resolution === 'refund_client') {
      artisan.pendingBalance = Math.max(0, (artisan.pendingBalance || 0) - artisanShare);
      job.status = 'cancelled';
      await artisan.save();
      await job.save();
    }

    if (resolution === 'hold_funds') {
      job.status = 'pending';
      await job.save();
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.adminNotes = adminNotes || '';
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const hydrated = await Dispute.findById(dispute._id)
      .populate('job')
      .populate('client', 'username email')
      .populate('artisan', 'username email')
      .populate('raisedBy', 'username role')
      .populate('evidence.uploadedBy', 'username role')
      .populate('resolvedBy', 'username');

    res.json(hydrated);
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Failed to resolve dispute' });
  }
});

module.exports = router;
