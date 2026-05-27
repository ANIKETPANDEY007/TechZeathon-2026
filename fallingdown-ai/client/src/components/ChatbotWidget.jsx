import React, { useState, useRef, useEffect } from 'react';
import { Robot, X, PaperPlaneRight, DotsThree } from '@phosphor-icons/react';
import { sendChatMessage } from '../api/fallingdown';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am the FallingDown AI Care Assistant. How can I help you understand our platform today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      // Send max last 6 messages to preserve context but limit payload size
      const historyToSend = newHistory.slice(-6);
      const res = await sendChatMessage(userMessage.content, historyToSend);
      
      setMessages([...newHistory, { role: 'assistant', content: res.data.response || res.data.reply || res.data.message || 'I encountered an error connecting to the AI.' }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, my backend seems to be offline right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-400 text-navy-950 flex items-center justify-center shadow-lg shadow-teal-500/20 z-50 transition-transform hover:scale-105"
      >
        {isOpen ? <X size={28} weight="bold" /> : <Robot size={28} weight="fill" className="animate-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[380px] h-[500px] glass-panel bg-navy-900/95 shadow-2xl flex flex-col z-50 overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-navy-950/80 p-4 border-b border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Robot size={24} weight="fill" className="text-teal-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">FallingDown Assistant</h3>
              <p className="text-xs text-teal-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-400 inline-block"></span> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-xs text-center text-slate-500 mb-4">
              Ask me anything about the platform
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-teal-500/20 text-teal-50 rounded-tr-sm border border-teal-500/30' 
                      : 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                  <DotsThree size={24} weight="bold" className="text-teal-400 animate-pulse" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-navy-950/80 border-t border-white/10">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="h-10 w-10 rounded-xl bg-teal-500 text-navy-950 flex items-center justify-center hover:bg-teal-400 disabled:opacity-50 transition-colors"
              >
                <PaperPlaneRight size={20} weight="fill" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
