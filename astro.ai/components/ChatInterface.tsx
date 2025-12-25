import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToOracle } from '../services/geminiService';
import { Message } from '../types';
import Button from './Button';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Greetings. I am the Astro.ai Oracle. How may the stars illuminate your path today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToOracle(userMsg.text);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-[#0B0D12]/50 border border-[#D4AF37]/20 rounded-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#D4AF37]/10 flex items-center justify-between">
        <h3 className="font-serif text-[#D4AF37] tracking-widest text-lg">ORACLE AGENT</h3>
        <span className="text-[#2E3D2F] text-xs uppercase tracking-widest border border-[#2E3D2F] px-2 py-1 rounded">Live Connection</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-4 rounded-lg font-serif-text leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#2E3D2F]/30 text-[#E8E1D6] border border-[#2E3D2F]' 
                  : 'bg-[#06070A]/80 text-[#B89A4A] border border-[#D4AF37]/20'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                 <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#06070A]/80 text-[#B89A4A] border border-[#D4AF37]/20 p-4 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#D4AF37]/10 bg-[#0B0D12]">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask the stars..."
            className="flex-1 bg-[#06070A] border border-[#D4AF37]/30 text-[#E8E1D6] px-4 py-3 rounded focus:outline-none focus:border-[#D4AF37] font-serif-text placeholder-[#E8E1D6]/30 transition-colors"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading} className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}>
            <span className="material-icons">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;