import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitLead } from '../api/fallingdown';
import toast from 'react-hot-toast';

const ForCareCenters = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', role: 'Hospital Admin',
    facilityName: '', numberOfBeds: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      toast.success("Lead registered! We'll reach out within 24 hours.");
      setFormData({ name: '', phone: '', email: '', role: 'Hospital Admin', facilityName: '', numberOfBeds: '', message: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  const highlights = [
    { icon: '📊', title: 'High Patient Ratios', desc: 'Nurses can\'t be everywhere. Our AI provides continuous monitoring for every single bed simultaneously.' },
    { icon: '🛡️', title: 'Liability Reduction', desc: 'Automated incident logging and photo evidence protect your facility from unfounded claims.' },
  ];

  const benefits = [
    { title: 'Retrofit Capability', desc: 'Plugs directly into your existing IP camera RTSP streams. No hardware to buy.' },
    { title: 'Central Dashboard', desc: 'Monitor an entire wing from a single nursing station tablet.' },
    { title: 'HIPAA Compliant', desc: 'On-premise deployment options ensure no patient data leaves your local network.' },
  ];

  const LabelEl = ({ children }) => (
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
      {children}
    </label>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '8rem' }}>
      <div className="container">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 5rem', paddingTop: '2rem' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem', lineHeight: 1 }}>🏥</div>
          <div className="badge badge-blue" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>For Care Centers</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'white', lineHeight: 1.05, marginBottom: '1rem' }}>
            Hospital-grade AI monitoring.
            <br />Zero extra infrastructure.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Scale your nursing staff's capabilities. Turn your existing CCTV network into an active patient safety grid.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '5rem', alignItems: 'start' }}>
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
          >
            {/* Highlight cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {highlights.map((h, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>{h.icon}</div>
                  <h3 style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem', letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>{h.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{h.desc}</p>
                </div>
              ))}
            </div>

            {/* Benefits list */}
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>Why facilities choose us</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem' }}>{b.title}: </span>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9375rem' }}>{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pilot CTA card */}
            <div style={{ padding: '1.5rem', background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: '16px' }}>
              <h3 style={{ fontWeight: 700, color: 'white', fontSize: '1.0625rem', letterSpacing: '-0.015em', marginBottom: '0.5rem' }}>30-Day Risk-Free Pilot</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Test FallingDown AI in one ward for 30 days. See the ROI before deploying facility-wide. No commitment required.</p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'sticky', top: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.25rem' }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '1.375rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Request Enterprise Pilot</h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', lineHeight: 1.6 }}>Connect with our B2B integration team.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <LabelEl>Full Name</LabelEl>
                <input required type="text" value={formData.name} onChange={update('name')} placeholder="Dr. Jane Smith" className="input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <LabelEl>Facility Name</LabelEl>
                  <input required type="text" value={formData.facilityName} onChange={update('facilityName')} placeholder="Apollo Hospital" className="input" />
                </div>
                <div>
                  <LabelEl>Number of Beds</LabelEl>
                  <select required value={formData.numberOfBeds} onChange={update('numberOfBeds')} className="input" style={{ cursor: 'pointer' }}>
                    <option value="">Select size...</option>
                    <option value="1-50">1 – 50 beds</option>
                    <option value="51-200">51 – 200 beds</option>
                    <option value="200+">200+ beds</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <LabelEl>Phone</LabelEl>
                  <input required type="tel" value={formData.phone} onChange={update('phone')} placeholder="+91 ..." className="input" />
                </div>
                <div>
                  <LabelEl>Work Email</LabelEl>
                  <input required type="email" value={formData.email} onChange={update('email')} placeholder="you@hospital.com" className="input" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                {isSubmitting ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <style>{`select option { background: #0c0c0f; color: white; }`}</style>
    </div>
  );
};

export default ForCareCenters;
