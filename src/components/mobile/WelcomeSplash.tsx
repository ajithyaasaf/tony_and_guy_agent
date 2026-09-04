'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, X, MessageSquare, ShieldCheck } from 'lucide-react';

interface WelcomeSplashProps {
  onStartBooking?: () => void;
  onOpenChat?: () => void;
}

export function WelcomeSplash({ onStartBooking, onOpenChat }: WelcomeSplashProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const forceWelcome = urlParams.get('welcome') === 'true';
        const hasSeen = sessionStorage.getItem('toniguy_has_seen_welcome');
        
        if (forceWelcome || !hasSeen) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    };

    checkVisibility();

    // Listen for custom event to reopen welcome splash anytime
    const handleReopen = () => {
      setIsVisible(true);
      setIsClosing(false);
    };
    window.addEventListener('toniguy:open-welcome', handleReopen);
    return () => window.removeEventListener('toniguy:open-welcome', handleReopen);
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    try {
      sessionStorage.setItem('toniguy_has_seen_welcome', 'true');
    } catch {}
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleStartBooking = () => {
    handleDismiss();
    if (onStartBooking) {
      onStartBooking();
    } else {
      router.push('/book');
    }
  };

  const handleStartChat = () => {
    handleDismiss();
    if (onOpenChat) {
      onOpenChat();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-brand-black transition-all duration-300 ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background High-Fashion Editorial Imagery */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 scale-105"
        style={{ backgroundImage: "url('/images/welcome_hero.jpg')" }}
      />

      {/* Cinematic Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-brand-white font-black text-lg tracking-widest uppercase">
            TONI&amp;GUY
          </span>
          <span className="bg-brand-white/20 backdrop-blur-md text-brand-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-white/30">
            Concierge
          </span>
        </div>
      </div>

      {/* Bottom Editorial Headline & Action Area */}
      <div className="relative z-10 px-6 pb-10 sm:pb-12 pt-16 flex flex-col justify-end max-w-lg mx-auto w-full">
        {/* Sparkle Tag */}
        <div className="inline-flex items-center space-x-2 bg-brand-white/15 backdrop-blur-md border border-brand-white/25 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-brand-white mb-4 w-fit shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-white" />
          <span>London Couture Hairdressing</span>
        </div>

        {/* Main Bold Editorial Heading */}
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-brand-white tracking-tight leading-[1.04] mb-3 drop-shadow-md">
          Style <br />
          Never <br />
          Stops.
        </h1>

        <p className="text-xs sm:text-sm text-brand-white/85 font-medium leading-relaxed mb-8 max-w-sm drop-shadow">
          Instant salon booking across Chennai. Real-time slots, zero waiting.
        </p>

        {/* Primary CTA: "Let's Start" / "Start Booking" */}
        <div className="space-y-3">
          <button
            onClick={handleStartBooking}
            className="w-full bg-brand-white text-brand-black py-4 rounded-full text-xs font-black uppercase tracking-wider hover:bg-neutral-100 transition-all flex items-center justify-center space-x-2 shadow-2xl active:scale-[0.98] min-h-[50px]"
          >
            <span>Start Booking</span>
            <ArrowRight className="w-4 h-4 text-brand-black" />
          </button>

          {/* Secondary Action: "Chat with AI Concierge" */}
          <button
            onClick={handleStartChat}
            className="w-full bg-brand-black/50 backdrop-blur-md border border-brand-white/30 text-brand-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-black/70 transition flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-brand-red" />
            <span>Chat with AI Concierge</span>
          </button>
        </div>

        {/* Trust Seal */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-brand-white/60 font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official TONI&amp;GUY Chennai Digital Experience</span>
        </div>
      </div>
    </div>
  );
}
