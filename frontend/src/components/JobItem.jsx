import React, { useState } from 'react';
import PayButton from './PayButton';

const JobItem = ({ job }) => {
  const [isBooking, setIsBooking] = useState(false);

  // --- LOGIC: Deposit Calculation ---
  const minimumHours = 2; 
  const hourlyRate = job.price || 0;
  const depositAmount = hourlyRate * minimumHours;

  // Get user email from storage for Paystack
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || "guest@hireme.com";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all my-4">
      {/* Job Details */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
            GHS {hourlyRate}/hr
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-sm">{job.description}</p>
        {job.location && <p className="text-gray-400 text-xs mt-1">📍 {job.location}</p>}
      </div>

      <div className="border-t border-gray-100 pt-4">
        {!isBooking ? (
          <button 
            onClick={() => setIsBooking(true)}
            className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Book Now
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Booking Deposit</h4>
            <p className="text-xs text-gray-500 mb-4">
              Pay for the first {minimumHours} hours to secure this artisan.
            </p>

            <div className="bg-white p-3 rounded border mb-4 shadow-sm">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Rate ({hourlyRate} x {minimumHours}hrs)</span>
                <span className="font-bold text-gray-900">GHS {depositAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <PayButton 
                amount={depositAmount} 
                email={userEmail} 
              />
              <button 
                onClick={() => setIsBooking(false)}
                className="w-full text-gray-400 text-xs hover:text-red-500 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobItem;