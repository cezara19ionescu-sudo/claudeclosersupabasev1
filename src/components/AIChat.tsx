import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { SmartSearchEngine } from '../utils/CloserSmartSearch';

const engine = new SmartSearchEngine();

export function CloserAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Hi! I am the Closer AI assistant. How can I help you find the right professional today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const results = engine.search(userMsg);
      if (results && results.aiResponse) {
        const resp = results.aiResponse;
        let content = resp.friendly_message;
        if (resp.estimated_price) {
          content += `\n\nEstimated Price: ${resp.estimated_price}`;
        }
        if (resp.safety_tip) {
          content += `\n\nSafety Tip: ${resp.safety_tip}`;
        }
        setMessages(prev => [...prev, { role: 'ai', content }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble processing that right now. Could you try rephrasing?" }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-teal-400 to-[#2d5a5a] text-white shadow-lg shadow-teal-500/30 flex items-center justify-center z-40 premium-btn hover:shadow-xl hover:shadow-teal-500/40"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-5 w-[300px] h-[400px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-100 overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-[#1a4d4d] p-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span className="text-white font-bold text-sm">Closer AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === 'user' ? "bg-[#1a4d4d] text-white self-end rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm shadow-sm whitespace-pre-wrap"
                )}>
                  {m.content}
                </div>
              ))}
              {isLoading && (
                <div className="bg-white border border-slate-200 text-slate-400 self-start rounded-2xl rounded-tl-sm shadow-sm px-3 py-2 text-sm flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 border-t border-slate-100 bg-white flex gap-2 shrink-0">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-slate-50 rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a4d4d]/20 transition-all font-medium text-slate-700"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-[#1a4d4d] text-white flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
