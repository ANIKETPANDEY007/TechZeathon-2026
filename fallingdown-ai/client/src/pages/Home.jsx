import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, Pulse, Camera, ShieldCheck, 
  WhatsappLogo, Watch, ArrowsClockwise, Phone
} from '@phosphor-icons/react';
import FeatureCard from '../components/FeatureCard';
import { checkMLStatus } from '../api/fallingdown';

const Home = () => {
  const [mlStatus, setMlStatus] = useState('Checking...');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkMLStatus();
        setMlStatus('NORMAL');
        setIsLive(true);
      } catch (error) {
        setMlStatus('OFFLINE');
        setIsLive(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="overflow-hidden"
      >
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-navy-950 overflow-hidden">
          {/* Radial glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left side text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-teal-500/30 bg-teal-500/10">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <span className="text-teal-400 text-sm font-semibold tracking-wide uppercase">Live AI Monitoring Active</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                From Falling Down to <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Rising Strong.</span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform any smart camera into an intelligent emergency guardian for your loved ones. Instant alerts, zero wearables, complete privacy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Link to="/dashboard" className="btn-primary w-full sm:w-auto text-lg group">
                  Try Live Demo <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <button className="btn-outline w-full sm:w-auto text-lg flex items-center justify-center gap-2 group border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
                  <PlayCircle size={24} weight="fill" className="text-slate-400 group-hover:text-white transition-colors" /> 
                  Watch How It Works
                </button>
              </div>
            </div>

            {/* Right side mockup */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="glass-panel p-2 rounded-3xl border-white/10 shadow-2xl shadow-teal-500/10 relative z-10">
                <div className="bg-navy-950 rounded-2xl overflow-hidden border border-white/5 relative aspect-[4/3] flex flex-col">
                  {/* Camera Header */}
                  <div className="bg-navy-900/80 p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-sm absolute top-0 w-full z-20">
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                      <Camera size={20} className="text-teal-400" />
                      Living Room Cam 01
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      AI Status: 
                      <span className={`px-2 py-1 rounded font-bold ${isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {mlStatus}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mock Camera Feed Background */}
                  <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at center, #14b8a6 0%, transparent 70%)'}}></div>
                    
                    {/* Simulated skeletal tracking overlay */}
                    <div className="relative w-48 h-64 border-2 border-teal-500/30 rounded-lg flex items-center justify-center">
                      <div className="absolute top-2 left-2 text-[10px] text-teal-400 font-mono tracking-widest bg-teal-900/50 px-1 rounded">TRACKING: ACTIVE</div>
                      
                      {/* Abstract skeleton */}
                      <svg viewBox="0 0 100 150" className="w-24 h-auto stroke-teal-400 stroke-2 fill-none overflow-visible">
                        <circle cx="50" cy="20" r="10" className="fill-teal-400/20" /> {/* Head */}
                        <line x1="50" y1="30" x2="50" y2="80" /> {/* Spine */}
                        <line x1="50" y1="40" x2="20" y2="60" /> {/* L Arm */}
                        <line x1="50" y1="40" x2="80" y2="60" /> {/* R Arm */}
                        <line x1="50" y1="80" x2="30" y2="140" /> {/* L Leg */}
                        <line x1="50" y1="80" x2="70" y2="140" /> {/* R Leg */}
                        {/* Joints */}
                        <circle cx="20" cy="60" r="3" className="fill-teal-300" />
                        <circle cx="80" cy="60" r="3" className="fill-teal-300" />
                        <circle cx="30" cy="140" r="3" className="fill-teal-300" />
                        <circle cx="70" cy="140" r="3" className="fill-teal-300" />
                      </svg>
                      
                      {/* Scanning line animation */}
                      <div className="absolute top-0 w-full h-1 bg-teal-400/50 shadow-[0_0_10px_#2dd4bf] animate-[scan_3s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind mockup */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-white/5 bg-navy-900/50 py-10 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-slate-400">Active Monitoring</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-white mb-1">&lt; 3s</div>
                <div className="text-sm text-slate-400">Alert Time</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-slate-400">Wearables Needed</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-white mb-1">3-Layer</div>
                <div className="text-sm text-slate-400">Care-Circle Alerting</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">How FallingDown AI Works</h2>
              <p className="text-lg text-slate-400">A seamless pipeline from detection to intervention, designed to save critical minutes.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 -translate-y-1/2 z-0"></div>
              
              <div className="glass-panel p-8 text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-6 border border-teal-500/20">
                  <Pulse size={32} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. AI Edge Monitoring</h3>
                <p className="text-slate-400 text-sm">Pose and motion analysis runs locally on the device. No video is ever sent to the cloud, ensuring total privacy.</p>
              </div>
              
              <div className="glass-panel p-8 text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                  <ShieldCheck size={32} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Privacy-Aware Zones</h3>
                <p className="text-slate-400 text-sm">In sensitive areas like bathrooms, the camera disables video and switches to Audio Safety Mode to detect distress sounds.</p>
              </div>
              
              <div className="glass-panel p-8 text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                  <WhatsappLogo size={32} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Instant Alerts</h3>
                <p className="text-slate-400 text-sm">Upon detection, an alert with a snapshot is instantly sent to the Care-Circle via WhatsApp and SMS.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-navy-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade Features</h2>
              <p className="text-lg text-slate-400">Everything you need for comprehensive safety monitoring.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Pulse size={24} weight="bold" />}
                title="Fall Detection"
                description="Advanced skeletal tracking identifies falls with high accuracy while ignoring pets or normal sitting."
                delay={0.1}
              />
              <FeatureCard 
                icon={<ShieldCheck size={24} weight="bold" />}
                title="Audio Safety Mode"
                description="Specialized privacy zones use acoustic analysis to detect calls for help or impact sounds."
                delay={0.2}
              />
              <FeatureCard 
                icon={<WhatsappLogo size={24} weight="bold" />}
                title="WhatsApp Alerts"
                description="Direct integration with WhatsApp provides instant notifications with photo evidence to caregivers."
                delay={0.3}
              />
              <FeatureCard 
                icon={<Watch size={24} weight="bold" />}
                title="No Wearable Required"
                description="Elderly individuals don't need to remember to wear or charge panic buttons or smartwatches."
                delay={0.4}
              />
              <FeatureCard 
                icon={<ArrowsClockwise size={24} weight="bold" />}
                title="Retrofit Capability"
                description="Connects to your existing RTSP or IP cameras, eliminating the need to buy expensive proprietary hardware."
                delay={0.5}
              />
              <FeatureCard 
                icon={<Phone size={24} weight="bold" />}
                title="Care-Circle Escalation"
                description="Intelligently escalates from local siren to primary caregiver, then to extended family if unacknowledged."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-navy-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why FallingDown AI?</h2>
            </div>
            
            <div className="glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="p-4 font-semibold text-slate-300">Feature</th>
                      <th className="p-4 font-bold text-teal-400 bg-teal-500/5">FallingDown AI</th>
                      <th className="p-4 font-semibold text-slate-400">Apple Watch</th>
                      <th className="p-4 font-semibold text-slate-400">Standard CCTV</th>
                      <th className="p-4 font-semibold text-slate-400">Panic Button</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {[
                      { feature: 'No Wearable Required', fd: '✅', aw: '❌', cctv: '✅', pb: '❌' },
                      { feature: 'Automated Fall Detection', fd: '✅', aw: '⚠️ Partial', cctv: '❌', pb: '❌' },
                      { feature: 'Privacy-Aware (No Cloud Video)', fd: '✅', aw: '✅', cctv: '❌', pb: '✅' },
                      { feature: 'Bathroom Audio Safety', fd: '✅', aw: '❌', cctv: '❌', pb: '❌' },
                      { feature: 'Instant WhatsApp Alert', fd: '✅', aw: '❌', cctv: '❌', pb: '❌' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-slate-300">{row.feature}</td>
                        <td className="p-4 bg-teal-500/5 text-center text-lg">{row.fd}</td>
                        <td className="p-4 text-center text-slate-500">{row.aw}</td>
                        <td className="p-4 text-center text-slate-500">{row.cctv}</td>
                        <td className="p-4 text-center text-slate-500">{row.pb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </motion.div>
    </AnimatePresence>
  );
};

export default Home;
