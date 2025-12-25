import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "px-8 py-3 rounded-full font-serif-text uppercase tracking-widest text-sm transition-all duration-500 ease-out flex items-center justify-center gap-2";
  
  const variants = {
    primary: "border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#06070A] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]",
    secondary: "border border-[#2E3D2F] text-[#B89A4A] hover:border-[#B89A4A] hover:bg-[#0B0D12]",
    ghost: "text-[#E8E1D6] hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/30"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;