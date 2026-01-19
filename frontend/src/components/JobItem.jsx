import React, { useState } from 'react';
import PayButton from './PayButton';

const JobItem = ({ job }) => {
  const [showBooking, setShowBooking] = useState(false);
  
  const hourlyRate = job.price || 0;
  const depositAmount = hourlyRate * 2;
  const user = JSON.parse(localStorage.getItem('user'));

  // Avatar fallback if no profile pic exists
  const defaultAvatar = `https://ui-avatars.com/api/?name=${job.username}&background=random`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* --- IMAGE & BADGE SECTION --- */}
      <div className="relative h-52 w-full bg-gray-100">
        <img 
          src={job.profilePic || defaultAvatar} 
          alt={job.username}
          className="w-full h-full object-cover"
        />
        
        {/* Verification Badge */}
        <div className="absolute top-4 right-4">
          {job.isVerified ? (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-bold uppercase">Verified</span>
            </div>
          ) : (
            <div className="bg-gray-800/70 backdrop-blur-md text-gray-200 px-3 py-1 rounded-full border border-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-tighter">Pending ID</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded">
              {job.category || "General"}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">{job.username}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-gray-900 leading-none">GHS {hourlyRate}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">per hour</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-3 italic">
          "{job.bio || "No bio provided. Contact artisan for details."}"
        </p>

        <div className="mt-auto">
          {!showBooking ? (
            <button 
              onClick={() => setShowBooking(true)}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-all active:scale-95"
            >
              Book Now
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in zoom-in duration-200">
              
              {/* Safety Warning for Unverified */}
              {!job.isVerified && (
                <div className="mb-3 p-2 bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-2">
                  <span className="text-sm">⚠️</span>
                  <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">
                    Unverified Artisan: Proceed with caution.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Deposit:</span>
                <span className="text-xl font-black text-blue-900 underline decoration-blue-300">GHS {depositAmount}</span>
              </div>
              
              <PayButton 
                amount={depositAmount} 
                email={user?.email || "customer@hireme.com"} 
              />
              
              <button 
                onClick={() => setShowBooking(false)}
                className="w-full mt-2 text-[10px] text-gray-400 font-bold hover:text-red-500 uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobItem;