const express = require('express');
const router = express.Router();
const axios = require('axios');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendWhatsAppJobAlert } = require('../utils/whatsapp');
const { createNotification } = require('../utils/notifications');

const ARTISAN_EARNINGS_RATIO = 0.8;
const HIGH_VALUE_JOB_THRESHOLD = Number(process.env.HIGH_VALUE_JOB_THRESHOLD || 1000);
const GOLD_SUBSCRIPTION_PRICE = Number(process.env.GOLD_SUBSCRIPTION_PRICE || 39);
const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'https://linkupgh.live';
const ALLOWED_FRONTEND_ORIGINS = (process.env.CORS_ORIGIN || [
  'https://linkupgh.live',
  'https://www.linkupgh.live',
  'https://hireme-bk0l.onrender.com',
  'https://linkup-bk0l.onrender.com'
].join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isGoldActive = (user) => {
  if (!user) return false;
  if (user.subscriptionTier !== 'gold' || user.subscriptionStatus !== 'active') return false;
  if (!user.subscriptionExpiresAt) return true;
  return new Date(user.subscriptionExpiresAt) > new Date();
};

const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

const buildRequestedWindow = (date, scheduledStartAt, scheduledEndAt) => {
  const start = scheduledStartAt ? new Date(scheduledStartAt) : new Date(date);
  const end = scheduledEndAt
    ? new Date(scheduledEndAt)
    : new Date(start.getTime() + (2 * 60 * 60 * 1000));
  return { start, end };
};

const verifyWithPaystack = async (reference) => {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  return response.data.data;
};

const resolveFrontendUrl = (req) => {
  const origin = req.get('origin');
  if (origin && ALLOWED_FRONTEND_ORIGINS.includes(origin)) {
    return origin;
  }
  return DEFAULT_FRONTEND_URL;
};

const activateGoldSubscription = async (userId, reference) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const start = new Date();
  const expires = new Date(start);
  expires.setDate(expires.getDate() + 30);

  user.subscriptionTier = 'gold';
  user.subscriptionStatus = 'active';
  user.subscriptionStartedAt = start;
  user.subscriptionExpiresAt = expires;
  user.subscriptionReference = reference;
  await user.save();

  await createNotification({
    recipient: user._id,
    type: 'SYSTEM',
    message: `LinkUp Gold activated. Your subscription is active until ${expires.toDateString()}.`
  });

  return user;
};

const settleJobPayment = async (reference) => {
  const job = await Job.findOne({ paymentReference: reference });
  if (!job) return null;

  if (job.status === 'pending_payment') {
    const artisanShare = Number(job.amount || 0) * ARTISAN_EARNINGS_RATIO;

    await User.findByIdAndUpdate(job.artisan, {
      $inc: { pendingBalance: artisanShare }
    });

    job.status = 'paid';
    await job.save();

    await createNotification({
      recipient: job.artisan,
      type: 'NEW_BOOKING',
      relatedId: job._id,
      message: `New paid booking received. Escrow is funded and waiting for completion confirmation.`
    });
  }

  return job;
};

// Initialize standard job payment
router.post('/initialize', protect, async (req, res) => {
  try {
    const frontendUrl = resolveFrontendUrl(req);
    const { artisanId, amount, date, description, category, scheduledStartAt, scheduledEndAt } = req.body;
    const numericAmount = Number(amount || 0);

    if (!artisanId || !numericAmount || !date || !description) {
      return res.status(400).json({ message: 'artisanId, amount, date, and description are required' });
    }

    const artisan = await User.findById(artisanId);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ message: 'Selected artisan was not found' });
    }

    const { start, end } = buildRequestedWindow(date, scheduledStartAt, scheduledEndAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: 'Invalid scheduling window' });
    }

    const hasConflict = (artisan.busySlots || []).some((slot) => {
      const busyStart = new Date(slot.start);
      const busyEnd = new Date(slot.end);
      return overlaps(start, end, busyStart, busyEnd);
    });
    if (hasConflict) {
      return res.status(409).json({
        message: 'Selected artisan is not available in the requested time window. Please choose another slot.'
      });
    }

    if (numericAmount >= HIGH_VALUE_JOB_THRESHOLD && !isGoldActive(artisan)) {
      return res.status(403).json({
        message: `This is a High-Value job (>= GHS ${HIGH_VALUE_JOB_THRESHOLD}). Only LinkUp Gold artisans can accept it.`
      });
    }

    const job = await Job.create({
      client: req.user._id,
      artisan: artisanId,
      amount: numericAmount,
      date,
      scheduledStartAt: start,
      scheduledEndAt: end,
      description,
      serviceType: category || 'General Service',
      isHighValue: numericAmount >= HIGH_VALUE_JOB_THRESHOLD,
      status: 'pending_payment'
    });

    const paystackData = {
      email: req.user.email,
      amount: Math.round(numericAmount * 100),
      currency: 'GHS',
      callback_url: `${frontendUrl}/payment/callback?type=job`,
      metadata: {
        purchaseType: 'job',
        jobId: job._id,
        artisanId
      }
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    job.paymentReference = response.data.data.reference;
    await job.save();

    await createNotification({
      recipient: artisanId,
      type: 'NEW_BOOKING',
      relatedId: job._id,
      message: `New booking request for ${category || 'General Service'}.`
    });

    const whatsappPhone = artisan.whatsappPhone || artisan.phone;
    if (artisan.whatsappOptIn !== false && whatsappPhone) {
      await sendWhatsAppJobAlert({
        phone: whatsappPhone,
        serviceType: category || 'General Service',
        location: artisan.location || ''
      });
    }

    res.json(response.data.data);
  } catch (error) {
    console.error("Payment Init Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Could not initialize payment" });
  }
});

// Initialize LinkUp Gold subscription payment
router.post('/subscription/initialize', protect, authorize('artisan'), async (req, res) => {
  try {
    const frontendUrl = resolveFrontendUrl(req);
    const paystackData = {
      email: req.user.email,
      amount: Math.round(GOLD_SUBSCRIPTION_PRICE * 100),
      currency: 'GHS',
      callback_url: `${frontendUrl}/payment/callback?type=subscription`,
      metadata: {
        purchaseType: 'subscription',
        userId: req.user._id,
        plan: 'gold'
      }
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json({
      ...response.data.data,
      plan: 'gold',
      amount: GOLD_SUBSCRIPTION_PRICE
    });
  } catch (error) {
    console.error("Subscription Init Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Could not initialize subscription payment" });
  }
});

// Frontend callback verifier (returns JSON)
router.get('/callback', async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ message: 'reference is required' });

  try {
    const data = await verifyWithPaystack(reference);
    if (data.status !== 'success') return res.status(400).json({ status: 'failed', data });

    const metadata = data.metadata || {};
    const purchaseType = metadata.purchaseType || 'job';

    if (purchaseType === 'subscription') {
      const user = await activateGoldSubscription(metadata.userId, reference);
      if (!user) return res.status(404).json({ message: 'User not found for subscription activation' });
      return res.json({ status: 'success', type: 'subscription', expiresAt: user.subscriptionExpiresAt, data });
    }

    const job = await settleJobPayment(reference);
    return res.json({ status: 'success', type: 'job', jobId: job?._id || null, data });
  } catch (error) {
    console.error("Payment Callback Error:", error.response?.data || error.message);
    return res.status(500).json({ status: 'failed', message: 'Payment verification failed' });
  }
});

// Legacy verify route (redirect flow compatibility)
router.get('/verify', async (req, res) => {
  const frontendUrl = resolveFrontendUrl(req);
  const { reference } = req.query;
  if (!reference) return res.redirect(`${frontendUrl}/payment-failed`);

  try {
    const data = await verifyWithPaystack(reference);
    if (data.status !== 'success') {
      return res.redirect(`${frontendUrl}/payment-failed`);
    }

    const metadata = data.metadata || {};
    const purchaseType = metadata.purchaseType || 'job';

    if (purchaseType === 'subscription') {
      await activateGoldSubscription(metadata.userId, reference);
      return res.redirect(`${frontendUrl}/artisan-dashboard?subscription=success`);
    }

    await settleJobPayment(reference);
    return res.redirect(`${frontendUrl}/payment-success?reference=${reference}`);
  } catch (error) {
    console.error("Verification Error:", error.response?.data || error.message);
    return res.redirect(`${frontendUrl}/payment-failed`);
  }
});

module.exports = router;

