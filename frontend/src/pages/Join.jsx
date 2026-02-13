import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const Join = () => {
  const navigate = useNavigate();

  const handleSelection = (role) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <PageTransition>
      {/* Background color removed to show Living Background */}
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        
        {/* LIVING BACKGROUND */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        {/* Header */}
        <div className="p-8 relative z-10">
          <h1 className="text-2xl font-black text-blue-600 dark:text-white tracking-tighter uppercase italic">
            LinkUp
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-12 text-center tracking-tight"
          >
            How do you want to <br className="hidden md:block" /> use LinkUp?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            
            {/* CLIENT CARD */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelection('client')}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl cursor-pointer group hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  👔
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">I want to hire</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Find verified artisans, plumbers, and electricians for your projects.
              </p>
            </motion.div>

            {/* ARTISAN CARD */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelection('artisan')}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl cursor-pointer group hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🛠️
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-green-500 group-hover:bg-green-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">I want to work</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Create a professional profile, showcase your work, and get booked.
              </p>
            </motion.div>

          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-sm font-bold text-gray-400 uppercase tracking-widest"
          >
            Already have an account? <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer hover:underline">Log In</span>
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Join;