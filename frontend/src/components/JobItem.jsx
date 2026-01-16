import React, { useState } from 'react';
import PayButton from './PayButton'; // Ensure PayButton is in the same folder

const JobItem = ({ job }) => {
  const [isBooking, setIsBooking] = useState(false);

  // --- CONFIGURATION ---
  // Policy: Client must pay for the first 2 hours upfront to secure the booking.
  const minimumHours = 2; 
  
  // Data: Assume job.price is the "Hourly Rate" (e.g., 30 GHS)
  const hourlyRate = job.price;
  const depositAmount = hourlyRate * minimumHours;

  // User Email: Grab from storage, or use a placeholder so Paystack doesn't crash
  const userEmail = localStorage.getItem('userEmail') || "client@hireme.com";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 my-4">

      {/* --- TOP SECTION: Job Info --- */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
            GHS {hourlyRate}/hr
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">{job.description}</p>
      </div>

      {/* --- BOTTOM SECTION: Action Area --- */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        
        {/* STATE 1: Simple "Book" Button */}
        {!isBooking ? (
          <button 
            onClick={() => setIsBooking(true)}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
          >
            Book Now
          </button>
        ) : (
          
          /* STATE 2: The Deposit Calculator */
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-fadeIn">
            
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-800 text-sm">Booking Deposit Required</h4>
              <span className="text-[10px] uppercase tracking-wide text-gray-500 font-bold border border-gray-300 px-1 rounded">
                Escrow
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              To secure this artisan, you must pay a deposit covering the first 
              <span className="font-bold text-gray-900"> {minimumHours} hours</span>. 
              Any extra time will be settled on-site.
            </p>

            {/* Receipt / Calculation Box */}
            <div className="bg-white border border-gray-200 rounded p-3 mb-4 text-sm shadow-sm">
              <div className="flex justify-between mb-1 text-gray-500">
                <span>Rate per hour:</span>
                <span>GHS {hourlyRate}</span>
              </div>
              <div className="flex justify-between mb-1 text-gray-500">
                <span>Minimum Hours:</span>
                <span>x {minimumHours}</span>
              </div>
              <div className="border-b border-gray-100 my-2"></div>
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total Deposit:</span>
                <span className="text-green-600">GHS {depositAmount}</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* THE PAY BUTTON */}
              <div className="w-full">
                <PayButton 
                  amount={depositAmount} 
                  email={userEmail} 
                />
              </div>

              <button 
                onClick={() => setIsBooking(false)}
                className="w-full text-gray-500 text-xs font-medium hover:text-red-600 py-2 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobItem;