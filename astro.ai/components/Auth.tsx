import React, { useState } from 'react';
import Button from './Button';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto p-12 bg-[#0B0D12] border border-[#D4AF37]/20 rounded-2xl relative overflow-hidden">
      {/* Decorative corner accents */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#D4AF37] opacity-50"></div>
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#D4AF37] opacity-50"></div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif text-[#D4AF37] tracking-widest mb-2">
          {isLogin ? 'ENTER SANCTUARY' : 'JOIN THE CIRCLE'}
        </h2>
        <p className="font-serif-text text-[#E8E1D6]/60 italic">
          {isLogin ? 'Resume your celestial journey.' : 'Begin your path to the stars.'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest text-[#B89A4A]">Email</label>
          <input 
            type="email" 
            className="w-full bg-[#06070A] border-b border-[#D4AF37]/30 text-[#E8E1D6] py-2 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest text-[#B89A4A]">Password</label>
          <input 
            type="password" 
            className="w-full bg-[#06070A] border-b border-[#D4AF37]/30 text-[#E8E1D6] py-2 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div className="pt-6">
          <Button variant="primary" className="w-full" onClick={onLogin}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase tracking-widest text-[#E8E1D6]/40 hover:text-[#D4AF37] transition-colors"
          >
            {isLogin ? 'Create an account' : 'Already have an account?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;