import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const TermsAndConditions = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] px-6 py-16">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-white">
            Terms & Agreement
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mt-3">Version 2026-02-11</p>

          <div className="mt-8 space-y-6 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            <section>
              <h2 className="font-black uppercase text-gray-900 dark:text-white mb-2">Escrow Policy</h2>
              <p>Money is held in escrow and released only after client confirmation that the job is complete.</p>
            </section>
            <section>
              <h2 className="font-black uppercase text-gray-900 dark:text-white mb-2">Verification Policy</h2>
              <p>Artisans must provide a valid Ghana Card number and a clear Ghana Card image before admin verification.</p>
            </section>
            <section>
              <h2 className="font-black uppercase text-gray-900 dark:text-white mb-2">Conduct Policy</h2>
              <p>No off-platform payments are allowed. This protects records, trust, and platform commission controls.</p>
            </section>
            <section>
              <h2 className="font-black uppercase text-gray-900 dark:text-white mb-2">Dispute Policy</h2>
              <p>Admin reviews evidence and may release funds to artisan, refund client, or hold funds pending additional review.</p>
            </section>
          </div>

          <div className="mt-10">
            <Link to="/register" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest">
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TermsAndConditions;