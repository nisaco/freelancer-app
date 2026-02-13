import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import axios from 'axios';

// --- NEW COMPONENT: Animated Counter ---
const StatCounter = ({ value, label, suffix = "", prefix = "", decimals = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(val) {
          if (ref.current) {
            ref.current.textContent = val.toFixed(decimals);
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, decimals]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.1, rotate: 2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="text-center p-4 cursor-default"
    >
      <div className="flex items-center justify-center text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 drop-shadow-sm">
        <span className="text-blue-600 dark:text-blue-400 mr-1">{prefix}</span>
        <span ref={ref}>0</span>
        <span className="text-blue-600 dark:text-blue-400 ml-1">{suffix}</span>
      </div>
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{label}</p>
    </motion.div>
  );
};

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
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
           <h1 className="text-2xl font-black text-blue-600 dark:text-white tracking-tighter uppercase italic">
             LINK<span className="text-blue-600">UP</span>
          </h1>
        </motion.div>
        <div className="flex gap-4 md:gap-8 items-center">
          <Link to="/login">
            <motion.span 
              whileHover={{ scale: 1.1, color: "#2563EB", textShadow: "0px 0px 8px rgba(37,99,235,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 transition-colors inline-block"
            >
              Log In
            </motion.span>
          </Link>
          <Link to="/join">
            <motion.button 
              whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all"
            >
              Join Now
            </motion.button>
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
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-200 dark:border-blue-500/30 cursor-default shadow-sm hover:shadow-blue-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
            #1 Marketplace for Ghanaian Artisans
          </motion.div>
          
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
            <motion.button 
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 25px -5px rgb(37 99 235 / 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/join')}
              className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all"
            >
              Hire a Pro
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -5, backgroundColor: "rgba(255,255,255,0.8)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/join')}
              className="w-full md:w-auto bg-white/50 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg"
            >
              Earn Money
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* --- ANIMATED STATS STRIP --- */}
      <section className="border-y border-white/20 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter label="Total Pros" value={500} suffix="+" />
          <StatCounter label="Jobs Done" value={2.5} suffix="k+" decimals={1} />
          <StatCounter label="Secure Escrow" value={100} suffix="%" />
          <StatCounter label="Client Rating" value={4.9} suffix="/5" decimals={1} />
        </div>
      </section>

      {/* --- POPULAR CATEGORIES --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter drop-shadow-md">
                Popular <span className="text-blue-600">Services</span>
              </h2>
            </div>
            <Link to="/join" className="hidden md:block">
              <motion.span 
                whileHover={{ x: 5, color: '#2563EB' }}
                className="text-xs font-black text-blue-600 uppercase tracking-widest inline-block"
              >
                View All Categories →
              </motion.span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -10, borderColor: '#3B82F6', boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 p-6 rounded-[2rem] text-center cursor-pointer transition-colors shadow-lg"
                onClick={() => navigate('/join')}
              >
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-4"
                >
                  {cat.icon}
                </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-4 drop-shadow-md">
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
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, type: "spring" }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] relative overflow-hidden border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all cursor-default"
              >
                <div className="absolute -right-4 -top-4 text-9xl opacity-5 font-black text-gray-900 dark:text-white select-none">{i+1}</div>
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">{step.icon}</div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED ARTISANS --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter drop-shadow-md">
              Featured <span className="text-green-500">Elite Pros</span>
            </h2>
            <div className="flex gap-2">
              <motion.span whileHover={{ scale: 1.5 }} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer shadow-md"/>
              <motion.span whileHover={{ scale: 1.5 }} className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer shadow-md"/>
              <motion.span whileHover={{ scale: 1.5 }} className="w-3 h-3 rounded-full bg-green-500 cursor-pointer shadow-md"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredArtisans.length > 0 ? featuredArtisans.map((artisan, i) => (
              <motion.div 
                key={artisan._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -10, borderColor: '#3B82F6' }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 hover:border-blue-500 transition-colors group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl h-48">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={artisan.profilePic || "https://via.placeholder.com/150"} 
                    alt={artisan.username} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full shadow-md">
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
                  <Link to="/join">
                    <motion.span 
                      whileHover={{ x: 3, color: '#2563EB' }}
                      className="text-[10px] font-black uppercase text-blue-600 tracking-widest inline-block"
                    >
                      Hire Me
                    </motion.span>
                  </Link>
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-7xl mx-auto bg-gradient-to-r from-blue-900 to-blue-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl hover:shadow-blue-600/40"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8 drop-shadow-lg">
              Ready to get <br/> the job done?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of Ghanaians using LinkUp to find reliable help or grow their business.
            </p>
            <motion.button 
              onClick={() => navigate('/join')}
              whileHover={{ scale: 1.1, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-colors"
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white/80 dark:bg-[#05080F]/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pt-20 pb-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <motion.h3 
              whileHover={{ scale: 1.05, originX: 0 }}
              className="text-2xl font-black text-blue-600 dark:text-white tracking-tighter uppercase italic mb-6 cursor-default"
            >
              LinkUp
            </motion.h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              The #1 trusted marketplace for connecting clients with verified artisans in Ghana.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/join">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Find Artisans</motion.span>
                </Link>
              </li>
              <li>
                <Link to="/join">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Become a Pro</motion.span>
                </Link>
              </li>
              <li>
                <Link to="/login">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Sign In</motion.span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Help Center</motion.span>
                </a>
              </li>
              <li>
                <Link to="/terms">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Terms of Service</motion.span>
                </Link>
              </li>
              <li>
                <Link to="/privacy">
                  <motion.span whileHover={{ x: 5, color: '#3B82F6' }} className="inline-block transition-colors">Privacy Policy</motion.span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h4>
             <p className="text-sm text-gray-500">support@linkupgh.live</p>
             <p className="text-sm text-gray-500">+233 55 123 4567</p>
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