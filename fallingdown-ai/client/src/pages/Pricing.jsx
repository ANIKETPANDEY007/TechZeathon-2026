import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const tiers = [
    {
      name: 'Home Guardian',
      price: '₹299',
      period: '/mo',
      desc: 'Perfect for a single elderly individual living alone.',
      cta: 'Get started',
      ctaTo: '/contact',
      features: [
        '1 camera supported',
        '3 caregivers in circle',
        'WhatsApp & SMS alerts',
        'Audio safety mode',
        '7-day incident history',
      ],
      featured: false,
    },
    {
      name: 'Family Pro',
      price: '₹499',
      period: '/mo',
      desc: 'Comprehensive coverage for the entire household.',
      cta: 'Start free trial',
      ctaTo: '/login',
      features: [
        'Up to 4 cameras',
        '10 caregivers in circle',
        'WhatsApp, SMS & call alerts',
        'Audio safety mode',
        'Live dashboard access',
        '30-day logs & analytics',
        'Priority support',
      ],
      featured: true,
      badge: 'Most popular',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For hospitals, nursing homes, and assisted living.',
      cta: 'Contact sales',
      ctaTo: '/contact',
      features: [
        'Unlimited cameras',
        'Centralized nursing dashboard',
        'API access & integration',
        'On-premise deployment',
        'HIPAA compliant logging',
        'Dedicated account manager',
        'Custom SLA',
      ],
      featured: false,
    },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '8rem' }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 5rem' }}
        >
          <div className="badge badge-white" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>Pricing</div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'white', lineHeight: 1.05, marginBottom: '1rem' }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Choose the right protection plan for your loved ones. Cancel anytime, no questions asked.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.25rem', alignItems: 'stretch', maxWidth: '1060px', margin: '0 auto' }}>
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`price-card${tier.featured ? ' featured' : ''}`}
              style={{ position: 'relative' }}
            >
              {tier.badge && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: 'white', color: 'black',
                  padding: '4px 14px', borderRadius: '980px',
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {tier.badge}
                </div>
              )}

              {/* Tier name */}
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: tier.featured ? 'rgba(79,142,247,0.9)' : 'rgba(255,255,255,0.35)', marginBottom: '1.25rem' }}>
                {tier.name}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: tier.price === 'Custom' ? '2.5rem' : '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'white', lineHeight: 1 }}>{tier.price}</span>
                {tier.period && <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginLeft: '2px' }}>{tier.period}</span>}
              </div>

              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem', lineHeight: 1.6 }}>{tier.desc}</p>

              <Link
                to={tier.ctaTo}
                className={`btn ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%', marginBottom: '2rem' }}
              >
                {tier.cta}
              </Link>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: tier.featured ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${tier.featured ? 'rgba(79,142,247,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={tier.featured ? '#93c5fd' : 'rgba(255,255,255,0.5)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: tier.featured ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ / Trust note */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginTop: '4rem', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', maxWidth: '600px', margin: '4rem auto 0' }}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🔒</div>
          <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            No contracts, no surprises
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            All plans include a 14-day free trial. Cancel any time. We never store video footage on the cloud — your privacy is our priority.
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr !important; max-width: 520px !important; }
        }
      `}</style>
    </div>
  );
};

export default Pricing;
