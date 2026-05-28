import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'For Families', path: '/families' },
    { name: 'For Care Centers', path: '/care-centers' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(5,5,7,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#000" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'white', letterSpacing: '-0.02em' }}>
              FallingDown AI
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '980px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: isActive(link.path) ? 'white' : 'rgba(255,255,255,0.55)',
                  background: isActive(link.path) ? 'rgba(255,255,255,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) {
                    e.target.style.color = 'rgba(255,255,255,0.85)';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.path)) {
                    e.target.style.color = 'rgba(255,255,255,0.55)';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  Live Dashboard
                </Link>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '980px',
                }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(79,142,247,0.2)',
                    border: '1px solid rgba(79,142,247,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#93c5fd',
                  }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                </div>
                <button onClick={onLogout} className="btn btn-danger btn-sm">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  padding: '0.5rem 0.875rem',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                >
                  Sign in
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="show-mobile"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4.5px',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: 'block', width: '16px', height: '1.5px', background: 'rgba(255,255,255,0.75)', borderRadius: '2px',
              transition: 'all 0.25s',
              transform: isOpen ? 'translateY(6px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block', width: '16px', height: '1.5px', background: 'rgba(255,255,255,0.75)', borderRadius: '2px',
              transition: 'all 0.25s',
              opacity: isOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: '16px', height: '1.5px', background: 'rgba(255,255,255,0.75)', borderRadius: '2px',
              transition: 'all 0.25s',
              transform: isOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
            }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(5,5,7,0.98)',
          backdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '1rem 1.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
          animation: 'fade-up 0.15s ease',
        }}>
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: isActive(link.path) ? 'white' : 'rgba(255,255,255,0.6)',
                background: isActive(link.path) ? 'rgba(255,255,255,0.06)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              {link.name}
            </Link>
          ))}

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none', width: '100%' }}>
                  Live Dashboard
                </Link>
                <button onClick={onLogout} className="btn btn-danger" style={{ width: '100%' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none', width: '100%' }}>
                  Sign in
                </Link>
                <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%' }}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
