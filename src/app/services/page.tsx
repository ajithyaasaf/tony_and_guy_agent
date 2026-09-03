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
    <div className="min-h-screen bg-white pb-24">
      {/* Header Banner */}
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Salon Service Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-2">
              Hair, Skin &amp; Beauty Couture
            </h1>
            <p className="text-sm text-[#666666] mt-2 leading-relaxed">
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
                className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400"
              />
            </div>

            {/* Audience pills */}
            <div className="flex space-x-1.5 bg-white border border-[#E5E5E5] p-1 rounded-xl">
              {(['all', 'women', 'men'] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    audienceFilter === aud
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:text-black'
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
                  ? 'bg-black text-white'
                  : 'bg-white border border-[#E5E5E5] text-neutral-700 hover:border-black'
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
                      ? 'bg-black text-white'
                      : 'bg-white border border-[#E5E5E5] text-neutral-700 hover:border-black'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Showing {filteredServices.length} Services
          </div>
          {state.services.length > 0 && (
            <div className="text-xs font-semibold text-neutral-800">
              {state.services.length} selected in current booking
            </div>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#E5E5E5] rounded-2xl">
            <Scissors className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-black">No services found</div>
            <p className="text-xs text-neutral-500 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const selected = isSelected(service.id);
              return (
                <div
                  key={service.id}
                  className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-all ${
                    selected
                      ? 'border-black ring-1 ring-black bg-[#FAFAFA]'
                      : 'border-[#E5E5E5] hover:border-neutral-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {service.categoryName}
                      </span>
                      {service.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-black">{service.name}</h3>
                    <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-400">
                        {formatDuration(service.durationMinutes)}
                      </div>
                      <div className="text-base font-black text-black">
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleService(service)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                        selected
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'border border-black text-black hover:bg-black hover:text-white'
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
        )}
      </div>

      {/* Floating Bottom Booking Bar if items are selected */}
      {state.services.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black text-white p-4 sm:p-5 shadow-2xl border-t border-neutral-800 animate-fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
                {state.services.length}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {state.services.length} Service{state.services.length > 1 ? 's' : ''} Selected · {formatDuration(state.totalDuration)}
                </div>
                <div className="text-sm text-neutral-300">
                  Total: <strong className="text-white font-black">{formatPrice(state.totalPrice)}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => dispatch({ type: 'SET_SERVICES', payload: [] })}
                className="text-xs text-neutral-400 hover:text-white underline px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={handleProceedToBooking}
                className="flex-1 sm:flex-none bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Continue to Salon &amp; Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
