'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_OFFERS } from '@/data/offers';
import { MOCK_SERVICES } from '@/data/services';
import { useBooking } from '@/features/booking/context/BookingContext';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Tag, Check, ArrowRight, Clock, Sparkles, ShieldCheck } from 'lucide-react';

export default function OffersPage() {
  const router = useRouter();
  const { dispatch } = useBooking();

  const handleBookOffer = (offer: typeof MOCK_OFFERS[0]) => {
    const includedServices = MOCK_SERVICES.filter((s) => offer.serviceIds.includes(s.id));
    dispatch({ type: 'SET_OFFER', payload: { offer, services: includedServices } });
    router.push('/book');
  };

  return (
    <div className="min-h-screen bg-brand-white pb-20">
      {/* Header Banner */}
      <div className="bg-brand-surface border-b border-brand-border py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-red">
              Exclusive Salon Combinations
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-brand-black mt-2">
              Offers &amp; Curated Combos
            </h1>
            <p className="text-sm text-brand-muted mt-2 leading-relaxed">
              Experience harmonized beauty rituals at exclusive bundled pricing. Valid across all 64 TONI&amp;GUY salons in India.
            </p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-brand-white border border-brand-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-black hover:shadow-brand-card transition-all group relative overflow-hidden"
            >
              {/* Savings Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-brand-red text-brand-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Save {formatPrice(offer.savings)}
                </span>
                <span className="text-xs text-brand-muted flex items-center space-x-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(offer.durationMinutes)}</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-black uppercase tracking-tight leading-snug">
                  {offer.name}
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-3 leading-relaxed">
                  {offer.description}
                </p>

                {/* Included services breakdown */}
                <div className="mt-6 pt-4 border-t border-brand-border/60 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Included Signature Rituals:
                  </div>
                  {offer.includedServices.map((srv, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 text-xs text-brand-black font-medium">
                      <Check className="w-4 h-4 text-brand-black shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>

                {offer.terms && (
                  <p className="text-[11px] text-neutral-400 mt-4 italic">
                    *{offer.terms}
                  </p>
                )}
              </div>

              {/* Price & Book Action */}
              <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400 line-through">
                    Standard: {formatPrice(offer.originalPrice)}
                  </div>
                  <div className="text-2xl font-black text-brand-black">
                    {formatPrice(offer.offerPrice)}
                  </div>
                </div>

                <button
                  onClick={() => handleBookOffer(offer)}
                  className="bg-brand-red text-brand-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-brand-red-hover transition-all flex items-center space-x-2 shadow-brand-cta"
                >
                  <span>Book This Combo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
