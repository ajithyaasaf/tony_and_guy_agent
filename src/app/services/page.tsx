'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_SERVICES, SERVICE_CATEGORIES } from '@/data/services';
import { Service } from '@/types';
import { useBooking } from '@/features/booking/context/BookingContext';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Search, Scissors, Check, Plus, ArrowRight, Sparkles, Filter } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'men' | 'women' | 'unisex'>('all');

  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((service) => {
      const matchCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
      const matchSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAudience =
        audienceFilter === 'all' ||
        service.audience === audienceFilter ||
        service.audience === 'unisex';
      return matchCategory && matchSearch && matchAudience;
    });
  }, [selectedCategory, searchQuery, audienceFilter]);

  const isSelected = (serviceId: string) => {
    return state.services.some((s: Service) => s.id === serviceId);
  };

  const handleToggleService = (service: Service) => {
    if (isSelected(service.id)) {
      dispatch({ type: 'REMOVE_SERVICE', payload: service.id });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: service });
    }
  };

  const handleProceedToBooking = () => {
    router.push('/book');
  };

  return (
    <div className="min-h-screen bg-brand-white pb-24">
      {/* Header Banner */}
      <div className="bg-brand-surface border-b border-brand-border py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
              Salon Service Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-brand-black mt-2">
              Hair, Skin &amp; Beauty Couture
            </h1>
            <p className="text-sm text-brand-muted mt-2 leading-relaxed">
              Transparent pricing, authentic products (L’Oréal Professionnel, Kérastase, Sothys Paris), and customizable multiple-service combinations.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g., haircut, balayage, keratin, facial, spa)..."
                className="w-full bg-brand-white border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-black text-brand-black placeholder:text-neutral-400"
              />
            </div>

            {/* Audience pills */}
            <div className="flex space-x-1.5 bg-brand-white border border-brand-border p-1 rounded-xl">
              {(['all', 'women', 'men'] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    audienceFilter === aud
                      ? 'bg-brand-black text-brand-white'
                      : 'text-brand-muted hover:text-brand-black'
                  }`}
                >
                  {aud === 'all' ? 'All' : aud}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-brand-red text-brand-white shadow-sm font-bold'
                  : 'bg-brand-white border border-brand-border text-brand-black hover:border-brand-red'
              }`}
            >
              All Categories ({MOCK_SERVICES.length})
            </button>
            {SERVICE_CATEGORIES.map((cat) => {
              const count = MOCK_SERVICES.filter((s) => s.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-brand-red text-brand-white shadow-sm font-bold'
                      : 'bg-brand-white border border-brand-border text-brand-black hover:border-brand-red'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid & Mobile Compact View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Fast-Track Popular Haircut Strip for Quick Booking */}
        <div className="mb-6 bg-brand-red-subtle border border-brand-red/20 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="bg-brand-red text-brand-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                FAST-TRACK
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-brand-black">
                Most Popular Haircuts
              </span>
            </div>
            <span className="text-[11px] font-bold text-brand-red">1-Tap Add</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
            {MOCK_SERVICES.filter(s => s.popular && s.name.toLowerCase().includes('cut')).map((srv) => {
              const selected = isSelected(srv.id);
              return (
                <div
                  key={srv.id}
                  className={`shrink-0 w-[240px] p-3 rounded-xl border transition flex flex-col justify-between ${
                    selected ? 'bg-brand-white border-brand-red ring-1 ring-brand-red' : 'bg-brand-white border-brand-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold mb-1">
                      <span>{srv.categoryName}</span>
                      <span>{formatDuration(srv.durationMinutes)}</span>
                    </div>
                    <div className="text-xs font-extrabold text-brand-black truncate">{srv.name}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                    <span className="text-xs font-black text-brand-black">{formatPrice(srv.price)}</span>
                    <button
                      onClick={() => handleToggleService(srv)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                        selected
                          ? 'bg-brand-red text-brand-white'
                          : 'bg-brand-black text-brand-white hover:bg-neutral-800'
                      }`}
                    >
                      {selected ? 'Added ✓' : '+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Showing {filteredServices.length} Services
          </div>
          {state.services.length > 0 && (
            <div className="text-xs font-black text-brand-red">
              {state.services.length} selected in booking
            </div>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-brand-border rounded-2xl">
            <Scissors className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-brand-black">No services found</div>
            <p className="text-xs text-brand-muted mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <>
            {/* =========================================================
                MOBILE VIEW: Compact, High-Density Rows (3x Less Scrolling!)
               ========================================================= */}
            <div className="block sm:hidden space-y-2.5">
              {filteredServices.map((service) => {
                const selected = isSelected(service.id);
                return (
                  <div
                    key={service.id}
                    className={`bg-brand-white border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all shadow-sm ${
                      selected
                        ? 'border-brand-red ring-1 ring-brand-red bg-brand-red-subtle/50'
                        : 'border-brand-border'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <h3 className="text-xs font-extrabold text-brand-black truncate">{service.name}</h3>
                        {service.popular && (
                          <span className="text-[9px] font-black uppercase bg-brand-red text-brand-white px-1.5 py-0.2 rounded shrink-0">
                            🔥 Popular
                          </span>
                        )}
                      </div>
                      <div className="text-brand-black font-black text-xs mt-0.5">
                        {formatPrice(service.price)}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{service.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleService(service)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition min-h-[44px] flex items-center space-x-1 ${
                        selected
                          ? 'bg-brand-red text-brand-white'
                          : 'border border-brand-red text-brand-red bg-brand-white hover:bg-brand-red hover:text-brand-white'
                      }`}
                    >
                      {selected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* =========================================================
                DESKTOP VIEW: Spacious 3-Column Card Grid
               ========================================================= */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const selected = isSelected(service.id);
                return (
                  <div
                    key={service.id}
                    className={`bg-brand-white border rounded-xl p-6 flex flex-col justify-between transition-all ${
                      selected
                        ? 'border-brand-red ring-1 ring-brand-red bg-brand-red-subtle/50'
                        : 'border-brand-border hover:border-brand-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {service.categoryName}
                        </span>
                        {service.popular && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-brand-red text-brand-white px-2 py-0.5 rounded-full shadow-sm">
                            🔥 Popular
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-brand-black">{service.name}</h3>
                      <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-neutral-400">
                          {formatDuration(service.durationMinutes)}
                        </div>
                        <div className="text-base font-black text-brand-black">
                          {formatPrice(service.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleService(service)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                          selected
                            ? 'bg-brand-red text-brand-white hover:bg-brand-red-hover'
                            : 'border border-brand-red text-brand-red hover:bg-brand-red hover:text-brand-white'
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Booking</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Bottom Booking Bar if items are selected */}
      {state.services.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-50 max-w-4xl mx-auto bg-brand-black text-brand-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-neutral-800 animate-fade-in">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Badge + Details */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-red text-brand-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                {state.services.length}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300 whitespace-nowrap truncate">
                  {state.services.length} Service{state.services.length > 1 ? 's' : ''} · {formatDuration(state.totalDuration)}
                </div>
                <div className="text-xs sm:text-sm text-neutral-300 whitespace-nowrap truncate">
                  Total: <strong className="text-brand-white font-black">{formatPrice(state.totalPrice)}</strong>
                </div>
              </div>
            </div>

            {/* Right: Actions (Clear + CTA Button) */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => dispatch({ type: 'SET_SERVICES', payload: [] })}
                className="text-[11px] sm:text-xs text-neutral-400 hover:text-brand-white underline px-1 sm:px-2 py-1 shrink-0"
              >
                Clear
              </button>
              <button
                onClick={handleProceedToBooking}
                className="bg-brand-red text-brand-white px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-red-hover transition flex items-center space-x-1.5 shrink-0 shadow-brand-cta"
              >
                <span>Continue <span className="hidden sm:inline">to Salon &amp; Time</span></span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
