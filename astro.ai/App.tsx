import React, { useState } from 'react';
import ThreeZodiac from './components/ThreeZodiac';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import Horoscope from './components/Horoscope';
import Constellation from './components/Constellation';
import Button from './components/Button';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);

  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 z-10 relative px-4">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl text-[#E8E1D6] font-serif tracking-widest">astro.ai</h1>
              <p className="text-[#B89A4A] font-serif-text text-xl md:text-2xl tracking-wide italic">
                Your constellation, interpreted.
              </p>
            </div>
            <div className="flex gap-6">
              <Button onClick={() => setAppState(AppState.AUTH)}>Enter Sanctuary</Button>
              <Button variant="secondary">Learn More</Button>
            </div>
          </div>
        );
      
      case AppState.AUTH:
        return (
          <div className="flex items-center justify-center min-h-[60vh] z-10 relative px-4">
            <Auth onLogin={() => setAppState(AppState.DASHBOARD)} />
          </div>
        );

      case AppState.DASHBOARD:
        return (
          <div className="w-full max-w-6xl mx-auto px-4 py-12 z-10 relative space-y-24">
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-serif text-[#D4AF37] tracking-widest">YOUR DAILY ALIGNMENT</h2>
                <div className="w-24 h-[1px] bg-[#D4AF37]/50 mx-auto"></div>
            </div>

            {/* Horoscope Section */}
            <section className="animate-fade-in">
                <Horoscope />
            </section>

            {/* Constellation Section */}
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 space-y-6 text-center md:text-left">
                    <h3 className="text-2xl font-serif text-[#E8E1D6]">NATAL CONFIGURATION</h3>
                    <p className="text-[#E8E1D6]/70 font-serif-text leading-relaxed">
                        Your birth chart reveals a rare conjunction of water and earth elements.
                        Use this stability to ground your intuitive leaps. The stars favor deliberate action
                        over impulsive movement this week.
                    </p>
                    <Button variant="secondary">Explore Full Chart</Button>
                </div>
                <div className="order-1 md:order-2">
                    <Constellation />
                </div>
            </section>
            
            {/* Chat CTA */}
            <section className="text-center space-y-8 bg-[#0B0D12]/50 p-12 rounded-2xl border border-[#D4AF37]/10">
                <h3 className="text-3xl font-serif text-[#E8E1D6]">CONSULT THE ORACLE</h3>
                <p className="max-w-xl mx-auto text-[#E8E1D6]/60 font-serif-text">
                    Speak with our advanced AI Astrologer for deeper insights into your archetypes and potentials.
                </p>
                <Button onClick={() => setAppState(AppState.CHAT)}>Begin Consultation</Button>
            </section>
          </div>
        );

      case AppState.CHAT:
        return (
          <div className="h-[80vh] w-full max-w-6xl mx-auto px-4 pt-8 z-10 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => setAppState(AppState.DASHBOARD)}>← Return</Button>
                <h2 className="text-xl font-serif text-[#D4AF37] tracking-widest">ORACLE CHAMBER</h2>
                <div className="w-24"></div> {/* Spacer */}
            </div>
            <div className="flex-1">
                <ChatInterface />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#06070A] text-[#E8E1D6]">
      {/* 3D Background - Persistent but subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <ThreeZodiac />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-gradient-to-b from-[#06070A] to-transparent pointer-events-none">
        <span className="font-serif text-[#D4AF37] text-xl tracking-widest pointer-events-auto cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>astro.ai</span>
        <div className="hidden md:flex gap-8 pointer-events-auto">
             <button className="text-[#E8E1D6]/70 hover:text-[#D4AF37] text-xs uppercase tracking-widest transition-colors">Daily</button>
             <button className="text-[#E8E1D6]/70 hover:text-[#D4AF37] text-xs uppercase tracking-widest transition-colors">Charts</button>
             <button className="text-[#E8E1D6]/70 hover:text-[#D4AF37] text-xs uppercase tracking-widest transition-colors">Oracle</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 pt-24 min-h-screen flex flex-col">
        {renderContent()}
        
        {/* Footer */}
        <footer className="mt-auto py-12 border-t border-[#D4AF37]/10 text-center text-[#E8E1D6]/30 text-xs uppercase tracking-widest">
            <p>&copy; 2024 astro.ai. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;