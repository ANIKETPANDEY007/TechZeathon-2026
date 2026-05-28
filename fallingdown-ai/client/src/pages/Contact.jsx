import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitLead } from '../api/fallingdown';

/* ─── Inline SVG icons so they render reliably ─── */
const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.72 2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 6.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 13.92z"/>
  </svg>
);
const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '0.5rem',
  }}>
    {children}
  </label>
);

const ContactBlock = ({ icon, title, lines, accent = 'rgba(255,255,255,0.06)' }) => (
  <div style={{ display: 'flex', gap: '1.125rem', alignItems: 'flex-start' }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
      background: accent, border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.6)',
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>{title}</p>
      {lines.map((l, i) => (
        <p key={i} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginTop: i > 0 ? '0.1rem' : 0 }}>{l}</p>
      ))}
    </div>
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', role: 'Family Member', message: '' });
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '5rem', paddingBottom: '8rem' }}>
      <div className="container">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Contact</div>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'white',
            lineHeight: 1.0,
            marginBottom: '1rem',
          }}>
            Let's talk about safety.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: '480px' }}>
            Whether you need coverage for a single loved one or an entire hospital wing, our experts are here to help.
          </p>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.85fr) minmax(0, 1.15fr)', gap: '4rem', alignItems: 'start' }}>

          {/* ── Left — Contact info ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="contact-info-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <ContactBlock
              icon={<EmailIcon />}
              title="Email Us"
              lines={['support@fallingdown.ai', 'sales@fallingdown.ai']}
            />
            <ContactBlock
              icon={<PhoneIcon />}
              title="Call Us"
              lines={['+91 1800-123-4567', 'Mon–Fri, 9am – 6pm IST']}
            />
            <ContactBlock
              icon={<PinIcon />}
              title="Visit Us"
              lines={['Haldia Institute of Technology', 'Haldia, West Bengal 721657']}
            />

            {/* Response time card */}
            <div style={{
              marginTop: '0.5rem',
              padding: '1.25rem 1.375rem',
              background: 'rgba(52,211,153,0.04)',
              border: '1px solid rgba(52,211,153,0.12)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 0 3px rgba(52,211,153,0.18)' }} className="animate-pulse-emerald" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6ee7b7', letterSpacing: '-0.01em' }}>Fast response</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>
                We typically respond within 2 hours during business hours.
              </p>
            </div>

            {/* Trust markers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingTop: '0.5rem' }}>
              {[
                '🔒 Your data is never sold or shared',
                '🚀 Setup takes less than 15 minutes',
                '🏆 Trusted by 200+ care families',
              ].map((item, i) => (
                <div key={i} style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right — Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="contact-form-panel"
          >
            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.5rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Message sent!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto' }}>
                    A FallingDown AI expert will contact you within 24 hours.
                  </p>
                </div>
                <button onClick={() => setIsSuccess(false)} className="btn btn-ghost btn-sm">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.375rem', color: 'white', letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
                    Talk to an expert
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
                    Fill in the form and we'll reach back within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Full name */}
                  <div>
                    <FieldLabel>Full Name</FieldLabel>
                    <input
                      required type="text"
                      value={formData.name}
                      onChange={update('name')}
                      placeholder="Your name"
                      className="input"
                    />
                  </div>

                  {/* Phone + Email */}
                  <div className="contact-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <FieldLabel>WhatsApp Number</FieldLabel>
                      <input
                        required type="tel"
                        value={formData.phone}
                        onChange={update('phone')}
                        placeholder="+91 98765 43210"
                        className="input"
                      />
                    </div>
                    <div>
                      <FieldLabel>Email Address</FieldLabel>
                      <input
                        required type="email"
                        value={formData.email}
                        onChange={update('email')}
                        placeholder="you@example.com"
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <FieldLabel>I am a…</FieldLabel>
                    <select
                      value={formData.role}
                      onChange={update('role')}
                      className="input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option>Family Member</option>
                      <option>Caregiver</option>
                      <option>Hospital Admin</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <FieldLabel>Message</FieldLabel>
                    <textarea
                      required rows={4}
                      value={formData.message}
                      onChange={update('message')}
                      placeholder="Tell us about your needs..."
                      className="input"
                      style={{ resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center', marginTop: '0.25rem' }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #0c0c0f; color: rgba(255,255,255,0.85); }
        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .contact-field-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
