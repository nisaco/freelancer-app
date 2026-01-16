import React, { useState } from 'react';
import PayButton from './PayButton';

const JobItem = ({ job }) => {
  const [showBooking, setShowBooking] = useState(false);
  
  const hourlyRate = job.price || 0;
  const depositAmount = hourlyRate * 2; // Fixed 2-hour deposit
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{job.category}</span>
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-gray-900">GHS {hourlyRate}</p>
            <p className="text-xs text-gray-400">per hour</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2">{job.description}</p>

        {!showBooking ? (
          <button 
            onClick={() => setShowBooking(true)}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Book Now
          </button>
        ) : (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-blue-800">2-Hour Deposit:</span>
              <span className="text-lg font-black text-blue-900">GHS {depositAmount}</span>
            </div>
            
            <PayButton 
              amount={depositAmount} 
              email={user?.email || "customer@hireme.com"} 
            />
            
            <button 
              onClick={() => setShowBooking(false)}
              className="w-full mt-2 text-xs text-blue-400 font-semibold hover:text-red-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobItem;