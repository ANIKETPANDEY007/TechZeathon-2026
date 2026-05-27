import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeSimple, Phone, MapPin, CircleNotch, CheckCircle } from '@phosphor-icons/react';
import { submitLead } from '../api/fallingdown';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', role: 'Family Member', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Left: Info */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-6">Let's talk about safety.</h1>
            <p className="text-lg text-slate-400 mb-12">Whether you need coverage for a single loved one or an entire hospital wing, our experts are here to design the right AI safety net for you.</p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                  <EnvelopeSimple size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email Us</h3>
                  <p className="text-slate-400 text-sm">support@fallingdown.ai</p>
                  <p className="text-slate-400 text-sm">sales@fallingdown.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                  <Phone size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Call Us</h3>
                  <p className="text-slate-400 text-sm">+91 1800-123-4567</p>
                  <p className="text-slate-500 text-xs mt-1">Mon-Fri, 9am - 6pm IST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                  <MapPin size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                  <p className="text-slate-400 text-sm">Haldia Institute of Technology<br/>Haldia, West Bengal 721657</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass-panel p-8">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle size={64} weight="fill" className="text-emerald-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400">Thank you for reaching out. A FallingDown AI expert will contact you within 24 hours.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-8 text-teal-400 hover:text-teal-300 text-sm font-medium">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-2xl font-bold text-white mb-6">Talk to an Expert</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Phone</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="glass-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="glass-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">I am a...</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="glass-input appearance-none">
                    <option>Family Member</option>
                    <option>Caregiver</option>
                    <option>Hospital Admin</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message</label>
                  <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="glass-input resize-none"></textarea>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex justify-center items-center gap-2 mt-2">
                  {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
