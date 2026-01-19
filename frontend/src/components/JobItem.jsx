import React, { useState } from 'react';
import PayButton from './PayButton';

const JobItem = ({ artisan }) => { // Changed 'job' to 'artisan' for clarity
  const [showBooking, setShowBooking] = useState(false);
  
  // Safe parsing of user data
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const hourlyRate = artisan.price || 0;
  const depositAmount = hourlyRate * 2;

  // Avatar fallback if no profile pic exists
  const defaultAvatar = `https://ui-avatars.com/api/?name=${artisan.username}&background=random`;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      
      {/* --- IMAGE & BADGE SECTION --- */}
      <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
        <img 
          src={artisan.profilePic || defaultAvatar} 
          alt={artisan.username}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Verification Badge */}
        <div className="absolute top-4 right-4">
          {artisan.isVerified ? (
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
            </div>
          ) : (
            <div className="bg-gray-900/80 backdrop-blur-md text-gray-200 px-3 py-1.5 rounded-full border border-gray-600 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-tighter">ID Pending</span>
            </div>
          )}
        </div>

        {/* Location Tag */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm border border-white">
           📍 {artisan.location || "Ghana"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              {artisan.category || "Professional"}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-3 tracking-tight">{artisan.username}</h3>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-gray-900 leading-none">GHS {hourlyRate}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">per hour</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed italic">
          "{artisan.bio || "Quality service and professional workmanship guaranteed. Contact me for project discussions."}"
        </p>

        <div className="mt-auto">
          {!showBooking ? (
            <button 
              onClick={() => setShowBooking(true)}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              BOOK NOW
            </button>
          ) : (
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 animate-in fade-in zoom-in duration-200">
              
              {/* Safety Warning for Unverified */}
              {!artisan.isVerified && (
                <div className="mb-4 p-3 bg-amber-100 border border-amber-200 rounded-xl flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <p className="text-[10px] text-amber-900 font-bold leading-tight uppercase">
                    Security Alert: This artisan is unverified. Use the HireMe secure payment only.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-5">
                <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Initial Deposit:</span>
                <div className="text-right">
                    <span className="text-2xl font-black text-blue-900">GHS {depositAmount}</span>
                    <p className="text-[8px] text-blue-400 font-bold uppercase">Covers first 2 hours</p>
                </div>
              </div>
              
              {/* Assuming PayButton handles the Paystack logic */}
              <PayButton 
                amount={depositAmount} 
                email={user?.email || "customer@hireme.com"} 
                artisanId={artisan._id} // Pass this to save the job after payment
              />
              
              <button 
                onClick={() => setShowBooking(false)}
                className="w-full mt-3 text-[10px] text-gray-400 font-black hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobItem;