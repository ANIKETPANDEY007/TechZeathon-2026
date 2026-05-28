import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Envelope, Lock, User, Key, Hash, SignIn, 
  UserCheck, ShieldCheck, Globe, GoogleLogo,
  ArrowRight, Backspace, Trash, X
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { loginUser, loginWithPasscode, loginWithSSO, registerUser, fetchUsers } from '../api/fallingdown';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('credentials'); // 'credentials', 'passcode', 'sso'
  const [ssoModal, setSsoModal] = useState(null); // null, 'google', 'microsoft'
  const [customSSO, setCustomSSO] = useState(false);
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoName, setSsoName] = useState('');
  const [dbUsers, setDbUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setDbUsers(res.data);
      } catch (err) {
        console.error('Failed to load registered users for SSO');
      }
    };
    loadUsers();
  }, [ssoModal]);

  const navigate = useNavigate();
  const location = useLocation();

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Passcode States
  const [passcodeEmail, setPasscodeEmail] = useState('');
  const [passcode, setPasscode] = useState('');

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regRole, setRegRole] = useState('caregiver');

  const [isLoading, setIsLoading] = useState(false);

  // Redirection target
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome back, ${data.name}!`);
      if (onLoginSuccess) onLoginSuccess(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please enter all required fields');
      return;
    }

    if (regPasscode && !/^\d{4}$/.test(regPasscode)) {
      toast.error('Quick Passcode must be exactly 4 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        passcode: regPasscode || undefined,
        role: regRole
      });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Account registered! Welcome, ${data.name}`);
      if (onLoginSuccess) onLoginSuccess(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    if (!passcodeEmail) {
      toast.error('Please enter your account email');
      return;
    }
    if (passcode.length !== 4) {
      toast.error('Please enter a 4-digit passcode PIN');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginWithPasscode({ email: passcodeEmail, passcode });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Access granted! Welcome, ${data.name}`);
      if (onLoginSuccess) onLoginSuccess(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Incorrect passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLoginClick = (provider) => {
    setSsoModal(provider);
    setCustomSSO(false);
    setSsoEmail('');
    setSsoName('');
  };

  const executeSSOLogin = async (provider, name, email) => {
    setIsLoading(true);
    setSsoModal(null);
    try {
      const response = await loginWithSSO({
        provider,
        email,
        name
      });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Authorized via ${provider === 'google' ? 'Google' : 'Microsoft'} SSO!`);
      if (onLoginSuccess) onLoginSuccess(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('SSO login authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard keypad functions for quick passcode entry
  const handleKeypadPress = (num) => {
    if (passcode.length < 4) {
      setPasscode(prev => prev + num);
    }
  };

  const handleKeypadBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setPasscode('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden', background: '#000' }}>
      
      {/* Ambient Glows */}
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: '40vw', height: '40vw', maxWidth: '500px', maxHeight: '500px', background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '35vw', height: '35vw', maxWidth: '400px', maxHeight: '400px', background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.25rem', position: 'relative', zIndex: 1, backdropFilter: 'blur(40px)' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#000" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
            {isLogin 
              ? 'Secure fall monitoring & distress response' 
              : 'Sign up to configure live ML sensors and alerts'}
          </p>
        </div>

        {/* Login Tabs */}
        {isLogin && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
            {[{key: 'credentials', label: '🔑 Password'}, {key: 'passcode', label: '# Quick PIN'}, {key: 'sso', label: '⚡ SSO'}].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setAuthMethod(tab.key); handleKeypadClear(); }}
                style={{
                  flex: 1, padding: '0.5rem 0.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
                  background: authMethod === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: authMethod === tab.key ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LOGIN - CREDENTIALS */}
          {isLogin && authMethod === 'credentials' && (
            <motion.form
              key="login-credentials"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@carecenter.com"
                  className="input"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </motion.form>
          )}

          {/* LOGIN - PASSCODE KEYPAD */}
          {isLogin && authMethod === 'passcode' && (
            <motion.form
              key="login-passcode"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasscodeSubmit}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Account Email</label>
                <input
                  type="email"
                  value={passcodeEmail}
                  onChange={(e) => setPasscodeEmail(e.target.value)}
                  placeholder="name@carecenter.com"
                  className="input"
                  required
                />
              </div>

              {/* PIN Indicator */}
              <div style={{ display: 'flex', gap: '0.75rem', margin: '0.5rem 0' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      border: `1.5px solid ${i < passcode.length ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
                      background: i < passcode.length ? 'white' : 'transparent',
                      boxShadow: i < passcode.length ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '100%', maxWidth: '260px' }}>
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    style={{
                      height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)', color: 'white', fontWeight: 700, fontSize: '1.125rem',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >{num}</button>
                ))}
                <button type="button" onClick={handleKeypadClear} style={{ height: '48px', borderRadius: '12px', border: '1px solid rgba(251,113,133,0.15)', background: 'rgba(251,113,133,0.06)', color: '#fb7185', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s' }}>CLR</button>
                <button type="button" onClick={() => handleKeypadPress(0)} style={{ height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'white', fontWeight: 700, fontSize: '1.125rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>0</button>
                <button type="button" onClick={handleKeypadBackspace} style={{ height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6"/></svg>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || passcode.length !== 4}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isLoading ? 'Verifying...' : 'Verify PIN'}
              </button>
            </motion.form>
          )}

          {/* LOGIN - MOCK SSO */}
          {isLogin && authMethod === 'sso' && (
            <motion.div 
              key="login-sso"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <p className="text-xs text-center text-slate-400 mb-4">
                Use professional Single Sign-On methods to quickly login in enterprise/care environments.
              </p>

              <button 
                onClick={() => handleSSOLoginClick('google')}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <GoogleLogo size={20} className="text-red-400" /> Sign in with Google SSO
              </button>

              <button 
                onClick={() => handleSSOLoginClick('microsoft')}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <div className="grid grid-cols-2 gap-[2px] w-4 h-4 flex-shrink-0">
                  <div className="bg-[#f25022] w-1.5 h-1.5"></div>
                  <div className="bg-[#7fba00] w-1.5 h-1.5"></div>
                  <div className="bg-[#00a4ef] w-1.5 h-1.5"></div>
                  <div className="bg-[#ffb900] w-1.5 h-1.5"></div>
                </div>
                Sign in with Microsoft Azure
              </button>
            </motion.div>
          )}

          {/* SIGN UP / REGISTER */}
          {!isLogin && (
            <motion.form 
              key="register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegisterSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name" className="input" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Email Address</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="name@carecenter.com" className="input" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Password</label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimum 6 characters" className="input" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Quick PIN <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.5 }}>(optional)</span></label>
                <input type="text" value={regPasscode} onChange={(e) => setRegPasscode(e.target.value)} placeholder="4-digit PIN" maxLength={4} className="input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Role</label>
                <select value={regRole} onChange={(e) => setRegRole(e.target.value)} className="input" style={{ cursor: 'pointer' }}>
                  <option value="caregiver">Caregiver / Staff</option>
                  <option value="family">Family Member</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer State Toggle */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setIsLogin(false); handleKeypadClear(); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setIsLogin(true); handleKeypadClear(); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Render SSO Modals via React Portal */}
      {ssoModal === 'google' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-default font-sans text-slate-800">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 flex flex-col items-center animate-[fadeIn_0.2s_ease-out]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSsoModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Google Logo */}
            <div className="flex items-center gap-1.5 mb-4 select-none">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.6 5.6 0 0 1 8.35 12.8a5.6 5.6 0 0 1 5.64-5.714c2.25 0 3.992 1.157 4.847 2.1l3.182-3.182C20.083 4.168 17.275 2.8 14 2.8a10 10 0 1 0 0 20c5.56 0 10-4.44 10-10 0-.84-.078-1.7-.22-2.515H12.24z"/>
                <path fill="#4285f4" d="M23.78 10.285H12.24V14.4h6.887a7.2 7.2 0 0 1-3.136 4.714v3.136h5.068C24.015 19.5 25 15.5 25 11.24a10.8 10.8 0 0 0-.22-2.515z"/>
                <path fill="#fabc05" d="M13.99 22.8c-2.485 0-4.708-.985-6.3-2.585l-3.218 3.218A9.9 9.9 0 0 0 14 22.8c3.275 0 6.083-1.368 8.018-3.564l-5.068-3.136c-1.042.848-2.617 1.4-2.96 1.4z"/>
                <path fill="#34a853" d="M7.69 14.415A5.6 5.6 0 0 1 7.6 12.8a5.6 5.6 0 0 1 .09-1.615L4.472 7.967A9.9 9.9 0 0 0 4 12.8c0 1.768.423 3.428 1.173 4.9L7.69 14.415z"/>
              </svg>
              <span className="font-bold text-slate-700 text-lg">Google</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Choose an account</h3>
            <p className="text-xs text-slate-500 mb-6">to continue to <span className="font-semibold text-slate-700">FallingDown AI</span></p>

            <div className="w-full">
              {!customSSO ? (
                <>
                  {/* Account List */}
                  {dbUsers.length > 0 ? (
                    dbUsers.map(u => (
                      <div 
                        key={u._id}
                        onClick={() => executeSSOLogin('google', u.name, u.email)}
                        className="w-full p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer group mb-2 text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm uppercase">
                          {u.name[0]}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div 
                        onClick={() => executeSSOLogin('google', 'Dr. Sarah Jenkins', 'sarah.jenkins@carefacility.com')}
                        className="w-full p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer group mb-2 text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                          SJ
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors">Dr. Sarah Jenkins</div>
                          <div className="text-[10px] text-slate-500">sarah.jenkins@carefacility.com</div>
                        </div>
                      </div>

                      <div 
                        onClick={() => executeSSOLogin('google', 'Alex Carter', 'alex.carter@carefacility.com')}
                        className="w-full p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer group mb-4 text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                          AC
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Alex Carter (Caregiver)</div>
                          <div className="text-[10px] text-slate-500">alex.carter@carefacility.com</div>
                        </div>
                      </div>
                    </>
                  )}

                  <button 
                    onClick={() => setCustomSSO(true)}
                    className="w-full py-2 px-4 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-teal-100 cursor-pointer mt-2"
                  >
                    Use another account
                  </button>
                </>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Google User Name</label>
                    <input 
                      type="text" 
                      value={ssoName}
                      onChange={(e) => setSsoName(e.target.value)}
                      placeholder="Jane Doe" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Google Email Address</label>
                    <input 
                      type="email" 
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                      placeholder="jane.doe@gmail.com" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setCustomSSO(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={() => executeSSOLogin('google', ssoName, ssoEmail)}
                      disabled={!ssoName || !ssoEmail}
                      className="flex-1 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-8 text-center leading-relaxed">
              To continue, Google will share your name, email address, and profile picture with FallingDown AI. Review FallingDown AI's <span className="text-teal-600 hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-teal-600 hover:underline cursor-pointer">Terms of Service</span>.
            </p>
          </div>
        </div>,
        document.body
      )}

      {ssoModal === 'microsoft' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-default font-sans text-slate-800">
          <div className="relative max-w-sm w-full bg-white shadow-2xl border border-slate-300 p-9 flex flex-col text-left animate-[fadeIn_0.2s_ease-out]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSsoModal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Microsoft CSS Logo */}
            <div className="grid grid-cols-2 gap-[2px] w-6 h-6 mb-6 select-none">
              <div className="bg-[#f25022] w-2.5 h-2.5"></div>
              <div className="bg-[#7fba00] w-2.5 h-2.5"></div>
              <div className="bg-[#00a4ef] w-2.5 h-2.5"></div>
              <div className="bg-[#ffb900] w-2.5 h-2.5"></div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-1 select-none">Pick an account</h3>
            <p className="text-xs text-slate-500 mb-6">to sign in to <span className="font-semibold text-slate-700">FallingDown AI Gateway</span></p>

            <div className="w-full">
              {!customSSO ? (
                <>
                  {/* Account List */}
                  {dbUsers.length > 0 ? (
                    dbUsers.map(u => (
                      <div 
                        key={u._id}
                        onClick={() => executeSSOLogin('microsoft', u.name, u.email)}
                        className="w-full p-2.5 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer group border-b border-slate-100 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0067b8] transition-colors">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div 
                        onClick={() => executeSSOLogin('microsoft', 'Superintendent Emma', 'emma.supervisor@carenet.onmicrosoft.com')}
                        className="w-full p-2.5 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer group border-b border-slate-100 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#f25022]/10 text-[#f25022] font-bold flex items-center justify-center text-xs">
                          ES
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0067b8] transition-colors">Superintendent Emma</div>
                          <div className="text-[10px] text-slate-500">emma.supervisor@carenet.onmicrosoft.com</div>
                        </div>
                      </div>

                      <div 
                        onClick={() => executeSSOLogin('microsoft', 'Duty Officer David', 'david.duty@carenet.onmicrosoft.com')}
                        className="w-full p-2.5 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer group border-b border-slate-100 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#00a4ef]/10 text-[#00a4ef] font-bold flex items-center justify-center text-xs">
                          DD
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0067b8] transition-colors">Duty Officer David</div>
                          <div className="text-[10px] text-slate-500">david.duty@carenet.onmicrosoft.com</div>
                        </div>
                      </div>
                    </>
                  )}

                  <button 
                    onClick={() => setCustomSSO(true)}
                    className="w-full text-left py-2.5 px-2 hover:bg-slate-50 text-xs font-semibold text-[#0067b8] flex items-center gap-3 cursor-pointer mt-2"
                  >
                    <div className="w-8 h-8 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-500 text-lg">
                      +
                    </div>
                    Use another account
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={ssoName}
                      onChange={(e) => setSsoName(e.target.value)}
                      placeholder="User Name" 
                      className="w-full border-b border-slate-300 focus:border-[#0067b8] py-1.5 text-xs text-slate-900 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <input 
                      type="email" 
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                      placeholder="someone@example.com" 
                      className="w-full border-b border-slate-300 focus:border-[#0067b8] py-1.5 text-xs text-slate-900 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setCustomSSO(false)}
                      className="py-1.5 px-4 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={() => executeSSOLogin('microsoft', ssoName, ssoEmail)}
                      disabled={!ssoName || !ssoEmail}
                      className="py-1.5 px-4 text-xs font-semibold text-white bg-[#0067b8] hover:bg-[#005da6] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 mt-10 leading-normal">
              This system is protected. Access is subject to policy monitoring and organizational terms.
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Login;
