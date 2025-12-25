import React from 'react';

const Constellation: React.FC = () => {
  return (
    <div className="relative aspect-square max-w-md mx-auto border border-[#D4AF37]/10 rounded-full flex items-center justify-center p-8 bg-[#0B0D12]/30">
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-80">
            {/* Background Rings */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-30" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF37" strokeWidth="0.5" className="opacity-20" />
            
            {/* Abstract Constellation (e.g. Cassiopeia-ish) */}
            <g className="stroke-[#D4AF37] fill-[#D4AF37]">
                <line x1="50" y1="80" x2="70" y2="120" strokeWidth="1" />
                <line x1="70" y1="120" x2="100" y2="100" strokeWidth="1" />
                <line x1="100" y1="100" x2="130" y2="130" strokeWidth="1" />
                <line x1="130" y1="130" x2="160" y2="90" strokeWidth="1" />

                <circle cx="50" cy="80" r="2" />
                <circle cx="70" cy="120" r="2" />
                <circle cx="100" cy="100" r="3" />
                <circle cx="130" cy="130" r="2" />
                <circle cx="160" cy="90" r="2" />
            </g>
        </svg>
        <div className="absolute bottom-4 text-center">
             <span className="font-serif text-[#D4AF37] text-xl tracking-widest">SCORPIO</span>
             <p className="text-[#E8E1D6]/50 text-xs uppercase tracking-wider mt-1">Sun Sign</p>
        </div>
    </div>
  );
};

export default Constellation;