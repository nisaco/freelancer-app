import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* --- HERO SECTION --- */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">HIREME</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 font-bold hover:text-blue-600 transition">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
            📍 Available across Ghana
          </span>
          <h2 className="text-6xl font-black text-gray-900 leading-tight mb-6">
            Expert Artisans, <br />
            <span className="text-blue-600">On Demand.</span>
          </h2>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            Stop searching for reliable help. From Plumbers to Electricians, book verified experts and pay securely with Paystack.
          </p>
          
          <div className="flex gap-4">
            <Link to="/register" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-xl">
              Find an Artisan
            </Link>
            <div className="flex items-center gap-3 px-6">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm" />
                ))}
              </div>
              <p className="text-sm font-bold text-gray-400">500+ Pros in Accra</p>
            </div>
          </div>
        </div>

        {/* --- VISUAL DECORATION --- */}
        <div className="relative">
          <div className="bg-blue-600 w-full h-[500px] rounded-[40px] shadow-2xl relative overflow-hidden rotate-2">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-90 flex items-center justify-center p-12">
                <div className="text-white">
                  <p className="text-3xl font-black mb-2 italic">"The best way to hire in Ghana."</p>
                  <p className="text-blue-200 opacity-80">— Reliable Service Guaranteed</p>
                </div>
             </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               ✅
             </div>
             <div>
               <p className="font-black text-gray-900">Verified Pros</p>
               <p className="text-xs text-gray-400">Background Checked</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;