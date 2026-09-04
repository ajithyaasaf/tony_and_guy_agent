'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_OUTLETS } from '@/data/outlets';
import { Outlet } from '@/types';
import { useBooking } from '@/features/booking/context/BookingContext';
import { calculateDistanceKm } from '@/lib/utils';
import { 
  MapPin, Search, Navigation, Phone, Clock, 
  Star, ArrowRight, Check, Compass, AlertCircle 
} from 'lucide-react';

export default function SalonsPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Available unique cities
  const cities = useMemo(() => {
    return Array.from(new Set(MOCK_OUTLETS.map((o) => o.city)));
  }, []);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        setGeoError('Location permission denied or unavailable. Please search by city/area.');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const processedOutlets = useMemo(() => {
    let list = MOCK_OUTLETS.map((outlet) => {
      let distance: number | undefined = undefined;
      if (userCoords) {
        distance = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          outlet.latitude,
          outlet.longitude
        );
      }
      return { ...outlet, distance };
    });

    // Filter by city
    if (selectedCity !== 'all') {
      list = list.filter((o) => o.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Filter by query (area, name, address, pin code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.area.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.pinCode.includes(q) ||
          o.address.toLowerCase().includes(q)
      );
    }

    // Sort by distance if location available, else alphabetically
    if (userCoords) {
      list.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return list;
  }, [selectedCity, searchQuery, userCoords]);

  const handleSelectOutlet = (outlet: Outlet) => {
    dispatch({ type: 'SET_OUTLET', payload: outlet });
    router.push('/book');
  };

  return (
    <div className="min-h-screen bg-brand-white pb-20">
      {/* Header Banner */}
      <div className="bg-brand-surface border-b border-brand-border py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              National Salon Network
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-brand-black mt-2">
              Find a TONI&amp;GUY Salon ({MOCK_OUTLETS.length} Outlets)
            </h1>
            <p className="text-sm text-brand-muted mt-2 leading-relaxed">
              Locate the nearest luxury salon by current GPS proximity, city, area, or PIN code. Every salon features certified stylists and deterministic live slot scheduling.
            </p>
          </div>

          {/* Search & Location Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area, salon name, city, or PIN (e.g. Anna Nagar, Indiranagar, Bandra, 600040)..."
                className="w-full bg-brand-white border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-black text-brand-black placeholder:text-neutral-400"
              />
            </div>

            <button
              onClick={handleRequestLocation}
              disabled={locating}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                userCoords
                  ? 'bg-brand-black text-brand-white'
                  : 'bg-brand-white border border-brand-black text-brand-black hover:bg-neutral-50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{locating ? 'Locating...' : userCoords ? 'Near Me Active' : 'Use My Location'}</span>
            </button>
          </div>

          {geoError && (
            <div className="mt-3 text-xs text-amber-700 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}

          {/* City filter tabs */}
          <div className="mt-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                selectedCity === 'all'
                  ? 'bg-brand-black text-brand-white'
                  : 'bg-brand-white border border-brand-border text-neutral-700 hover:border-brand-black'
              }`}
            >
              All Cities ({MOCK_OUTLETS.length})
            </button>
            {cities.map((city) => {
              const count = MOCK_OUTLETS.filter((o) => o.city === city).length;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    selectedCity === city
                      ? 'bg-brand-black text-brand-white'
                      : 'bg-brand-white border border-brand-border text-neutral-700 hover:border-brand-black'
                  }`}
                >
                  {city} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Showing {processedOutlets.length} Salons
          </div>
          {state.outlet && (
            <div className="text-xs font-semibold text-neutral-800">
              Selected in booking: <strong className="text-brand-black">{state.outlet.name}</strong>
            </div>
          )}
        </div>

        {processedOutlets.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-brand-border rounded-2xl">
            <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-brand-black">No salons match your search</div>
            <p className="text-xs text-neutral-500 mt-1">Try selecting another city or clearing your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedOutlets.map((outlet) => {
              const isSelected = state.outlet?.id === outlet.id;
              return (
                <div
                  key={outlet.id}
                  className={`bg-brand-white border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-brand-black ring-1 ring-brand-black bg-brand-subtle'
                      : 'border-brand-border hover:border-brand-black hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                        {outlet.city} · {outlet.area}
                      </span>
                      {outlet.distance !== undefined && (
                        <span className="text-xs font-extrabold text-brand-black bg-neutral-200/70 px-2 py-0.5 rounded-full">
                          {outlet.distance} km away
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-brand-black tracking-tight">{outlet.name}</h3>
                    <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                      {outlet.address}, {outlet.city} - {outlet.pinCode}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{outlet.openingHours.open} - {outlet.openingHours.close} ({outlet.openingHours.days})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <a
                          href={`tel:${outlet.phone.replace(/[^0-9+]/g, '')}`}
                          className="hover:underline text-brand-black font-semibold flex items-center space-x-1 py-1"
                        >
                          <span>{outlet.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Features pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {outlet.features.map((feat, i) => (
                        <span key={i} className="text-[10px] bg-brand-surface border border-brand-border text-neutral-700 px-2 py-0.5 rounded">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between min-h-[44px]">
                    <div className="flex items-center space-x-1 text-xs font-semibold text-brand-black">
                      <Star className="w-3.5 h-3.5 fill-brand-black text-brand-black" />
                      <span>{outlet.rating}</span>
                      <span className="text-neutral-400 font-normal">({outlet.reviewCount})</span>
                    </div>

                    <button
                      onClick={() => handleSelectOutlet(outlet)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition min-h-[44px] ${
                        isSelected
                          ? 'bg-brand-black text-brand-white'
                          : 'border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Salon Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Book Here</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
}
