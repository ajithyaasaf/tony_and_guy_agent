'use client';

import React from 'react';
import Link from 'next/link';
import { ConciergeChatHero } from '@/features/concierge/components/ConciergeChatHero';
import { MOCK_OFFERS } from '@/data/offers';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OUTLETS } from '@/data/outlets';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useBooking } from '@/features/booking/context/BookingContext';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Scissors, Tag, MapPin, Sparkles, 
  ArrowRight, ShieldCheck, Award, Clock, Star, Check 
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { dispatch } = useBooking();

  const handleBookOffer = (offer: typeof MOCK_OFFERS[0]) => {
    const includedSrvs = MOCK_SERVICES.filter((s) => offer.serviceIds.includes(s.id));
    dispatch({ type: 'SET_OFFER', payload: { offer, services: includedSrvs } });
    router.push('/book');
  };

  const handleSelectService = (srv: typeof MOCK_SERVICES[0]) => {
    dispatch({ type: 'SET_SERVICES', payload: [srv] });
    router.push('/book');
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Editorial Section */}
      <section className="bg-[#FFFFFF] border-b border-[#E5E5E5] pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#F7F7F7] border border-[#E5E5E5] px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-black mb-4">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Next-Generation Salon Concierge</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black uppercase leading-[1.08]">
              Effortless Booking. <br />
              <span className="font-light text-neutral-500">Exceptional Hairdressing.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#666666] max-w-2xl leading-relaxed">
              Experience the luxury of TONI&amp;GUY across 64 bespoke salons. Tell our concierge your schedule in plain words, or browse our curated service and combo menus.
            </p>
          </div>

          {/* Quick Deterministic Action Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Link
              href="/book"
              className="bg-black text-white p-4 sm:p-5 rounded-xl hover:bg-neutral-800 transition flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Calendar className="w-5 h-5 text-white" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider">Book Appointment</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Adaptive fast flow</div>
              </div>
            </Link>

            <Link
              href="/services"
              className="bg-[#F7F7F7] border border-[#E5E5E5] text-black p-4 sm:p-5 rounded-xl hover:border-black transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <Scissors className="w-5 h-5 text-black" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider">Service Menu</div>
                <div className="text-[11px] text-[#666666] mt-0.5">Transparent pricing</div>
              </div>
            </Link>

            <Link
              href="/offers"
              className="bg-[#F7F7F7] border border-[#E5E5E5] text-black p-4 sm:p-5 rounded-xl hover:border-black transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <Tag className="w-5 h-5 text-black" />
                <span className="bg-[#D92D20] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Save ₹1.5k</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider">Exclusive Combos</div>
                <div className="text-[11px] text-[#666666] mt-0.5">8 Curated packages</div>
              </div>
            </Link>

            <Link
              href="/salons"
              className="bg-[#F7F7F7] border border-[#E5E5E5] text-black p-4 sm:p-5 rounded-xl hover:border-black transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <MapPin className="w-5 h-5 text-black" />
                <span className="text-[10px] font-semibold text-neutral-500">64 Salons</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider">Find a Salon</div>
                <div className="text-[11px] text-[#666666] mt-0.5">Locate nearest outlet</div>
              </div>
            </Link>
          </div>

          {/* AI Concierge Chat Container */}
          <div className="mt-6">
            <ConciergeChatHero />
          </div>
        </div>
      </section>

      {/* 2. Featured Exclusive Combos Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E5E5E5]">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Curated Packages</div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1">
              Signature Offers &amp; Combos
            </h2>
          </div>
          <Link
            href="/offers"
            className="mt-3 sm:mt-0 text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5 hover:underline"
          >
            <span>View All 8 Combos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_OFFERS.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col justify-between hover:border-black hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                    {offer.badge || 'Featured Combo'}
                  </span>
                  <span className="text-xs text-neutral-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(offer.durationMinutes)}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-black group-hover:text-black">
                  {offer.name}
                </h3>
                <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                  {offer.description}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Includes:</div>
                  {offer.includedServices.map((inc, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-neutral-700">
                      <Check className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400 line-through">
                    {formatPrice(offer.originalPrice)}
                  </div>
                  <div className="text-lg font-black text-black">
                    {formatPrice(offer.offerPrice)}
                  </div>
                </div>
                <button
                  onClick={() => handleBookOffer(offer)}
                  className="bg-black text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-neutral-800 transition"
                >
                  Book Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular Services Quick Showcase */}
      <section className="bg-[#F7F7F7] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E5E5E5]">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Couture Menu</div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1">
                Popular Salon Services
              </h2>
            </div>
            <Link
              href="/services"
              className="mt-3 sm:mt-0 text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5 hover:underline"
            >
              <span>Explore Complete Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_SERVICES.filter((s) => s.popular).slice(0, 4).map((service) => (
              <div
                key={service.id}
                className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col justify-between hover:border-black transition"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    {service.categoryName}
                  </div>
                  <h3 className="text-sm font-bold text-black">{service.name}</h3>
                  <p className="text-xs text-[#666666] mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">{formatDuration(service.durationMinutes)} · </span>
                    <span className="text-sm font-black text-black">{formatPrice(service.price)}</span>
                  </div>
                  <button
                    onClick={() => handleSelectService(service)}
                    className="border border-black text-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-black hover:text-white transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The TONI&GUY Promise */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-black">Certified Creative Directors</h4>
              <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                UK Academy-trained stylists with world-class precision cutting, bespoke colour analysis, and consultation expertise.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-black">Deterministic Live Slots</h4>
              <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                No fake confirmations. Our concierge checks live salon capacity and schedules your slot directly with the outlet.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-black">Zero-Friction Adaptive Booking</h4>
              <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                Never re-type what you already told us. Modify dates or times seamlessly without losing your selected services or outlet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
