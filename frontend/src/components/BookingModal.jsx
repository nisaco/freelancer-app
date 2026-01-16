import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const BookingModal = ({ isOpen, onClose, artisanId, artisanName }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    date: '',
    time: '09:00' // Default to 9 AM
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Combine Date and Time into one "DateTime" string
      // Result looks like: "2026-01-20T09:00:00"
      const fullDateTime = new Date(`${formData.date}T${formData.time}`);

      // 2. Send to backend
      await api.post('/jobs', {
        artisanId,
        serviceType: formData.serviceType,
        description: formData.description,
        date: fullDateTime // Send the combined date+time
      });
      
      toast.success('Request sent successfully!');
      onClose();
    } catch (error) {
      // 3. Show the REAL error message from the backend
      const errorMessage = error.response?.data?.message || 'Booking failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Book {artisanName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Service Required</label>
            <input 
              type="text" 
              placeholder="e.g. Broken Pipe"
              className="w-full border p-2 rounded"
              required
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Description</label>
            <textarea 
              placeholder="Describe the problem..."
              className="w-full border p-2 rounded"
              rows="3"
              required
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-2">
            <div className="w-2/3">
              <label className="block text-sm font-bold text-gray-700">Date</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded"
                required
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-bold text-gray-700">Time</label>
              <input 
                type="time" 
                className="w-full border p-2 rounded"
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-secondary text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;