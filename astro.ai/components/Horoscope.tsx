import React from 'react';

const Horoscope: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
        <div className="inline-block border-b border-[#D4AF37] pb-2 mb-4">
            <span className="font-serif-text text-[#B89A4A] italic text-lg">October 24, 2024</span>
        </div>
        
        <h3 className="font-serif text-3xl text-[#E8E1D6] leading-snug">
            Today, the moon enters your sector of reflection.
        </h3>
        
        <p className="font-serif-text text-lg text-[#E8E1D6]/80 leading-relaxed">
            The alignment of Mars and Venus suggests a potential for creative conflict. 
            Do not shy away from friction; it is the heat that forges the strongest blade. 
            Seek silence in the afternoon to recalibrate your intentions. A message from an unexpected source
            may carry the clarity you have been seeking.
        </p>

        <div className="flex justify-center gap-4 pt-4">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-[#2E3D2F] flex items-center justify-center text-[#B89A4A]">
                   ☽
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#E8E1D6]/50">Moon</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-[#2E3D2F] flex items-center justify-center text-[#B89A4A]">
                   ♂
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#E8E1D6]/50">Mars</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-[#2E3D2F] flex items-center justify-center text-[#B89A4A]">
                   ♃
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#E8E1D6]/50">Jupiter</span>
            </div>
        </div>
    </div>
  );
};

export default Horoscope;