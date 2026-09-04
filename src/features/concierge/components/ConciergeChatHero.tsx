'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/features/booking/context/BookingContext';
import { parseNaturalLanguageInput, ExtractedBookingIntent } from '@/features/concierge/engine/intentParser';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OFFERS } from '@/data/offers';
import { MOCK_OUTLETS } from '@/data/outlets';
import { formatPrice, formatDuration, formatDisplayTime } from '@/lib/utils';
import { 
  Sparkles, Send, Calendar, MapPin, Tag, Scissors, 
  ArrowRight, CheckCircle2, ChevronRight, Clock, Star, 
  RotateCcw, HelpCircle, PhoneCall, ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intentData?: ExtractedBookingIntent;
  quickActions?: { label: string; action: () => void }[];
  timestamp: string;
}

export function ConciergeChatHero() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Welcome to TONI&GUY. I am your personal digital concierge. You can tell me what you'd like to book in plain words, or choose any quick option below.",
      timestamp: 'Just now',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'I want a haircut at Anna Nagar tomorrow at 7 PM',
    'Haircut and beard trim this Saturday after 6 PM',
    'Men Haircut + Beard + Hair Spa offer combo',
    'Find nearest salon in Nungambakkam',
    'Consultation for subtle hair colour transformation'
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend || inputText).trim();
    if (!raw) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: raw,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // 2. Parse Natural Language & Process Adaptive Logic
    setTimeout(() => {
      const parsed = parseNaturalLanguageInput(raw);

      // Apply extracted details directly to booking reducer to preserve context
      if (parsed.offer) {
        const includedSrvs = MOCK_SERVICES.filter((s) => parsed.offer?.serviceIds.includes(s.id));
        dispatch({ type: 'SET_OFFER', payload: { offer: parsed.offer, services: includedSrvs } });
      } else if (parsed.services.length > 0) {
        dispatch({ type: 'SET_SERVICES', payload: parsed.services });
      }

      if (parsed.outlet) {
        dispatch({ type: 'SET_OUTLET', payload: parsed.outlet });
      } else if (parsed.locationQuery) {
        dispatch({ type: 'SET_LOCATION_PREFERENCE', payload: parsed.locationQuery });
      }

      if (parsed.date) {
        dispatch({ type: 'SET_DATE', payload: parsed.date });
      }

      if (parsed.timePreference) {
        dispatch({ type: 'SET_TIME_PREFERENCE', payload: parsed.timePreference });
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: parsed.responseMessage,
        intentData: parsed,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="w-full bg-brand-white border border-brand-border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
      {/* Header bar */}
      <div className="bg-brand-black text-brand-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-brand-red shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-brand-white flex items-center space-x-2">
              <span>TONI&amp;GUY AI Concierge</span>
              <span className="bg-brand-red text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-brand-white">
                Live AI
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">
              Real-time slot availability &amp; smart booking
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Encrypted Booking</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-[360px] max-h-[380px] sm:max-h-[460px] overflow-y-auto space-y-4 bg-brand-surface/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''} animate-fade-in`}
          >
            {/* Avatar icon */}
            {msg.sender === 'assistant' ? (
              <div className="w-7 h-7 rounded-full bg-brand-black text-brand-red flex items-center justify-center shrink-0 border border-neutral-800 shadow-sm mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-red text-brand-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm mt-0.5">
                U
              </div>
            )}

            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[78%]`}>
              <div
                className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-black text-brand-white rounded-tr-none shadow-md font-medium'
                    : 'bg-brand-white text-brand-black border border-brand-border rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Render Structured UI inline when data is extracted */}
                {msg.intentData && (
                  <div className="mt-3.5 pt-3 border-t border-brand-border space-y-2.5 text-xs">
                    {/* Extracted service pill */}
                    {msg.intentData.services.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-brand-muted">Selected Services:</span>
                        {msg.intentData.services.map((s) => (
                          <span key={s.id} className="bg-brand-subtle border border-brand-border text-brand-black px-2 py-1 rounded-md font-bold">
                            {s.name} ({formatPrice(s.price)})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Extracted outlet pill */}
                    {msg.intentData.outlet && (
                      <div className="flex items-center space-x-1.5 text-brand-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <span><strong>Outlet:</strong> {msg.intentData.outlet.name}</span>
                      </div>
                    )}

                    {/* Extracted date */}
                    {msg.intentData.date && (
                      <div className="flex items-center space-x-1.5 text-brand-muted">
                        <Calendar className="w-3.5 h-3.5 text-brand-black shrink-0" />
                        <span><strong>Date:</strong> {msg.intentData.dateLabel || msg.intentData.date}</span>
                      </div>
                    )}

                    {/* Extracted time preference */}
                    {msg.intentData.timePreference && (
                      <div className="flex items-center space-x-1.5 text-brand-muted">
                        <Clock className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <span>
                          <strong>Time:</strong>{' '}
                          {msg.intentData.timePreference.time
                            ? `${msg.intentData.timePreference.type === 'AFTER' ? 'After ' : msg.intentData.timePreference.type === 'BEFORE' ? 'Before ' : ''}${formatDisplayTime(msg.intentData.timePreference.time)}`
                            : msg.intentData.timePreference.type}
                        </span>
                      </div>
                    )}

                    {/* Extracted offer */}
                    {msg.intentData.offer && (
                      <div className="p-3 bg-brand-red-subtle border border-brand-red/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-brand-black">{msg.intentData.offer.name}</div>
                          <span className="bg-brand-red text-brand-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            Save {formatPrice(msg.intentData.offer.savings)}
                          </span>
                        </div>
                        <div className="text-xs text-brand-red font-bold mt-1">
                          Exclusive Price: {formatPrice(msg.intentData.offer.offerPrice)}
                        </div>
                      </div>
                    )}

                    {/* Sister Salon Smart Fallback Card */}
                    {msg.intentData.sisterFallback && (
                      <div className="p-3.5 bg-brand-surface border border-brand-red/30 rounded-xl space-y-2.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-brand-red text-brand-white px-2 py-0.5 rounded-full">
                            Nearby Salon Alternative
                          </span>
                          <span className="text-[11px] font-extrabold text-brand-muted">
                            📍 {msg.intentData.sisterFallback.distanceFormatted}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-brand-black">
                          {msg.intentData.sisterFallback.sisterOutlet.name}
                        </div>
                        <div className="text-[11px] text-brand-muted">
                          Available Slot: <strong className="text-brand-black font-extrabold">{msg.intentData.sisterFallback.suggestedSlot.displayTime}</strong> ({msg.intentData.sisterFallback.date})
                        </div>
                        <button
                          onClick={() => {
                            if (msg.intentData?.sisterFallback) {
                              dispatch({ type: 'SET_OUTLET', payload: msg.intentData.sisterFallback.sisterOutlet });
                              dispatch({ type: 'SELECT_SLOT', payload: msg.intentData.sisterFallback.suggestedSlot });
                              router.push('/book');
                            }
                          }}
                          className="w-full bg-brand-black text-brand-white py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center space-x-2 shadow-sm active:scale-95"
                        >
                          <span>Switch to {msg.intentData.sisterFallback.sisterOutlet.area} ({msg.intentData.sisterFallback.suggestedSlot.displayTime})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
                        </button>
                      </div>
                    )}

                    {/* Action CTA inside conversation */}
                    <div className="pt-2">
                      {!msg.intentData.sisterFallback ? (
                        <button
                          onClick={() => router.push('/book')}
                          className="inline-flex items-center space-x-2 bg-brand-red text-brand-white px-5 py-2.5 rounded-full font-bold hover:bg-brand-red-hover transition text-xs uppercase tracking-wider min-h-[44px] shadow-md shadow-brand-red/20 active:scale-95"
                        >
                          <span>Proceed with this Booking</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/book')}
                          className="text-xs text-brand-muted hover:text-brand-black underline uppercase font-bold tracking-wider"
                        >
                          View all slots at {msg.intentData.outlet?.area || 'original salon'} →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2.5 text-xs text-brand-muted pl-9 animate-fade-in">
            <div className="flex space-x-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="font-medium text-brand-muted">TONI&amp;GUY AI is organizing your schedule...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion prompt chips with horizontal scroll hint */}
      <div className="px-3 sm:px-5 py-2.5 bg-brand-white border-t border-brand-border overflow-x-auto flex space-x-2 scrollbar-none items-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-brand-red whitespace-nowrap mr-1 shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>Try saying:</span>
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-brand-subtle hover:bg-brand-red hover:text-brand-white transition text-brand-black border border-brand-border px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0 min-h-[34px] flex items-center font-medium shadow-2xs active:scale-95"
          >
            &quot;{prompt}&quot;
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="p-3 sm:p-4 bg-brand-white border-t border-brand-border flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="E.g., I want a haircut tomorrow at Anna Nagar at 7 PM..."
          className="flex-1 bg-brand-subtle border border-brand-border rounded-full px-4 sm:px-5 py-3 text-xs sm:text-sm focus:outline-none focus:bg-brand-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 text-brand-black placeholder:text-brand-muted/70 min-h-[44px] transition-all shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="bg-brand-red text-brand-white p-3 rounded-full hover:bg-brand-red-hover disabled:opacity-30 disabled:cursor-not-allowed transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-md shadow-brand-red/20 active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
