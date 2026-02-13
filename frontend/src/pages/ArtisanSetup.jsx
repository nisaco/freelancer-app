import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import PageTransition from '../components/PageTransition';

const categories = [
  { id: 'Plumber', icon: '🚰', label: 'Plumber' },
  { id: 'Electrician', icon: '⚡', label: 'Electrician' },
  { id: 'Carpenter', icon: '🪚', label: 'Carpenter' },
  { id: 'Mason', icon: '🧱', label: 'Mason' },
  { id: 'Painter', icon: '🎨', label: 'Painter' },
  { id: 'Mechanic', icon: '🔧', label: 'Mechanic' },
  { id: 'Other', icon: '✨', label: 'Other' }
];

const ArtisanSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    bio: '',
    experienceLevel: 'Entry',
    yearsExperience: '',
    educationInstitution: '',
    educationStatus: '',
    location: '',
    price: '',
    profilePic: null,
    ghanaCardNumber: '',
    ghanaCardImage: null
  });

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

    const payload = new FormData();
    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
    
    payload.append('category', finalCategory);
    payload.append('bio', formData.bio);
    payload.append('location', formData.location);
    payload.append('price', formData.price);
    payload.append('ghanaCardNumber', formData.ghanaCardNumber);
    payload.append('educationInstitution', formData.educationInstitution);
    payload.append('educationStatus', formData.educationStatus);

    if (formData.profilePic) payload.append('profilePic', formData.profilePic);
    if (formData.ghanaCardImage) payload.append('ghanaCardImage', formData.ghanaCardImage);

    try {
      await axios.put(`${API_BASE}/upload/profile-setup`, payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success("Profile setup complete!");
      navigate('/artisan-dashboard');
    } catch (err) {
      toast.error("Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* Background color removed to show Living Background */}
      <div className="min-h-screen flex flex-col items-center pt-20 pb-20 px-6 relative overflow-hidden">
        
        {/* LIVING BACKGROUND */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-12 relative z-10">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {step} of {totalSteps}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{Math.round((step/totalSteps)*100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step/totalSteps)*100}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        <div className="w-full max-w-2xl relative z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">What is your specialty?</h1>
                <p className="text-gray-500 mb-8">Choose the primary service you offer to clients.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <motion.div 
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateField('category', cat.id)}
                      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                        formData.category === cat.id 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-gray-100 dark:border-white/10 hover:border-blue-300'
                      } bg-white/70 dark:bg-white/5 backdrop-blur-md`}
                    >
                      <div className="text-3xl mb-3">{cat.icon}</div>
                      <div className="font-bold text-gray-900 dark:text-white">{cat.label}</div>
                    </motion.div>
                  ))}
                </div>
                {formData.category === 'Other' && (
                  <input 
                    type="text" 
                    placeholder="Enter your specialty..."
                    className="w-full mt-4 p-4 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-2xl border-none outline-none font-bold text-gray-900 dark:text-white shadow-inner"
                    onChange={(e) => updateField('customCategory', e.target.value)}
                  />
                )}
                <div className="mt-10 flex justify-end">
                   <button 
                     disabled={!formData.category}
                     onClick={handleNext}
                     className="bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 hover:scale-105 transition-transform"
                   >
                     Next Step
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROFESSIONAL DETAILS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Build your profile</h1>
                <p className="text-gray-500 mb-8">Clients want to know who they are hiring.</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Professional Bio</label>
                    <textarea 
                      placeholder="Describe your skills, experience, and what makes you the best choice..."
                      className="w-full p-5 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-medium text-gray-900 dark:text-white h-40 resize-none shadow-sm"
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Education/Training</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Takoradi Technical Uni"
                        className="w-full p-5 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-bold text-gray-900 dark:text-white shadow-sm"
                        value={formData.educationInstitution}
                        onChange={(e) => updateField('educationInstitution', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Status</label>
                      <select 
                        className="w-full p-5 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-bold text-gray-900 dark:text-white shadow-sm"
                        value={formData.educationStatus}
                        onChange={(e) => updateField('educationStatus', e.target.value)}
                      >
                         <option value="">Select...</option>
                         <option value="completed">Completed</option>
                         <option value="ongoing">Ongoing</option>
                         <option value="self-taught">Self Taught / Apprentice</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                   <button onClick={handleBack} className="text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-600">Back</button>
                   <button onClick={handleNext} disabled={!formData.bio} className="bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 hover:scale-105 transition-transform">Next Step</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LOGISTICS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Rates & Location</h1>
                <p className="text-gray-500 mb-8">Set expectations for your clients.</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Base City/Town</label>
                    <input 
                      type="text" 
                      placeholder="e.g. East Legon, Accra"
                      className="w-full p-5 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-bold text-gray-900 dark:text-white shadow-sm"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </div>
                  
                  <div>
                     <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Starting Hourly Rate (GHS)</label>
                     <div className="relative">
                       <span className="absolute left-6 top-5 text-gray-400 font-bold">GHS</span>
                       <input 
                         type="number" 
                         placeholder="0.00"
                         className="w-full p-5 pl-16 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-bold text-gray-900 dark:text-white text-xl shadow-sm"
                         value={formData.price}
                         onChange={(e) => updateField('price', e.target.value)}
                       />
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 ml-4"> * You can negotiate this later per job.</p>
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                   <button onClick={handleBack} className="text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-600">Back</button>
                   <button onClick={handleNext} disabled={!formData.location || !formData.price} className="bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 hover:scale-105 transition-transform">Next Step</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: IDENTITY */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Final Verification</h1>
                <p className="text-gray-500 mb-8">Upload your details to get the "Verified" badge.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Profile Photo */}
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 transition-colors relative">
                    <input type="file" onChange={(e) => updateField('profilePic', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-4 overflow-hidden">
                      {formData.profilePic && <img src={URL.createObjectURL(formData.profilePic)} className="w-full h-full object-cover" />}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">Profile Photo</p>
                    <p className="text-xs text-gray-400">Clear face shot</p>
                  </div>

                  {/* Ghana Card */}
                  <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 transition-colors relative">
                    <input type="file" onChange={(e) => updateField('ghanaCardImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="text-4xl mb-4">🆔</div>
                    <p className="font-bold text-gray-900 dark:text-white">Ghana Card</p>
                    <p className="text-xs text-gray-400">
                      {formData.ghanaCardImage ? formData.ghanaCardImage.name : "Tap to upload"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Ghana Card Number</label>
                   <input 
                     type="text" 
                     placeholder="GHA-000000000-0"
                     className="w-full p-5 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border-none outline-none font-bold text-gray-900 dark:text-white shadow-sm"
                     value={formData.ghanaCardNumber}
                     onChange={(e) => updateField('ghanaCardNumber', e.target.value)}
                   />
                </div>

                <div className="mt-10 flex justify-between items-center">
                   <button onClick={handleBack} className="text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-600">Back</button>
                   <button 
                     onClick={handleSubmit} 
                     disabled={loading || !formData.ghanaCardImage || !formData.profilePic}
                     className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 disabled:opacity-50 hover:scale-105 transition-transform"
                   >
                     {loading ? "Processing..." : "Launch Profile"}
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArtisanSetup;