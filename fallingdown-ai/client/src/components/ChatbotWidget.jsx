import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../api/fallingdown';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m the FallingDown AI assistant. Ask me anything about fall detection, setup, or our plans.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const historyToSend = newHistory.slice(-6);
      const res = await sendChatMessage(userMessage.content, historyToSend);
      const reply = res.data.response || res.data.reply || res.data.message || 'I encountered an error. Please try again.';
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newHistory, { role: 'assistant', content: 'My backend appears to be offline right now. Please try again shortly.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = ['How does fall detection work?', 'What cameras are supported?', 'Tell me about pricing'];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.06 }}
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.2s',
        }}
        aria-label="Toggle chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="open" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.2 }} width="20" height="20" viewBox="0 0 24 24" fill="#000">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: 'calc(1.75rem + 64px)',
              right: '1.75rem',
              width: '360px',
              height: '520px',
              background: 'rgba(8,8,10,0.97)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 99,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="#000" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'white', letterSpacing: '-0.01em' }}>FallingDown AI</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1px' }}>
                  <span className="status-dot online" />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Online · responds instantly</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              className="custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '7px',
                      background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginRight: '0.5rem', marginTop: '2px',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#000"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#000"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  </div>
                  <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: '18px 18px 18px 4px', padding: '0.625rem 0.875rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(79,142,247,0.6)' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions (only when 1 message) */}
            {messages.length === 1 && (
              <div style={{ padding: '0 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '980px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="input"
                  style={{ borderRadius: '14px', fontSize: '0.875rem', padding: '0.625rem 0.875rem' }}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    background: input.trim() && !isTyping ? 'white' : 'rgba(255,255,255,0.08)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !isTyping ? '#000' : 'rgba(255,255,255,0.3)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
