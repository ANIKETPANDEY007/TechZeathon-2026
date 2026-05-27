import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hospital, ChartLineUp, ShieldPlus, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { submitLead } from '../api/fallingdown';
import toast from 'react-hot-toast';

const ForCareCenters = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', role: 'Hospital Admin', facilityName: '', numberOfBeds: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      toast.success('Lead registered! We\'ll reach out within 24 hours.');
      setFormData({ name: '', phone: '', email: '', role: 'Hospital Admin', facilityName: '', numberOfBeds: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20 pt-10">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl mb-6">
            <Hospital size={32} weight="fill" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Hospital-grade AI monitoring.<br/>Zero extra infrastructure.</h1>
          <p className="text-xl text-slate-400">Scale your nursing staff's capabilities. Turn your existing CCTV network into an active patient safety grid.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 border-t-2 border-t-cyan-500">
                <ChartLineUp size={28} className="text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">High Patient Ratios</h3>
                <p className="text-sm text-slate-400">Nurses can't be everywhere. Our AI provides continuous monitoring for every single bed simultaneously.</p>
              </div>
              <div className="glass-panel p-6 border-t-2 border-t-teal-500">
                <ShieldPlus size={28} className="text-teal-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Liability Reduction</h3>
                <p className="text-sm text-slate-400">Automated incident logging and photo evidence protect your facility from unfounded claims.</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Why facilities choose us</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 text-teal-400"><ArrowRight weight="bold" /></div>
                  <p className="text-slate-300"><strong className="text-white">Retrofit Capability:</strong> Plugs directly into your existing IP camera RTSP streams. No hardware to buy.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 text-teal-400"><ArrowRight weight="bold" /></div>
                  <p className="text-slate-300"><strong className="text-white">Central Dashboard:</strong> Monitor an entire wing from a single nursing station tablet.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 text-teal-400"><ArrowRight weight="bold" /></div>
                  <p className="text-slate-300"><strong className="text-white">HIPAA Compliant:</strong> On-premise deployment options ensure no patient data leaves your local network.</p>
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl border border-teal-500/30">
              <h3 className="text-xl font-bold text-white mb-2">30-Day Risk-Free Pilot</h3>
              <p className="text-sm text-slate-300">Test FallingDown AI in one ward for 30 days. See the ROI before deploying facility-wide.</p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass-panel p-8 sticky top-28">
            <h3 className="text-2xl font-bold text-white mb-2">Request Enterprise Pilot</h3>
            <p className="text-slate-400 text-sm mb-6">Connect with our B2B integration team.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facility Name</label>
                  <input required type="text" value={formData.facilityName} onChange={e => setFormData({...formData, facilityName: e.target.value})} className="glass-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Beds</label>
                  <select required value={formData.numberOfBeds} onChange={e => setFormData({...formData, numberOfBeds: e.target.value})} className="glass-input appearance-none">
                    <option value="">Select size...</option>
                    <option value="1-50">1 - 50 beds</option>
                    <option value="51-200">51 - 200 beds</option>
                    <option value="200+">200+ beds</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="glass-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="glass-input" />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary bg-cyan-500 hover:bg-cyan-400 flex justify-center items-center gap-2 mt-4">
                {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForCareCenters;
