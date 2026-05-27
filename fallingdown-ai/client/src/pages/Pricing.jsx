import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from '@phosphor-icons/react';

const Pricing = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-slate-400">Choose the right safety plan for your loved ones or your facility.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {/* Tier 1 */}
          <div className="glass-panel p-8 relative">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Home Guardian</div>
            <div className="text-4xl font-bold text-white mb-2">₹999<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-sm text-slate-400 mb-6">Perfect for single elderly individuals living alone.</p>
            <Link to="/contact" className="btn-outline w-full block text-center mb-8">Get Started</Link>
            
            <ul className="space-y-4">
              {['1 Camera support', '3 Caregivers in Care-Circle', 'WhatsApp & SMS Alerts', 'Audio Safety Mode', 'Basic 7-day logs'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={20} className="text-teal-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className="glass-panel p-8 relative border-teal-500 shadow-2xl shadow-teal-500/10 scale-105 z-10 bg-navy-900/80">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-navy-950 px-3 py-1 rounded-full text-xs font-bold tracking-wide">MOST POPULAR</div>
            <div className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-2">Family Pro</div>
            <div className="text-4xl font-bold text-white mb-2">₹1,999<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-sm text-slate-400 mb-6">Comprehensive coverage for the whole house.</p>
            <Link to="/contact" className="btn-primary w-full block text-center mb-8">Get Started</Link>
            
            <ul className="space-y-4">
              {['Up to 4 Cameras', '10 Caregivers in Care-Circle', 'WhatsApp, SMS & Call Alerts', 'Audio Safety Mode', 'Live Dashboard Access', '30-day logs & Analytics', 'Priority Support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={20} className="text-teal-400 shrink-0" />
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="glass-panel p-8 relative">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Enterprise</div>
            <div className="text-4xl font-bold text-white mb-2">Custom</div>
            <p className="text-sm text-slate-400 mb-6">For hospitals, nursing homes, and assisted living.</p>
            <Link to="/contact" className="btn-outline w-full block text-center mb-8 border-slate-600 text-slate-300 hover:text-white">Contact Sales</Link>
            
            <ul className="space-y-4">
              {['Unlimited Cameras', 'Centralized Nursing Dashboard', 'API Access & Integration', 'On-Premise Deployment Option', 'HIPAA Compliant Logging', 'Dedicated Account Manager', 'Custom SLA'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={20} className="text-teal-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Pricing;
