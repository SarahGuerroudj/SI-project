import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your RouteMind AI assistant. How can I optimize your logistics today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: history,
        config: {
          systemInstruction: "You are an expert logistics AI assistant for RouteMind, a logistics and delivery management system. You help users understand features like Shipment Tracking, Route Planning, Billing, and Incident Reporting. You are professional, concise, and helpful.",
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response at this time.";

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the network. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col mb-4 border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 transition-colors">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-between items-center shadow-lg border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-lime-400 rounded-lg shadow-[0_0_10px_rgba(163,230,53,0.5)]">
                <Zap size={16} className="text-slate-900 fill-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">RouteMind AI</h3>
                <p className="text-xs text-lime-600 dark:text-lime-400">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 space-y-4 scroll-smooth transition-colors">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-lime-400 text-slate-900 font-medium rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-lime-600 dark:text-lime-400" />
                  <span className="text-xs text-slate-400">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI..."
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-lime-400 text-slate-900 rounded-full hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(163,230,53,0.3)]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 bg-lime-400 hover:bg-lime-300 text-slate-900 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        >
          <div className="relative">
            <MessageCircle size={28} className="fill-slate-900" />
          </div>
        </button>
      )}
    </div>
  );
};

export default Chatbot;