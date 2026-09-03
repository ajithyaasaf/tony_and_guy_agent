'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/features/booking/context/BookingContext';
import { MOCK_SERVICES, SERVICE_CATEGORIES } from '@/data/services';
import { MOCK_OUTLETS } from '@/data/outlets';
import { MOCK_STAFF } from '@/data/staff';
import { generateSlotsForDate } from '@/data/availability';
import { Service, Outlet, Staff, TimeSlot, CustomerInfo } from '@/types';
import { formatPrice, formatDuration } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { 
  Check, Calendar, Clock, MapPin, Scissors, 
  User, ArrowRight, ArrowLeft, RotateCcw, 
  Sparkles, CheckCircle2, ShieldCheck, AlertCircle, Edit3, Plus, ChevronUp, ChevronDown
} from 'lucide-react';

export default function AdaptiveBookingPage() {
  const router = useRouter();
  const { state, dispatch, resetBooking } = useBooking();

  // Local state for interactive steps
  const [activeStepTab, setActiveStepTab] = useState<'services' | 'outlet' | 'datetime' | 'details' | 'review'>('services');
  const [selectedCity, setSelectedCity] = useState('all');
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({
    name: state.customer?.name || '',
    phone: state.customer?.phone || '',
    email: state.customer?.email || '',
    notes: state.customer?.notes || '',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serviceCategory, setServiceCategory] = useState('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceAudience, setServiceAudience] = useState<'all' | 'men' | 'women'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    cat_haircut: true, // Only haircuts expanded by default for instant 0-scroll booking!
  });

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const filteredStepServices = useMemo(() => {
    return MOCK_SERVICES.filter((srv) => {
      const matchCat = serviceCategory === 'all' || srv.categoryId === serviceCategory;
      const matchSearch =
        srv.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        srv.description.toLowerCase().includes(serviceSearch.toLowerCase());
      const matchAudience =
        serviceAudience === 'all' || srv.audience === serviceAudience || srv.audience === 'unisex';
      return matchCat && matchSearch && matchAudience;
    });
  }, [serviceCategory, serviceSearch, serviceAudience]);

  const handleQuickSelectAndProceed = (serviceNameQuery: string) => {
    const targetSrv = MOCK_SERVICES.find((s) =>
      s.name.toLowerCase().includes(serviceNameQuery.toLowerCase())
    );
    if (targetSrv) {
      dispatch({ type: 'SET_SERVICES', payload: [targetSrv] });
      setActiveStepTab('outlet');
    }
  };

  // Available dates (Next 14 days)
  const availableDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = addDays(today, i);
      return {
        iso: format(d, 'yyyy-MM-dd'),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(d, 'EEE'),
        dayNumber: format(d, 'd'),
        monthName: format(d, 'MMM'),
      };
    });
  }, []);

  // Sync active step based on state missing fields on initial load
  useEffect(() => {
    if (state.services.length === 0) {
      setActiveStepTab('services');
    } else if (!state.outlet) {
      setActiveStepTab('outlet');
    } else if (!state.date || !state.selectedSlot) {
      setActiveStepTab('datetime');
    } else if (!state.customer?.name || !state.customer?.phone) {
      setActiveStepTab('details');
    } else {
      setActiveStepTab('review');
    }
  }, []);

  // Compute available slots whenever outlet, date, or staff changes
  const computedSlots = useMemo(() => {
    if (!state.outlet || !state.date) return [];
    return generateSlotsForDate(state.outlet.id, state.date, state.selectedStaff?.id);
  }, [state.outlet, state.date, state.selectedStaff]);

  // Handle service toggle
  const handleToggleService = (service: Service) => {
    const exists = state.services.some((s: Service) => s.id === service.id);
    if (exists) {
      dispatch({ type: 'REMOVE_SERVICE', payload: service.id });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: service });
    }
  };

  // Handle slot selection
  const handleSelectSlot = (slot: TimeSlot) => {
    if (!slot.available) return;
    dispatch({ type: 'SELECT_SLOT', payload: slot });
  };

  // Handle customer form submission
  const handleSaveCustomerDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) return;
    dispatch({ type: 'SET_CUSTOMER', payload: customerForm });
    setActiveStepTab('review');
  };

  // Final Confirmation
  const handleConfirmAppointment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const ref = `TG-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);

      // Persist appointment to localStorage so admin portal & customer dashboard see it instantly
      const newBooking = {
        bookingRef: ref,
        createdAt: new Date().toISOString(),
        outletName: state.outlet?.name || 'TONI&GUY Anna Nagar',
        outletAddress: `${state.outlet?.address || ''}, ${state.outlet?.city || ''}`,
        date: state.date || '2026-09-04',
        time: state.selectedSlot?.displayTime || '01:00 PM',
        stylist: state.selectedStaff ? state.selectedStaff.name : state.selectedSlot?.staffName || 'Alex Anna',
        services: state.services.map((s: Service) => s.name),
        totalPrice: state.totalPrice,
        customerName: state.customer?.name || 'Guest User',
        customerPhone: state.customer?.phone || '9944325757',
        status: 'Confirmed',
      };

      try {
        const existing = JSON.parse(localStorage.getItem('toniguy_all_bookings') || '[]');
        localStorage.setItem('toniguy_all_bookings', JSON.stringify([newBooking, ...existing]));
      } catch (e) {
        console.error('Failed to save booking to localStorage', e);
      }

      dispatch({ type: 'CONFIRM_BOOKING', payload: { bookingReference: ref } });
      setBookingConfirmed(true);
      setIsSubmitting(false);
    }, 600);
  };

  // Outlet staff members for selected salon
  const currentOutletStaff = useMemo(() => {
    if (!state.outlet) return [];
    return MOCK_STAFF.filter((s) => s.outletId === state.outlet?.id);
  }, [state.outlet]);

  // If already confirmed, render the luxury confirmation voucher
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-[#E5E5E5] rounded-3xl shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-black text-white p-8 text-center relative">
            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-[#D92D20]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Appointment Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
              Your TONI&amp;GUY Visit is Booked
            </h1>
            <div className="mt-3 inline-block bg-neutral-900 border border-neutral-700 px-4 py-1.5 rounded-full text-xs font-mono text-neutral-200">
              Booking Ref: <strong>{bookingRef}</strong>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Salon & Date details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-neutral-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Salon Location</div>
                <div className="text-sm font-bold text-black mt-1">{state.outlet?.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{state.outlet?.address}, {state.outlet?.city}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Date &amp; Time</div>
                <div className="text-sm font-bold text-black mt-1">{state.date} at {state.selectedSlot?.displayTime}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Stylist: {state.selectedStaff ? state.selectedStaff.name : state.selectedSlot?.staffName || 'Any Available Senior Stylist'}
                </div>
              </div>
            </div>

            {/* Booked Services */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Booked Rituals &amp; Services
              </div>
              <div className="space-y-2.5">
                {state.services.map((srv: Service) => (
                  <div key={srv.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-neutral-800">{srv.name}</span>
                    <span className="font-bold text-black">{formatPrice(srv.price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-sm sm:text-base font-black text-black">
                <span>Total Amount ({formatDuration(state.totalDuration)})</span>
                <span>{formatPrice(state.totalPrice)}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-[#FAFAFA] p-4 rounded-xl border border-neutral-200/70 text-xs space-y-1">
              <div className="font-bold text-black">Guest: {state.customer?.name} ({state.customer?.phone})</div>
              {state.customer?.email && <div className="text-neutral-500">Email: {state.customer.email}</div>}
              <div className="text-neutral-500">An instant SMS confirmation has been scheduled for your visit.</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/orders"
                className="flex-1 bg-[#D92D20] text-white text-center py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#B91C1C] transition shadow-md shadow-red-900/20"
              >
                View My Orders &amp; Appointments
              </Link>
              <Link
                href="/"
                onClick={() => resetBooking()}
                className="flex-1 bg-black text-white text-center py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition"
              >
                Return to Concierge Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top Breadcrumb / Stepper */}
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-4 px-4 sm:px-6 lg:px-8 sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Stepper Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {[
              { id: 'services', label: '1. Services', done: state.services.length > 0 },
              { id: 'outlet', label: '2. Salon', done: !!state.outlet },
              { id: 'datetime', label: '3. Date & Time', done: !!state.selectedSlot },
              { id: 'details', label: '4. Guest Details', done: !!state.customer?.name },
              { id: 'review', label: '5. Review', done: false },
            ].map((step) => {
              const isActive = activeStepTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepTab(step.id as any)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center space-x-1 font-semibold ${
                    isActive
                      ? 'bg-black text-white'
                      : step.done
                      ? 'bg-neutral-200 text-black hover:bg-neutral-300'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                >
                  {step.done && <Check className="w-3 h-3" />}
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick summary strip */}
          <div className="flex items-center space-x-3 text-xs text-neutral-600">
            {state.services.length > 0 && (
              <span><strong>{state.services.length}</strong> srv ({formatPrice(state.totalPrice)})</span>
            )}
            {state.outlet && (
              <span className="hidden md:inline">· <strong>{state.outlet.area}</strong></span>
            )}
            {state.selectedSlot && (
              <span className="hidden md:inline">· <strong>{state.selectedSlot.displayTime}</strong></span>
            )}
            <button
              onClick={() => resetBooking()}
              className="text-neutral-400 hover:text-black transition flex items-center space-x-1"
              title="Reset entire booking"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Applied Offer Banner */}
        {state.selectedOffer && (
          <div className="bg-red-50 border border-[#D92D20]/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-fade-in">
            <div className="flex items-center space-x-2.5">
              <span className="bg-[#D92D20] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 shadow-sm">
                EXCLUSIVE OFFER APPLIED
              </span>
              <span className="font-extrabold text-black">{state.selectedOffer.name}</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#D92D20] bg-white border border-[#D92D20]/20 px-3 py-1 rounded-lg">
              Bundle Savings: You Save {formatPrice(state.selectedOffer.savings)}!
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: SERVICES SELECTION
           ========================================================================= */}
        {activeStepTab === 'services' && (
          <div className="space-y-6 animate-fade-in pb-16 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
                  <span>Step 1: Choose Your Services</span>
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Select one or multiple precision services, or use Fast-Track for 1-tap booking.
                </p>
              </div>

              {state.services.length > 0 && (
                <button
                  onClick={() => setActiveStepTab('outlet')}
                  className="hidden sm:flex bg-[#D92D20] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#B91C1C] transition items-center space-x-1.5 min-h-[44px] shadow-md shadow-red-900/15"
                >
                  <span>Proceed to Salon ({state.services.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Fast-Track 1-Tap Haircut & Proceed Strip */}
            <div className="bg-red-50/70 border border-[#D92D20]/20 rounded-2xl p-3.5 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#D92D20] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    FAST-TRACK
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    Quick Haircut Auto-Proceed
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-[#D92D20]">Selects &amp; Opens Step 2 👉</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-1">
                <button
                  type="button"
                  onClick={() => handleQuickSelectAndProceed('men')}
                  className="bg-white border border-[#D92D20]/40 text-black px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-[#D92D20] hover:text-white transition flex items-center space-x-1.5 shadow-sm min-h-[38px] shrink-0"
                >
                  <span>✂️ Men&apos;s Classic Haircut ({formatPrice(850)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectAndProceed('women')}
                  className="bg-white border border-[#D92D20]/40 text-black px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-[#D92D20] hover:text-white transition flex items-center space-x-1.5 shadow-sm min-h-[38px] shrink-0"
                >
                  <span>💇‍♀️ Women&apos;s Creative Cut ({formatPrice(1550)})</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services (e.g. haircut, beard, spa)..."
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl pl-3.5 pr-4 py-2 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#D92D20]"
                  />
                </div>
                <div className="flex space-x-1 bg-[#F7F7F7] border border-[#E5E5E5] p-1 rounded-xl shrink-0">
                  {(['all', 'women', 'men'] as const).map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => setServiceAudience(aud)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                        serviceAudience === aud
                          ? 'bg-[#D92D20] text-white shadow-sm'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {aud === 'all' ? 'All' : aud}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setServiceCategory('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                    serviceCategory === 'all'
                      ? 'bg-[#D92D20] text-white shadow-sm'
                      : 'bg-white border border-[#E5E5E5] text-neutral-600 hover:border-black'
                  }`}
                >
                  All ({MOCK_SERVICES.length})
                </button>
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setServiceCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                      serviceCategory === cat.id
                        ? 'bg-[#D92D20] text-white shadow-sm'
                        : 'bg-white border border-[#E5E5E5] text-neutral-600 hover:border-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile View: Zero-Scroll Category Accordions */}
            <div className="block sm:hidden space-y-3">
              {SERVICE_CATEGORIES.map((cat) => {
                const catServices = filteredStepServices.filter((s) => s.categoryId === cat.id);
                if (catServices.length === 0) return null;
                const isExpanded = expandedCategories[cat.id] ?? false;

                return (
                  <div key={cat.id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                    {/* Category Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand(cat.id)}
                      className="w-full bg-[#FAFAFA] px-4 py-3 flex items-center justify-between border-b border-[#E5E5E5] text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black uppercase tracking-wider text-black">
                          {cat.name}
                        </span>
                        <span className="bg-neutral-200 text-neutral-700 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                          {catServices.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-[#D92D20] font-bold">
                        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 bg-white">
                        {catServices.map((srv: Service) => {
                          const selected = state.services.some((s: Service) => s.id === srv.id);
                          return (
                            <div
                              key={srv.id}
                              onClick={() => handleToggleService(srv)}
                              className={`cursor-pointer border rounded-xl p-3 flex items-center justify-between gap-3 transition-all shadow-sm ${
                                selected
                                  ? 'border-[#D92D20] ring-1 ring-[#D92D20] bg-red-50/20'
                                  : 'border-[#E5E5E5] bg-white'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1.5 mb-0.5">
                                  <h3 className="text-xs font-extrabold text-black truncate">{srv.name}</h3>
                                  {srv.popular && (
                                    <span className="text-[9px] font-black uppercase bg-[#D92D20] text-white px-1.5 py-0.2 rounded shrink-0">
                                      🔥 Popular
                                    </span>
                                  )}
                                </div>
                                <div className="text-black font-black text-xs mt-0.5">
                                  {formatPrice(srv.price)}
                                </div>
                              </div>

                              <div
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition flex items-center space-x-1 min-h-[38px] ${
                                  selected
                                    ? 'bg-[#D92D20] text-white'
                                    : 'border border-[#D92D20] text-[#D92D20] bg-white'
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
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Spacious 3-Col Cards */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStepServices.map((srv: Service) => {
                const selected = state.services.some((s: Service) => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv)}
                    className={`cursor-pointer border rounded-xl p-5 flex flex-col justify-between transition-all min-h-[120px] ${
                      selected
                        ? 'border-[#D92D20] ring-1 ring-[#D92D20] bg-red-50/20'
                        : 'border-[#E5E5E5] hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        <span>{srv.categoryName}</span>
                        {selected && <Check className="w-4 h-4 text-[#D92D20] shrink-0" />}
                      </div>
                      <h3 className="text-sm font-bold text-black">{srv.name}</h3>
                      <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">{formatDuration(srv.durationMinutes)}</span>
                      <span className="text-sm font-black text-black">{formatPrice(srv.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Sticky Action Bar for Step 1 */}
            {state.services.length > 0 && (
              <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-black text-white p-3.5 shadow-2xl border-t border-neutral-800 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {state.services.length} Service{state.services.length > 1 ? 's' : ''} Selected
                  </div>
                  <div className="text-xs text-neutral-300">Total: <strong className="text-white font-black">{formatPrice(state.totalPrice)}</strong></div>
                </div>
                <button
                  onClick={() => setActiveStepTab('outlet')}
                  className="bg-[#D92D20] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 min-h-[44px] shadow-lg shadow-red-900/30"
                >
                  <span>Select Salon &amp; Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 2: OUTLET SELECTION
           ========================================================================= */}
        {activeStepTab === 'outlet' && (
          <div className="space-y-5 animate-fade-in pb-16 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5] gap-2">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
                  <span>Step 2: Choose Salon Location</span>
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Select your city first, then pick your preferred TONI&amp;GUY salon outlet.
                </p>
              </div>

              {state.outlet && (
                <button
                  onClick={() => setActiveStepTab('datetime')}
                  className="hidden sm:flex bg-[#D92D20] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#B91C1C] transition items-center space-x-1.5 min-h-[44px] shadow-md shadow-red-900/15"
                >
                  <span>Proceed to Date &amp; Time</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Selection Header & Prominent Buttons */}
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#D92D20]" />
                  <span>Select Your City</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-400">
                  {MOCK_OUTLETS.filter((o) => selectedCity === 'all' || o.city === selectedCity).length} Salons Available
                </span>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {['Chennai', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'all'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition min-h-[40px] shadow-sm ${
                      selectedCity === city || (selectedCity === 'all' && city === 'all')
                        ? 'bg-[#D92D20] text-white'
                        : 'bg-white border border-[#E5E5E5] text-neutral-700 hover:border-black'
                    }`}
                  >
                    {city === 'all' ? 'All Cities' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Mobile Outlet Grid / 3-Column Desktop Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {MOCK_OUTLETS.filter((o) => selectedCity === 'all' || o.city === selectedCity).map((outlet) => {
                const selected = state.outlet?.id === outlet.id;
                return (
                  <div
                    key={outlet.id}
                    onClick={() => {
                      dispatch({ type: 'SET_OUTLET', payload: outlet });
                      setActiveStepTab('datetime');
                    }}
                    className={`cursor-pointer border rounded-2xl p-3 sm:p-5 flex flex-col justify-between transition-all shadow-sm ${
                      selected
                        ? 'border-[#D92D20] ring-1 ring-[#D92D20] bg-red-50/20'
                        : 'border-[#E5E5E5] hover:border-black bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#D92D20] truncate">
                          {outlet.area}
                        </span>
                        {selected && <Check className="w-4 h-4 text-[#D92D20] shrink-0" />}
                      </div>
                      <h3 className="text-xs sm:text-base font-black text-black leading-tight line-clamp-2">
                        {outlet.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#666666] mt-1 line-clamp-2 leading-tight">
                        {outlet.address}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 sm:pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs text-neutral-500 gap-1">
                      <span className="truncate">{outlet.openingHours.open} - {outlet.openingHours.close}</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] ${selected ? 'text-[#D92D20]' : 'text-black'}`}>
                        {selected ? 'Selected ✓' : 'Select Salon →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Sticky Action Bar for Step 2 */}
            {state.outlet && (
              <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-black text-white p-3.5 shadow-2xl border-t border-neutral-800 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[200px]">
                    Outlet: {state.outlet.name}
                  </div>
                  <div className="text-xs text-neutral-300">{state.outlet.area}, {state.outlet.city}</div>
                </div>
                <button
                  onClick={() => setActiveStepTab('datetime')}
                  className="bg-[#D92D20] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 min-h-[44px] shadow-lg shadow-red-900/30"
                >
                  <span>Select Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 3: DATE & TIME SELECTION (ADAPTIVE AVAILABILITY ENGINE)
           ========================================================================= */}
        {activeStepTab === 'datetime' && (
          <div className="space-y-8 animate-fade-in pb-16 md:pb-0">
            <div className="pb-4 border-b border-[#E5E5E5]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Step 3: Select Date &amp; Available Slot
              </h2>
              <p className="text-xs text-[#666666] mt-1">
                Checking live capacity for <strong>{state.outlet?.name || 'Selected Salon'}</strong> ({formatDuration(state.totalDuration || 45)} estimated duration).
              </p>
            </div>

            {/* Stylist Selection Optional Pill Bar */}
            {currentOutletStaff.length > 0 && (
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-neutral-200">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Stylist Preference (Optional)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_STYLIST_PREFERENCE', payload: 'any' })}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
                      state.stylistPreference === 'any' && !state.selectedStaff
                        ? 'bg-black text-white'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:border-black'
                    }`}
                  >
                    Any Certified Stylist
                  </button>
                  {currentOutletStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => dispatch({ type: 'SELECT_STAFF', payload: staff })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
                        state.selectedStaff?.id === staff.id
                          ? 'bg-black text-white'
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:border-black'
                      }`}
                    >
                      {staff.name} ({staff.role})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Horizontal Scrollable Date Ribbon on Mobile */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                Choose Date (Swipe to view 14 days)
              </div>
              <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-7 sm:gap-2 sm:space-x-0">
                {availableDates.map((item) => {
                  const isSelected = state.date === item.iso;
                  return (
                    <button
                      key={item.iso}
                      onClick={() => dispatch({ type: 'SET_DATE', payload: item.iso })}
                      className={`p-3 rounded-xl text-center border transition shrink-0 min-w-[76px] sm:min-w-0 min-h-[72px] flex flex-col justify-center ${
                        isSelected
                          ? 'bg-black text-white border-black ring-1 ring-black'
                          : 'bg-white border-[#E5E5E5] text-neutral-800 hover:border-black'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.dayName}</div>
                      <div className="text-base sm:text-lg font-black my-0.5">{item.dayNumber}</div>
                      <div className="text-[10px] uppercase font-semibold opacity-70">{item.monthName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Grid */}
            {state.date && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Available Time Slots for {state.date}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Real-time capacity
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {computedSlots.map((slot) => {
                    const isSelected = state.selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => {
                          handleSelectSlot(slot);
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center min-h-[48px] ${
                          isSelected
                            ? 'bg-black text-white ring-2 ring-black'
                            : slot.available
                            ? 'bg-white border border-[#E5E5E5] text-neutral-900 hover:border-black'
                            : 'bg-neutral-100 text-neutral-300 border border-neutral-100 cursor-not-allowed line-through'
                        }`}
                      >
                        <span>{slot.displayTime}</span>
                        {slot.available && (
                          <span className="text-[9px] font-normal opacity-70 mt-0.5">Available</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 CTA Button */}
            {state.selectedSlot && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveStepTab('details')}
                  className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center space-x-2 min-h-[44px] shadow-md"
                >
                  <span>Proceed to Guest Information ({state.selectedSlot.displayTime})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 4: GUEST DETAILS
           ========================================================================= */}
        {activeStepTab === 'details' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-16 md:pb-0">
            <div className="pb-4 border-b border-[#E5E5E5]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Step 4: Guest Information
              </h2>
              <p className="text-xs text-[#666666] mt-1">
                We need only your basic contact details to confirm your slot with the salon.
              </p>
            </div>

            <form onSubmit={handleSaveCustomerDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="E.g. Siddharth Verma"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black text-black min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Mobile Number (for SMS confirmation) *
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  pattern="[0-9+ ]*"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="E.g. +91 98400 12345"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black text-black min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="E.g. siddharth@example.com"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black text-black min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Special Notes or Stylist Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  placeholder="Any hair condition, beverage preference, or specific timing request..."
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStepTab('datetime')}
                  className="w-full sm:w-auto text-xs font-semibold text-neutral-500 hover:text-black flex items-center justify-center space-x-1 min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Time Selection</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition min-h-[44px]"
                >
                  Proceed to Final Review
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            STEP 5: APPOINTMENT REVIEW & CONFIRMATION
           ========================================================================= */}
        {activeStepTab === 'review' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-16 md:pb-0">
            <div className="pb-4 border-b border-[#E5E5E5]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Step 5: Review &amp; Confirm
              </h2>
              <p className="text-xs text-[#666666] mt-1">
                Please verify all appointment details before final confirmation.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
              {/* Salon Details with inline edit */}
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Salon Location</div>
                  <div className="text-base font-bold text-black mt-0.5">{state.outlet?.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{state.outlet?.address}, {state.outlet?.city}</div>
                </div>
                <button
                  onClick={() => setActiveStepTab('outlet')}
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-neutral-100 min-h-[44px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Date & Time with inline edit */}
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Date &amp; Time</div>
                  <div className="text-base font-bold text-black mt-0.5">
                    {state.date} at {state.selectedSlot?.displayTime}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Stylist: {state.selectedStaff ? state.selectedStaff.name : state.selectedSlot?.staffName || 'Any Certified Stylist'}
                  </div>
                </div>
                <button
                  onClick={() => setActiveStepTab('datetime')}
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-neutral-100 min-h-[44px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Services with inline edit */}
              <div className="pb-4 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Selected Services</div>
                  <button
                    onClick={() => setActiveStepTab('services')}
                    className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-neutral-100 min-h-[44px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {state.services.map((srv: Service) => (
                    <div key={srv.id} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-neutral-800">{srv.name} ({formatDuration(srv.durationMinutes)})</span>
                      <span className="font-bold text-black">{formatPrice(srv.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-base font-black text-black">
                  <span>Total Estimated Cost</span>
                  <span>{formatPrice(state.totalPrice)}</span>
                </div>
              </div>

              {/* Guest info with inline edit */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Guest Details</div>
                  <div className="text-sm font-bold text-black mt-0.5">{state.customer?.name}</div>
                  <div className="text-xs text-neutral-500">{state.customer?.phone}</div>
                </div>
                <button
                  onClick={() => setActiveStepTab('details')}
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-neutral-100 min-h-[44px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Final CTA */}
              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  onClick={handleConfirmAppointment}
                  className="w-full bg-[#D92D20] text-white py-4 rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#B91C1C] transition flex items-center justify-center space-x-2 shadow-lg shadow-red-900/20 min-h-[50px]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming with Salon...' : 'Confirm Appointment'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
