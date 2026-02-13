import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Welcome = () => {
  const [featuredArtisans, setFeaturedArtisans] = useState([]);
  const navigate = useNavigate();

  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/featured`);
        setFeaturedArtisans(res.data || []);
      } catch (error) {
        setFeaturedArtisans([]);
      }
    };
    fetchFeatured();
  }, [API_BASE]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const categories = [
    { name: 'Plumbers', icon: '🚰', count: '120+ Pros' },
    { name: 'Electricians', icon: '⚡', count: '85+ Pros' },
    { name: 'Carpenters', icon: '🪚', count: '64+ Pros' },
    { name: 'Masons', icon: '🧱', count: '40+ Pros' },
    { name: 'Painters', icon: '🎨', count: '55+ Pros' },
    { name: 'Mechanics', icon: '🔧', count: '30+ Pros' },
  ];

  return (
    // Background color removed from container to reveal the living-bg from index.css logic
    <div className="relative min-h-screen flex flex-col overflow-hidden transition-colors duration-700">
      
      {/* 1. LIVING BACKGROUND */}
      <div className="living-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* --- NAV BAR --- */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto w-full backdrop-blur-md top-0 bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-2">
           <h1 className="text-2xl font-black text-blue-600 dark:text-white tracking-tighter uppercase italic">
            LinkUp
          </h1>
        </div>
        <div className="flex gap-4 md:gap-8 items-center">
          <Link to="/login" className="text-xs font-black uppercase tracking-widest text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/join">
            <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform">
              Join Now
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 pt-20 pb-32 px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-200 dark:border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
            #1 Marketplace for Ghanaian Artisans
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-sm">
            Hire Verified <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Professionals</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Don't risk your project. Find vetted plumbers, electricians, and carpenters with 
            <span className="text-gray-900 dark:text-white font-bold"> secure escrow payments</span> and
            <span className="text-gray-900 dark:text-white font-bold"> verified Ghana Card IDs</span>.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/join')}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1"
            >
              Hire a Pro
            </button>
            <button 
              onClick={() => navigate('/join')}
              className="w-full md:w-auto bg-white/50 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/80 dark:hover:bg-white/20 transition-all"
            >
              Earn Money
            </button>
          </div>
        </motion.div>
      </header>

      {/* --- STATS STRIP --- */}
      <section className="border-y border-white/20 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Pros', value: '500+' },
            { label: 'Jobs Done', value: '2.5k+' },
            { label: 'Secure Escrow', value: '100%' },
            { label: 'Client Rating', value: '4.9/5' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- POPULAR CATEGORIES --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                Popular <span className="text-blue-600">Services</span>
              </h2>
            </div>
            <Link to="/join" className="hidden md:block text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All Categories</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 p-6 rounded-[2rem] text-center cursor-pointer hover:border-blue-500 transition-colors shadow-lg hover:shadow-xl"
                onClick={() => navigate('/join')}
              >
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-1">{cat.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-4">
              How LinkUp <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Safe, simple, and secure. We protect both the client and the artisan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: "🔍", 
                title: "1. Post or Search", 
                desc: "Browse verified profiles or let us match you with the best artisan for your specific job." 
              },
              { 
                icon: "🛡️", 
                title: "2. Secure Deposit", 
                desc: "Pay into our Escrow Vault. Funds are only released when you confirm the job is done correctly." 
              },
              { 
                icon: "✅", 
                title: "3. Job Done", 
                desc: "The artisan completes the work. You approve it, release the funds, and leave a review." 
              }
            ].map((step, i) => (
              <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] relative overflow-hidden border border-white/20 dark:border-white/5 shadow-xl">
                <div className="absolute -right-4 -top-4 text-9xl opacity-5 font-black text-gray-900 dark:text-white select-none">{i+1}</div>
                <div className="text-5xl mb-6">{step.icon}</div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED ARTISANS --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
              Featured <span className="text-green-500">Elite Pros</span>
            </h2>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"/>
              <span className="w-3 h-3 rounded-full bg-yellow-500"/>
              <span className="w-3 h-3 rounded-full bg-green-500"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredArtisans.length > 0 ? featuredArtisans.map((artisan, i) => (
              <motion.div 
                key={artisan._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 hover:border-blue-500 transition-colors group cursor-pointer shadow-lg"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl h-48">
                  <img 
                    src={artisan.profilePic || "https://via.placeholder.com/150"} 
                    alt={artisan.username} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{artisan.category}</span>
                  </div>
                </div>
                <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 dark:text-white truncate">
                  {artisan.username}
                </h4>
                <div className="flex items-center gap-1 mt-2 mb-3">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{Number(artisan.rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">({artisan.completedJobs || 0} jobs)</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/10 pt-4 mt-2">
                  <p className="text-sm font-black text-gray-900 dark:text-white">GHS {artisan.price || 0}<span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">/hr</span></p>
                  <Link to="/join" className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline">Hire Me</Link>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-12 text-center bg-white/30 dark:bg-white/5 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Loading Elite Artisans...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-900 to-blue-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8">
              Ready to get <br/> the job done?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of Ghanaians using LinkUp to find reliable help or grow their business.
            </p>
            <button 
              onClick={() => navigate('/join')}
              className="bg-white text-blue-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white/80 dark:bg-[#05080F]/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pt-20 pb-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-black text-blue-600 dark:text-white tracking-tighter uppercase italic mb-6">LinkUp</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              The #1 trusted marketplace for connecting clients with verified artisans in Ghana.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/join" className="hover:text-blue-600">Find Artisans</Link></li>
              <li><Link to="/join" className="hover:text-blue-600">Become a Pro</Link></li>
              <li><Link to="/login" className="hover:text-blue-600">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
              <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h4>
             <p className="text-sm text-gray-500">support@linkupgh.live</p>
             <p className="text-sm text-gray-500">+233 54 980 0115</p>
             <p className="text-sm text-gray-500 mt-2">Accra, Ghana</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 LinkUp Ghana. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Welcome;