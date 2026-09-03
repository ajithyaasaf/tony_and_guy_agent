'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/features/booking/context/BookingContext';
import { parseNaturalLanguageInput, ExtractedBookingIntent } from '@/features/concierge/engine/intentParser';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OFFERS } from '@/data/offers';
import { MOCK_OUTLETS } from '@/data/outlets';
import { formatPrice, formatDuration } from '@/lib/utils';
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
    <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
      {/* Header bar */}
      <div className="bg-black text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-[#D92D20] shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
              <span>TONI&amp;GUY AI Concierge</span>
              <span className="bg-[#D92D20] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white">
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
      <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-[360px] max-h-[380px] sm:max-h-[460px] overflow-y-auto space-y-4 bg-neutral-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''} animate-fade-in`}
          >
            {/* Avatar icon */}
            {msg.sender === 'assistant' ? (
              <div className="w-7 h-7 rounded-full bg-black text-[#D92D20] flex items-center justify-center shrink-0 border border-neutral-800 shadow-sm mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#D92D20] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm mt-0.5">
                U
              </div>
            )}

            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[78%]`}>
              <div
                className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-black text-white rounded-tr-none shadow-md font-medium'
                    : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Render Structured UI inline when data is extracted */}
                {msg.intentData && (
                  <div className="mt-3.5 pt-3 border-t border-neutral-200 space-y-2.5 text-xs">
                    {/* Extracted service pill */}
                    {msg.intentData.services.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-neutral-500">Selected Services:</span>
                        {msg.intentData.services.map((s) => (
                          <span key={s.id} className="bg-neutral-100 border border-neutral-300 text-black px-2 py-1 rounded-md font-bold">
                            {s.name} ({formatPrice(s.price)})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Extracted outlet pill */}
                    {msg.intentData.outlet && (
                      <div className="flex items-center space-x-1.5 text-neutral-700">
                        <MapPin className="w-3.5 h-3.5 text-[#D92D20] shrink-0" />
                        <span><strong>Outlet:</strong> {msg.intentData.outlet.name}</span>
                      </div>
                    )}

                    {/* Extracted date */}
                    {msg.intentData.date && (
                      <div className="flex items-center space-x-1.5 text-neutral-700">
                        <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                        <span><strong>Date:</strong> {msg.intentData.dateLabel || msg.intentData.date}</span>
                      </div>
                    )}

                    {/* Extracted offer */}
                    {msg.intentData.offer && (
                      <div className="p-3 bg-red-50/80 border border-[#D92D20]/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-black">{msg.intentData.offer.name}</div>
                          <span className="bg-[#D92D20] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            Save {formatPrice(msg.intentData.offer.savings)}
                          </span>
                        </div>
                        <div className="text-xs text-[#D92D20] font-bold mt-1">
                          Exclusive Price: {formatPrice(msg.intentData.offer.offerPrice)}
                        </div>
                      </div>
                    )}

                    {/* Action CTA inside conversation */}
                    <div className="pt-2">
                      <button
                        onClick={() => router.push('/book')}
                        className="inline-flex items-center space-x-2 bg-[#D92D20] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#B91C1C] transition text-xs uppercase tracking-wider min-h-[44px] shadow-md shadow-red-900/20 active:scale-95"
                      >
                        <span>Proceed with this Booking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2.5 text-xs text-neutral-500 pl-9 animate-fade-in">
            <div className="flex space-x-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D92D20] animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="font-medium text-neutral-600">TONI&amp;GUY AI is organizing your schedule...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion prompt chips with horizontal scroll hint */}
      <div className="px-3 sm:px-5 py-2.5 bg-white border-t border-neutral-200 overflow-x-auto flex space-x-2 scrollbar-none items-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#D92D20] whitespace-nowrap mr-1 shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>Try saying:</span>
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-neutral-100 hover:bg-[#D92D20] hover:text-white transition text-neutral-800 border border-neutral-200 px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0 min-h-[34px] flex items-center font-medium shadow-2xs active:scale-95"
          >
            &quot;{prompt}&quot;
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="p-3 sm:p-4 bg-white border-t border-neutral-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="E.g., I want a haircut tomorrow at Anna Nagar at 7 PM..."
          className="flex-1 bg-neutral-50 border border-neutral-300 rounded-full px-4 sm:px-5 py-3 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/20 text-black placeholder:text-neutral-400 min-h-[44px] transition-all shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="bg-[#D92D20] text-white p-3 rounded-full hover:bg-[#B91C1C] disabled:opacity-30 disabled:cursor-not-allowed transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-md shadow-red-900/25 active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
