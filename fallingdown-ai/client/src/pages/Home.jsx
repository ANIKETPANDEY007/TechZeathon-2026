import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { checkMLStatus } from '../api/fallingdown';

/* -------------------------------------------
   ANIMATED COUNTER
--------------------------------------------- */
const Counter = ({ end, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 1600;
          const step = 16;
          const increment = end / (duration / step);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) { clearInterval(timer); setCount(end); }
            else setCount(Math.floor(start));
          }, step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

/* -------------------------------------------
   FEATURE ITEM
--------------------------------------------- */
const FeatureItem = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.75rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'default',
    }}
    whileHover={{
      background: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(255,255,255,0.1)',
      y: -4,
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    }}
  >
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.375rem',
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'white', letterSpacing: '-0.015em', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  </motion.div>
);

/* -------------------------------------------
   HOME PAGE
--------------------------------------------- */
const Home = () => {
  const [isLive, setIsLive] = useState(false);
  const [activeStat, setActiveStat] = useState(0);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, -80]);

  useEffect(() => {
    const check = async () => {
      try { await checkMLStatus(); setIsLive(true); }
      catch { setIsLive(false); }
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  // Animated live stat ticker
  const stats = ['Motion: Normal', 'Audio: Clear', 'Fall Risk: Low', 'Status: Safe'];
  useEffect(() => {
    const t = setInterval(() => setActiveStat(p => (p + 1) % stats.length), 2000);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: '🛡️', title: 'Instant Fall Detection', desc: 'Computer vision algorithms identify falls in real-time using advanced skeletal pose estimation.', delay: 0 },
    { icon: '🎙️', title: 'Audio Safety Mode', desc: 'Privacy-first acoustic analysis detects distress calls in sensitive areas without recording.', delay: 0.08 },
    { icon: '💬', title: 'WhatsApp Alerts', desc: 'Instant notifications with snapshot evidence delivered directly to every caregiver simultaneously.', delay: 0.16 },
    { icon: '⌚', title: 'Zero Wearables', desc: 'Works with any existing smart camera. No pendants, watches, or charging required.', delay: 0.24 },
    { icon: '🔄', title: 'Retrofit Compatible', desc: 'Plug into existing IP or RTSP cameras. No proprietary hardware purchases needed.', delay: 0.32 },
    { icon: '📊', title: 'Incident Analytics', desc: 'Rich dashboard with charts, exportable logs, and trend analysis for care professionals.', delay: 0.40 },
  ];

  return (
    <div style={{ background: '#000', overflowX: 'hidden' }}>

      {/* ===== HERO ===== */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 5rem', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '60vw', height: '60vw', maxWidth: '800px', maxHeight: '800px', background: 'radial-gradient(circle, rgba(79,142,247,0.09) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '0%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1px', height: '100vh', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.015), transparent)', pointerEvents: 'none' }} />
        </div>

        {/* Grid lines background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.015,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />

        <motion.div
          style={{ y: heroParallax, width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.4rem 1rem', borderRadius: '980px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '2.5rem',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLive ? '#34d399' : '#6b7280', display: 'inline-block', boxShadow: isLive ? '0 0 0 3px rgba(52,211,153,0.2)' : 'none' }} className={isLive ? 'animate-pulse-emerald' : ''} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeStat}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', fontFamily: 'monospace' }}
                >
                  {stats[activeStat]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'white',
              marginBottom: '1.5rem',
            }}
          >
            Safety.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fff 0%, #93c5fd 40%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Redefined
            </span>
            <br />by Intelligence.
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.45)', maxWidth: '560px', margin: '0 auto 3rem', lineHeight: 1.7, fontWeight: 400 }}
          >
            Transform any camera into an intelligent guardian. Detect falls instantly. Alert caregivers automatically. Zero wearables required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', gap: '0.5rem' }}>
              Get started free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/pricing" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
              View pricing
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem' }}
          >
            <div style={{ display: 'flex' }}>
              {['A','B','C','D'].map((l, i) => (
                <div key={l} style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `hsl(${210 + i * 30}, 60%, 55%)`,
                  border: '2px solid black',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', fontWeight: 700, color: 'white',
                  marginLeft: i === 0 ? 0 : '-8px',
                  zIndex: 4 - i,
                  position: 'relative',
                }}>
                  {l}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              Trusted by <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>200+</span> care families
            </span>
          </motion.div>
        </motion.div>

        {/* Hero UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: '860px', margin: '5rem auto 0', position: 'relative', zIndex: 1, padding: '0 1rem' }}
        >
          {/* Glow behind mockup */}
          <div style={{ position: 'absolute', inset: '-20%', background: 'radial-gradient(ellipse at center, rgba(79,142,247,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '1.5rem',
            backdropFilter: 'blur(24px)',
          }}>
            {/* Mockup header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                    <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.5rem', fontFamily: 'monospace' }}>fallingdown-ai · live feed</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '2px 8px', borderRadius: '980px', fontFamily: 'monospace' }}>● LIVE</span>
              </div>
            </div>

            {/* Mockup content area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* Main camera feed */}
              <div style={{ gridColumn: 'span 2', aspectRatio: '16/9', background: '#050507', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(52,211,153,0.04) 0%, transparent 70%)' }} />
                {/* Skeleton figure */}
                <svg width="80" height="120" viewBox="0 0 80 120" fill="none" style={{ opacity: 0.6 }}>
                  <circle cx="40" cy="14" r="10" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />
                  <line x1="40" y1="24" x2="40" y2="68" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="40" y1="34" x2="15" y2="54" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="40" y1="34" x2="65" y2="54" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="40" y1="68" x2="25" y2="115" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="40" y1="68" x2="55" y2="115" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  {[{x:15,y:54},{x:65,y:54},{x:25,y:115},{x:55,y:115},{x:40,y:46},{x:40,y:68}].map((p,i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgba(52,211,153,0.4)" />
                  ))}
                </svg>
                {/* Bounding box */}
                <div style={{ position: 'absolute', top: '20%', left: '30%', right: '30%', bottom: '8%', border: '1px solid rgba(52,211,153,0.35)', borderRadius: '4px' }} />
                {/* Scan line */}
                <div className="animate-scan" style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }} />
                {/* Corner markers */}
                {[['0%','0%'],['0%','auto'],['auto','0%'],['auto','auto']].map(([t,b], i) => (
                  <div key={i} style={{ position: 'absolute', top: t === '0%' && i < 2 ? '8px' : 'auto', bottom: b === '0%' ? '8px' : 'auto', left: i % 2 === 0 ? '8px' : 'auto', right: i % 2 !== 0 ? '8px' : 'auto', width: '14px', height: '14px', borderTop: i < 2 ? '1.5px solid rgba(52,211,153,0.5)' : 'none', borderBottom: i >= 2 ? '1.5px solid rgba(52,211,153,0.5)' : 'none', borderLeft: i % 2 === 0 ? '1.5px solid rgba(52,211,153,0.5)' : 'none', borderRight: i % 2 !== 0 ? '1.5px solid rgba(52,211,153,0.5)' : 'none' }} />
                ))}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '0.625rem', fontFamily: 'monospace', color: 'rgba(52,211,153,0.7)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>TRACKING: ACTIVE · 29fps</div>
              </div>

              {/* Stats panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'STATUS', value: 'SAFE', color: '#34d399' },
                  { label: 'FALL RISK', value: 'LOW', color: '#93c5fd' },
                  { label: 'MOTION', value: 'NORMAL', color: 'rgba(255,255,255,0.6)' },
                  { label: 'ALERT', value: 'NONE', color: 'rgba(255,255,255,0.35)' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '3.5rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { val: 24, suffix: '/7', label: 'Active monitoring' },
              { val: 3, prefix: '< ', suffix: 's', label: 'Alert response time' },
              { val: 0, label: 'Wearables required' },
              { val: 5, suffix: '+', label: 'Caregivers in circle' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ textAlign: 'center', padding: '0 1rem' }}
              >
                <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'white', lineHeight: 1, marginBottom: '0.5rem' }}>
                  <Counter end={s.val} suffix={s.suffix || ''} prefix={s.prefix || ''} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 5rem' }}
          >
            <div className="badge badge-white" style={{ marginBottom: '1.25rem' }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.035em', color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>
              From detection to alert in seconds
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
              A seamless three-step pipeline designed to keep the most vulnerable members of your family safe.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '3.5rem', left: '16%', right: '16%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)', pointerEvents: 'none', zIndex: 0 }} />

            {[
              { num: '01', icon: '📡', title: 'AI Edge Monitoring', desc: 'Real-time pose and motion analysis runs entirely on-device. Zero video ever leaves your home.', color: 'rgba(79,142,247,0.6)' },
              { num: '02', icon: '🧠', title: 'Pattern Recognition', desc: 'Deep learning models distinguish true falls from everyday movements with exceptional precision.', color: 'rgba(129,140,248,0.6)' },
              { num: '03', icon: '🚨', title: 'Instant Alerts', desc: 'Caregivers receive WhatsApp alerts with photo evidence within 3 seconds of a detected event.', color: 'rgba(52,211,153,0.6)' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  padding: '2rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ y: -6, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: step.color, letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{step.num}</div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1 }}>{step.icon}</div>
                <h3 style={{ fontWeight: 600, color: 'white', fontSize: '1.0625rem', letterSpacing: '-0.015em', marginBottom: '0.625rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section style={{ padding: '0 0 8rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: '4rem' }}
          >
            <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Capabilities</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.035em', color: 'white', lineHeight: 1.1, maxWidth: '500px' }}>
              Built for professional care
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {features.map((f, i) => <FeatureItem key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section style={{ padding: '0 0 8rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 3.5rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'white', marginBottom: '0.875rem' }}>
              The intelligent choice
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.7 }}>
              See how FallingDown AI compares to other elder care solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="compare-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Feature</th>
                    <th style={{ color: '#93c5fd', fontWeight: 700, background: 'rgba(79,142,247,0.05)' }}>FallingDown AI</th>
                    <th>Apple Watch</th>
                    <th>Standard CCTV</th>
                    <th>Panic Button</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['No wearable needed', '✓', '✗', '✓', '✗'],
                    ['Automated fall detection', '✓', 'Partial', '✗', '✗'],
                    ['Privacy-first (no cloud video)', '✓', '✓', '✗', '✓'],
                    ['Audio safety mode', '✓', '✗', '✗', '✗'],
                    ['Instant WhatsApp alerts', '✓', '✗', '✗', '✗'],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{row[0]}</td>
                      <td className="highlight" style={{ textAlign: 'center', fontWeight: 700, color: row[1] === '✓' ? '#34d399' : row[1] === '✗' ? '#fb7185' : '#fbbf24', background: 'rgba(79,142,247,0.04)' }}>{row[1]}</td>
                      {[row[2], row[3], row[4]].map((v, j) => (
                        <td key={j} style={{ textAlign: 'center', color: v === '✓' ? '#34d399' : v === '✗' ? 'rgba(255,255,255,0.2)' : '#fbbf24', fontWeight: v !== '✗' ? 600 : 400 }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section style={{ padding: '0 0 8rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: '4rem 3rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(79,142,247,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.035em', color: 'white', marginBottom: '1.25rem', position: 'relative' }}>
              Give your family peace of mind
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.125rem', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 2.5rem', position: 'relative' }}>
              Set up in minutes. No hardware required. Try FallingDown AI free for 14 days.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Start free trial
              </Link>
              <Link to="/contact" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                Talk to sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .compare-table { font-size: 0.8125rem; }
        }
      `}</style>
    </div>
  );
};

export default Home;
