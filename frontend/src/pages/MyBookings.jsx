import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000/api' 
          : 'https://hireme-bk0l.onrender.com/api';
        
        const res = await axios.get(`${API_BASE}/jobs/client`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        toast.error("Could not load your bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-300">Loading History...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFDFF] pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-16">
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase">My Bookings</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">History of your service requests</p>
          </header>

          <div className="space-y-6">
            <AnimatePresence>
              {bookings.length > 0 ? bookings.map((booking) => (
                <BookingTicket key={booking._id} booking={booking} />
              )) : (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active bookings found.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const BookingTicket = ({ booking }) => {
  const statusColors = {
    paid: 'bg-green-500',
    pending_payment: 'bg-yellow-500',
    completed: 'bg-blue-600',
    cancelled: 'bg-red-500'
  };

  // Helper to trigger WhatsApp
  const openWhatsApp = (phone, name) => {
    if (!phone) return toast.info("Artisan phone number not listed.");
    
    // Clean phone number (remove spaces/special chars)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hello ${name}, I just booked your service on HireMe for ${booking.date}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group"
    >
      <div className="flex items-center gap-6 w-full">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          <img src={`https://ui-avatars.com/api/?name=${booking.artisan?.username}&background=random`} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{booking.artisan?.username}</h3>
            <span className={`w-2 h-2 rounded-full ${statusColors[booking.status] || 'bg-gray-300'}`} />
          </div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{booking.artisan?.category}</p>
          
          {/* WHATSAPP UNLOCK LOGIC */}
          <AnimatePresence>
            {booking.status === 'paid' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openWhatsApp(booking.artisan?.phone, booking.artisan?.username)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.48-8.413z"/>
                </svg>
                Contact Professional
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
        <div className="text-left md:text-right">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Date</p>
          <p className="text-sm font-black text-gray-900">{booking.date}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Amount</p>
          <p className="text-xl font-black text-gray-900">GHS {booking.amount}</p>
        </div>
      </div>
    </motion.div>
  );
};
export default MyBookings;