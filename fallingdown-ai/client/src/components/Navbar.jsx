import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, X, ShieldCheck } from '@phosphor-icons/react';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'For Families', path: '/families' },
    { name: 'For Care Centers', path: '/care-centers' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-panel border-x-0 border-t-0 rounded-none bg-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck size={32} weight="fill" className="text-teal-400" />
              <span className="text-xl font-bold text-white tracking-tight">FallingDown AI</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'text-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/dashboard" className="btn-outline px-4 py-2">
                    Live Dashboard
                  </Link>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm shadow-[0_0_8px_rgba(45,212,191,0.15)]">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <div className="text-xs font-bold text-white max-w-[80px] truncate">{user.name}</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">{user.role}</div>
                    </div>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary px-5 py-2.5 ml-4">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-panel border-x-0 border-t-0 rounded-none bg-navy-900/95 absolute w-full left-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive(link.path)
                    ? 'bg-white/10 text-teal-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user.name}</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">{user.role}</div>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center btn-outline py-2.5 rounded-xl"
                >
                  Live Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="block w-full text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 py-2.5 rounded-xl font-bold cursor-pointer transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-4 btn-primary py-2.5 rounded-xl"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
