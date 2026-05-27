import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TwitterLogo, LinkedinLogo, GithubLogo } from '@phosphor-icons/react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-white/5 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start max-w-sm">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <ShieldCheck size={28} weight="fill" className="text-teal-400" />
              <span className="text-lg font-bold text-white tracking-tight">FallingDown AI</span>
            </Link>
            <p className="text-sm text-slate-400 text-center md:text-left mb-6">
              From Falling Down to Rising Strong. Transforming any smart camera into an intelligent emergency guardian.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <TwitterLogo size={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <LinkedinLogo size={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <GithubLogo size={24} />
              </a>
            </div>
          </div>
          
          <div className="flex gap-16 text-center md:text-left">
            <div>
              <h3 className="text-white font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><Link to="/families" className="text-sm text-slate-400 hover:text-teal-400">For Families</Link></li>
                <li><Link to="/care-centers" className="text-sm text-slate-400 hover:text-teal-400">For Care Centers</Link></li>
                <li><Link to="/pricing" className="text-sm text-slate-400 hover:text-teal-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-sm text-slate-400 hover:text-teal-400">Contact Us</Link></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-teal-400">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-teal-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 FallingDown AI — Three Fall Team, Haldia Institute of Technology.</p>
          <p className="mt-2 md:mt-0">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
