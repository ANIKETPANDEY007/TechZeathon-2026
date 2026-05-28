import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitLead } from '../api/fallingdown';
import toast from 'react-hot-toast';

const ForFamilies = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      toast.success("We'll contact you shortly!");
      setFormData({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  const dangers = [
    { icon: '⏱️', title: "The 'Long Lie'", desc: "Over 50% of elderly fallers cannot get up on their own. Lying on the floor for more than one hour exponentially increases mortality risk." },
    { icon: '🔒', title: "The Privacy Paradox", desc: "Families want monitoring for safety, but elderly individuals reject intrusive cameras or uncomfortable wearables. FallingDown AI changes that equation." },
  ];

  const flowSteps = [
    { label: 'Camera', accent: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.55)' },
    { label: 'Edge AI', accent: 'rgba(79,142,247,0.1)', border: 'rgba(79,142,247,0.25)', text: '#93c5fd' },
    { label: 'WhatsApp', accent: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', text: '#6ee7b7' },
    { label: 'Care Circle', accent: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)', text: '#a5b4fc' },
  ];

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
          <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem', lineHeight: 1 }}>🏠</div>
          <div className="badge badge-white" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>For Families</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'white', lineHeight: 1.05, marginBottom: '1rem' }}>
            Peace of mind, 24/7.
            <br />For every family.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Keep your loved ones safe without compromising their dignity or privacy. Ambient monitoring that works passively in the background.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '5rem', alignItems: 'start' }}>
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
          >
            {/* Dangers */}
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.625rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '1.75rem' }}>The Hidden Dangers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {dangers.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                      {d.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.375rem', fontSize: '1rem', letterSpacing: '-0.01em' }}>{d.title}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Care circle flow */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
              <h3 style={{ fontWeight: 600, color: 'white', fontSize: '1rem', letterSpacing: '-0.015em', marginBottom: '1.25rem' }}>The Care-Circle Ecosystem</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {flowSteps.map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      background: step.accent,
                      border: `1px solid ${step.border}`,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: step.text,
                      whiteSpace: 'nowrap',
                    }}>
                      {step.label}
                    </div>
                    {i < flowSteps.length - 1 && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Key benefits */}
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'white', letterSpacing: '-0.015em', marginBottom: '1rem' }}>Why families choose us</h3>
              {['Respects dignity — no visible cameras in bathrooms', 'Zero friction — no wearables to forget or charge', 'Instant WhatsApp alerts to the whole family', 'Works with cameras you already own'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{b}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'sticky', top: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.25rem' }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '1.375rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Secure your home</h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', lineHeight: 1.6 }}>Fill out this form and our care specialists will reach out to help you set up.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Full Name</label>
                <input required type="text" value={formData.name} onChange={update('name')} placeholder="Your full name" className="input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>WhatsApp</label>
                  <input required type="tel" value={formData.phone} onChange={update('phone')} placeholder="+91 ..." className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Email</label>
                  <input required type="email" value={formData.email} onChange={update('email')} placeholder="you@example.com" className="input" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Message (optional)</label>
                <textarea rows={3} value={formData.message} onChange={update('message')} placeholder="Tell us about your setup requirements..." className="input" style={{ resize: 'none', fontFamily: 'inherit' }} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                {isSubmitting ? 'Sending...' : 'Get started free'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForFamilies;
