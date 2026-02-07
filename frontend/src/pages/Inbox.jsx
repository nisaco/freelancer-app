import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        // We fetch the latest messages to see who we are talking to
        const res = await axios.get(`${API_BASE}/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error("Inbox failed");
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>

        <div className="max-w-4xl mx-auto w-full pt-28 px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic mb-12">
            Your <span className="text-blue-600">Hub</span>
          </h1>

          <div className="space-y-4">
            {conversations.length > 0 ? conversations.map((chat) => (
              <motion.div 
                whileHover={{ x: 10 }}
                key={chat.otherUser._id}
                onClick={() => navigate(`/messages/${chat.otherUser._id}`)}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl flex justify-between items-center cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {chat.otherUser.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic">{chat.otherUser.username}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{chat.lastMessage}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Open Chat</p>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-white/10 rounded-[3rem] border border-dashed border-white/20">
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No Active Conversations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Inbox;