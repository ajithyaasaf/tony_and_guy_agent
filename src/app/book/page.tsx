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
  Sparkles, CheckCircle2, ShieldCheck, AlertCircle, Edit3 
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
              <Check className="w-7 h-7" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* =========================================================================
            STEP 1: SERVICES SELECTION
           ========================================================================= */}
        {activeStepTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Step 1: Choose Your Services
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Select one or multiple precision services.
                </p>
              </div>

              {state.services.length > 0 && (
                <button
                  onClick={() => setActiveStepTab('outlet')}
                  className="mt-3 sm:mt-0 bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center space-x-1.5"
                >
                  <span>Proceed to Salon ({state.services.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_SERVICES.map((srv: Service) => {
                const selected = state.services.some((s: Service) => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv)}
                    className={`cursor-pointer border rounded-xl p-5 flex flex-col justify-between transition-all ${
                      selected
                        ? 'border-black ring-1 ring-black bg-[#FAFAFA]'
                        : 'border-[#E5E5E5] hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        <span>{srv.categoryName}</span>
                        {selected && <Check className="w-4 h-4 text-black" />}
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
          </div>
        )}

        {/* =========================================================================
            STEP 2: OUTLET SELECTION
           ========================================================================= */}
        {activeStepTab === 'outlet' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Step 2: Choose Salon Location
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Select which TONI&amp;GUY outlet you would like to visit.
                </p>
              </div>

              {state.outlet && (
                <button
                  onClick={() => setActiveStepTab('datetime')}
                  className="mt-3 sm:mt-0 bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center space-x-1.5"
                >
                  <span>Proceed to Date &amp; Time</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City filter tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'Chennai', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    selectedCity === city
                      ? 'bg-black text-white'
                      : 'bg-white border border-[#E5E5E5] text-neutral-700 hover:border-black'
                  }`}
                >
                  {city === 'all' ? 'All Outlets' : city}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_OUTLETS.filter((o) => selectedCity === 'all' || o.city === selectedCity).map((outlet) => {
                const selected = state.outlet?.id === outlet.id;
                return (
                  <div
                    key={outlet.id}
                    onClick={() => {
                      dispatch({ type: 'SET_OUTLET', payload: outlet });
                      setActiveStepTab('datetime');
                    }}
                    className={`cursor-pointer border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                      selected
                        ? 'border-black ring-1 ring-black bg-[#FAFAFA]'
                        : 'border-[#E5E5E5] hover:border-black bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {outlet.city} · {outlet.area}
                        </span>
                        {selected && <Check className="w-4 h-4 text-black" />}
                      </div>
                      <h3 className="text-base font-black text-black">{outlet.name}</h3>
                      <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">{outlet.address}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span>{outlet.openingHours.open} - {outlet.openingHours.close}</span>
                      <span className="font-bold text-black">{selected ? 'Selected' : 'Select Salon →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DATE & TIME SELECTION (ADAPTIVE AVAILABILITY ENGINE)
           ========================================================================= */}
        {activeStepTab === 'datetime' && (
          <div className="space-y-8 animate-fade-in">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      state.stylistPreference === 'any' && !state.selectedStaff
                        ? 'bg-black text-white'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:border-black'
                    }`}
                  >
                    Any Available Certified Stylist
                  </button>
                  {currentOutletStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => dispatch({ type: 'SELECT_STAFF', payload: staff })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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

            {/* Date Picker Ribbon */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                Choose Date
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {availableDates.map((item) => {
                  const isSelected = state.date === item.iso;
                  return (
                    <button
                      key={item.iso}
                      onClick={() => dispatch({ type: 'SET_DATE', payload: item.iso })}
                      className={`p-3 rounded-xl text-center border transition ${
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
                    Showing real-time salon openings
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
                          setActiveStepTab('details');
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
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
          </div>
        )}

        {/* =========================================================================
            STEP 4: GUEST DETAILS
           ========================================================================= */}
        {activeStepTab === 'details' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
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
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="E.g. Siddharth Verma"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Mobile Number (for SMS confirmation) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="E.g. +91 98400 12345"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="E.g. siddharth@example.com"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-black"
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

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveStepTab('datetime')}
                  className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Time Selection</span>
                </button>

                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition"
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
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-[#E5E5E5]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Step 5: Review &amp; Confirm
              </h2>
              <p className="text-xs text-[#666666] mt-1">
                Please verify all appointment details before final confirmation.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Salon Details with inline edit */}
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Salon Location</div>
                  <div className="text-base font-bold text-black mt-0.5">{state.outlet?.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{state.outlet?.address}, {state.outlet?.city}</div>
                </div>
                <button
                  onClick={() => setActiveStepTab('outlet')}
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1"
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
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1"
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
                    className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1"
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
                  className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center space-x-1"
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
                  className="w-full bg-black text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center space-x-2 shadow-lg"
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
