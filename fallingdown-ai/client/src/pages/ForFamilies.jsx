import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, ShieldWarning, PaperPlaneRight, CircleNotch } from '@phosphor-icons/react';
import { submitLead } from '../api/fallingdown';
import toast from 'react-hot-toast';

const ForFamilies = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', role: 'Family Member', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      toast.success('We\'ll contact you shortly!');
      setFormData({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
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
          <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 text-pink-400 rounded-2xl mb-6">
            <Heart size={32} weight="fill" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Peace of mind, 24/7.<br/>For every family.</h1>
          <p className="text-xl text-slate-400">Keep your loved ones safe without compromising their dignity or privacy. Ambient monitoring that works passively in the background.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Hidden Dangers</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 text-orange-400"><Clock size={24} weight="fill" /></div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">The 'Long Lie'</h4>
                    <p className="text-slate-400 text-sm mt-1">Over 50% of elderly fallers cannot get up on their own. Lying on the floor for more than an hour exponentially increases mortality risk.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 text-red-400"><ShieldWarning size={24} weight="fill" /></div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">The Privacy Paradox</h4>
                    <p className="text-slate-400 text-sm mt-1">Families want monitoring for safety, but elderly individuals reject intrusive cameras or uncomfortable wearables.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 bg-teal-500/5 border-teal-500/20">
              <h3 className="text-xl font-bold text-white mb-4">The Care-Circle Ecosystem</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-300 font-medium">
                <div className="px-4 py-2 bg-navy-900 rounded-lg border border-white/10">Camera</div>
                <div className="hidden sm:block text-teal-400">→</div>
                <div className="text-teal-400 sm:hidden">↓</div>
                <div className="px-4 py-2 bg-teal-900/50 rounded-lg border border-teal-500/30 text-teal-300">Edge AI</div>
                <div className="hidden sm:block text-teal-400">→</div>
                <div className="text-teal-400 sm:hidden">↓</div>
                <div className="px-4 py-2 bg-[#25D366]/20 rounded-lg border border-[#25D366]/30 text-[#25D366]">WhatsApp</div>
                <div className="hidden sm:block text-teal-400">→</div>
                <div className="text-teal-400 sm:hidden">↓</div>
                <div className="px-4 py-2 bg-purple-900/50 rounded-lg border border-purple-500/30 text-purple-300">Family Group</div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass-panel p-8 sticky top-28">
            <h3 className="text-2xl font-bold text-white mb-2">Secure Your Home</h3>
            <p className="text-slate-400 text-sm mb-6">Fill out this form and our care specialists will help you set up.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass-input" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="glass-input" placeholder="+1..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="glass-input" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message (Optional)</label>
                <textarea rows="3" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="glass-input resize-none" placeholder="Tell us about your requirements..."></textarea>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex justify-center items-center gap-2 mt-4">
                {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : <PaperPlaneRight size={20} weight="fill" />}
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForFamilies;
