import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReviewModal = ({ isOpen, onClose, artisanId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { artisanId, rating, comment });
      toast.success('Review submitted successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-xl font-bold mb-4">Rate Service</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold">Rating</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border p-2 rounded"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <div>
            <label className="block font-bold">Comment</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border p-2 rounded"
              rows="3"
              required
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-secondary text-white py-2 rounded">Submit Review</button>
          <button type="button" onClick={onClose} className="w-full mt-2 text-gray-500">Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;