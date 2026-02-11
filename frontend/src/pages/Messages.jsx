import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

const Messages = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // Safety check for user data
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    fetchMessages();
    
    // Polling: Checks for new messages every 4 seconds
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [recipientId]);

  // Smooth scroll to bottom whenever messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/messages/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Chat sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      recipient: recipientId,
      content: newMessage
    };

    try {
      const res = await axios.post(`${API_BASE}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optimistic UI update: add message immediately
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Message failed to send");
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        
        {/* Living Background Shared across Jeffrey's Elite Suite */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col pt-24 pb-10 px-6 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/30 dark:border-white/10 shadow-2xl flex-1 flex flex-col overflow-hidden h-[75vh]"
          >
            
            {/* CHAT HEADER */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/20 dark:bg-black/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <span className="font-black text-lg tracking-tighter">
                    {recipientId.slice(-2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest dark:text-white italic">Secure Channel</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Verified Connection</p>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate(-1)} className="text-[10px] font-black text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
                Close Chat
              </button>
            </div>

            {/* MESSAGE STREAM */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-white/5">
              {messages.length > 0 ? messages.map((msg, i) => {
                const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                const isMe = senderId === user?._id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, x: isMe ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    key={i} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] p-5 rounded-[2rem] shadow-sm ${
                      isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none border border-white/20'
                    }`}>
                      <p className="text-[13px] font-bold leading-relaxed">{msg.content || msg.text}</p>
                      <p className={`text-[8px] mt-3 font-black uppercase opacity-40 tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No messages yet</p>
                  <p className="text-[8px] font-bold mt-2">Start the conversation below</p>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* INPUT CONSOLE */}
            <form onSubmit={handleSendMessage} className="p-8 bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-white/10 flex gap-4">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message to this professional..."
                className="flex-1 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl px-8 py-5 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white font-bold placeholder:text-gray-400 transition-all"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900 dark:bg-white text-white dark:text-black px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all"
              >
                Send
              </motion.button>
            </form>

          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Messages;
