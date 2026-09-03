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
    <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            TONI&amp;GUY AI Salon Concierge
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-[#666666]">
          <ShieldCheck className="w-3.5 h-3.5 text-black" />
          <span>Real-time availability engine</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="p-3 sm:p-6 min-h-[280px] sm:min-h-[340px] max-h-[360px] sm:max-h-[480px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-black text-white rounded-tr-none'
                  : 'bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render Structured UI inline when data is extracted */}
              {msg.intentData && (
                <div className="mt-3.5 pt-3 border-t border-neutral-200/60 space-y-2.5 text-xs">
                  {/* Extracted service pill */}
                  {msg.intentData.services.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-neutral-500">Selected Services:</span>
                      {msg.intentData.services.map((s) => (
                        <span key={s.id} className="bg-white border border-neutral-300 text-black px-2 py-1 rounded-md font-medium">
                          {s.name} ({formatPrice(s.price)})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Extracted outlet pill */}
                  {msg.intentData.outlet && (
                    <div className="flex items-center space-x-1.5 text-neutral-700">
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
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
                    <div className="p-3 bg-red-50/60 border border-[#D92D20]/30 rounded-xl">
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
                      className="inline-flex items-center space-x-2 bg-[#D92D20] text-white px-4 py-2.5 rounded-full font-bold hover:bg-[#B91C1C] transition text-xs uppercase tracking-wider min-h-[44px] shadow-md shadow-red-900/15"
                    >
                      <span>Proceed with this Booking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#888888] mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-neutral-400 pl-2">
            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
            <span>Concierge is organizing your appointment...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion prompt chips with horizontal scroll hint */}
      <div className="px-3 sm:px-6 py-2 bg-white border-t border-[#F0F0F0] overflow-x-auto flex space-x-2 scrollbar-none items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap mr-1 shrink-0">
          Try saying:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-[#F7F7F7] hover:bg-[#D92D20] hover:text-white transition text-neutral-700 border border-[#E5E5E5] px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 min-h-[36px] flex items-center"
          >
            &quot;{prompt}&quot;
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="p-3 sm:p-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="E.g., I want a haircut tomorrow at Anna Nagar at 7 PM..."
          className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#D92D20] focus:ring-1 focus:ring-[#D92D20] text-black placeholder:text-neutral-400 min-h-[44px]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="bg-[#D92D20] text-white p-3 rounded-xl hover:bg-[#B91C1C] disabled:opacity-30 disabled:cursor-not-allowed transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-md shadow-red-900/15"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
