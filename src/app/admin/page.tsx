'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { MOCK_OUTLETS } from '@/data/outlets';
import { 
  Calendar, Clock, MapPin, Scissors, User, Phone, CheckCircle2, 
  AlertCircle, Search, ShieldCheck, RefreshCw, BarChart2, Check, X, 
  Building, DollarSign, Sparkles, Filter, ChevronRight, UserCheck 
} from 'lucide-react';

interface AdminAppointment {
  id: string;
  bookingRef: string;
  createdAt: string;
  outletId: string;
  outletName: string;
  outletCity: string;
  date: string;
  time: string;
  stylist: string;
  services: { name: string; price: number }[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: 'Confirmed' | 'In-Service' | 'Completed' | 'Cancelled';
}

const INITIAL_ADMIN_APPOINTMENTS: AdminAppointment[] = [
  {
    id: 'apt-1',
    bookingRef: 'TG-312228',
    createdAt: new Date().toISOString(),
    outletId: 'out_anna_nagar',
    outletName: 'TONI&GUY Anna Nagar',
    outletCity: 'Chennai',
    date: '2026-09-04',
    time: '01:00 PM',
    stylist: 'Alex Anna',
    services: [{ name: "Men's Classic Haircut", price: 850 }],
    totalPrice: 850,
    customerName: 'Alex Mercer',
    customerPhone: '9944325757',
    notes: 'Prefers quiet service, scalp sensitive.',
    status: 'Confirmed',
  },
  {
    id: 'apt-2',
    bookingRef: 'TG-481920',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    outletId: 'out_anna_nagar',
    outletName: 'TONI&GUY Anna Nagar',
    outletCity: 'Chennai',
    date: '2026-09-04',
    time: '02:30 PM',
    stylist: 'Deepak V',
    services: [{ name: "Women's Creative Haircut", price: 1550 }, { name: 'Blow Dry & Signature Styling', price: 950 }],
    totalPrice: 2500,
    customerName: 'Sanjana R',
    customerPhone: '9840123987',
    notes: 'Attending wedding reception tonight.',
    status: 'Confirmed',
  },
  {
    id: 'apt-3',
    bookingRef: 'TG-509122',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    outletId: 'out_nungambakkam',
    outletName: 'TONI&GUY Nungambakkam',
    outletCity: 'Chennai',
    date: '2026-09-04',
    time: '11:00 AM',
    stylist: 'Priya Sharma',
    services: [{ name: "Couture Balayage / Highlights", price: 6500 }],
    totalPrice: 6500,
    customerName: 'Meera K',
    customerPhone: '9790887123',
    status: 'In-Service',
  },
  {
    id: 'apt-4',
    bookingRef: 'TG-109284',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    outletId: 'out_alwarpet',
    outletName: 'TONI&GUY Alwarpet',
    outletCity: 'Chennai',
    date: '2026-09-03',
    time: '04:00 PM',
    stylist: 'Kavita Mohan',
    services: [{ name: 'Kérastase Chronologiste Luxury Ritual', price: 3600 }],
    totalPrice: 3600,
    customerName: 'Vikram S',
    customerPhone: '9884112233',
    status: 'Completed',
  },
];

export default function SalonAdminPortalPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Confirmed' | 'In-Service' | 'Completed' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load customer bookings from localStorage on mount & sync
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toniguy_all_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: AdminAppointment[] = parsed.map((b: any, idx: number) => ({
            id: `stored-${idx}`,
            bookingRef: b.bookingRef || `TG-${100000 + idx}`,
            createdAt: b.createdAt || new Date().toISOString(),
            outletId: 'out_anna_nagar',
            outletName: b.outletName || 'TONI&GUY Anna Nagar',
            outletCity: 'Chennai',
            date: b.date || '2026-09-04',
            time: b.time || '01:00 PM',
            stylist: b.stylist || 'Alex Anna',
            services: Array.isArray(b.services)
              ? b.services.map((sName: string) => ({ name: sName, price: 850 }))
              : [{ name: "Men's Classic Haircut", price: 850 }],
            totalPrice: b.totalPrice || 850,
            customerName: b.customerName || 'Customer Guest',
            customerPhone: b.customerPhone || '9944325757',
            notes: 'Booked via Direct Mobile App',
            status: (b.status as any) || 'Confirmed',
          }));

          // Merge stored bookings with mock initial appointments (avoid duplicates by ref)
          const merged = [...mapped];
          INITIAL_ADMIN_APPOINTMENTS.forEach((item) => {
            if (!merged.some((m) => m.bookingRef === item.bookingRef)) {
              merged.push(item);
            }
          });
          setAppointments(merged);
          return;
        }
      }
    } catch (e) {
      console.error('Failed loading localStorage bookings into Admin Portal:', e);
    }
    setAppointments(INITIAL_ADMIN_APPOINTMENTS);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: AdminAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchOutlet = selectedOutlet === 'all' || apt.outletId === selectedOutlet || apt.outletName.toLowerCase().includes(selectedOutlet.toLowerCase());
    const matchStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchSearch =
      apt.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerPhone.includes(searchQuery) ||
      apt.outletName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchOutlet && matchStatus && matchSearch;
  });

  // Calculate Key Performance Indicators (KPIs)
  const totalRevenue = filteredAppointments
    .filter((a) => a.status !== 'Cancelled')
    .reduce((sum, a) => sum + a.totalPrice, 0);

  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const inServiceCount = appointments.filter((a) => a.status === 'In-Service').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-brand-surface font-sans flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-brand-black text-brand-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-widest uppercase">TONI&amp;GUY</span>
            <span className="bg-brand-red text-brand-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              Manager Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs text-neutral-400 font-medium">
              Salon Operations Manager
            </span>
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-brand-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              View Mobile App →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-red mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Real-Time Salon Appointments Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-black">
              Incoming Salon Orders &amp; Bookings
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Monitor guest check-ins, manage stylist allocations, and track salon branch revenue.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const stored = localStorage.getItem('toniguy_all_bookings');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) {
                    // Refresh trigger
                    setAppointments((prev) => [...prev]);
                  }
                }
              }}
              className="bg-brand-white border border-brand-border text-brand-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-brand-black transition flex items-center space-x-1.5 shadow-sm min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Feed</span>
            </button>

            <Link
              href="/book"
              className="bg-brand-red text-brand-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-red-hover transition flex items-center space-x-1.5 shadow-md min-h-[40px]"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>+ New Walk-In</span>
            </Link>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-brand-white p-4 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Bookings</span>
              <Calendar className="w-4 h-4 text-brand-black" />
            </div>
            <div className="text-2xl font-black text-brand-black">{appointments.length}</div>
            <div className="text-[10px] text-neutral-400 mt-1">Across all salon branches</div>
          </div>

          <div className="bg-brand-white p-4 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-brand-red">Confirmed Guests</span>
              <Clock className="w-4 h-4 text-brand-red" />
            </div>
            <div className="text-2xl font-black text-brand-red">{confirmedCount}</div>
            <div className="text-[10px] text-neutral-400 mt-1">Scheduled for arrival</div>
          </div>

          <div className="bg-brand-white p-4 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-brand-amber">In-Service Now</span>
              <UserCheck className="w-4 h-4 text-brand-amber" />
            </div>
            <div className="text-2xl font-black text-brand-amber">{inServiceCount}</div>
            <div className="text-[10px] text-neutral-400 mt-1">Currently in styling chair</div>
          </div>

          <div className="bg-brand-white p-4 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-brand-green">Expected Revenue</span>
              <DollarSign className="w-4 h-4 text-brand-green" />
            </div>
            <div className="text-2xl font-black text-brand-green">{formatPrice(totalRevenue)}</div>
            <div className="text-[10px] text-neutral-400 mt-1">Total revenue value</div>
          </div>
        </div>

        {/* Filters Bar: Branch, Status, & Search */}
        <div className="bg-brand-white p-4 rounded-2xl border border-brand-border shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Branch Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
                Branch:
              </span>
              <button
                type="button"
                onClick={() => setSelectedOutlet('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  selectedOutlet === 'all'
                    ? 'bg-brand-black text-brand-white'
                    : 'bg-brand-subtle border border-brand-border text-neutral-600 hover:border-brand-black'
                }`}
              >
                All Salons ({appointments.length})
              </button>
              {MOCK_OUTLETS.slice(0, 4).map((outlet) => (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => setSelectedOutlet(outlet.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                    selectedOutlet === outlet.id
                      ? 'bg-brand-black text-brand-white'
                      : 'bg-brand-subtle border border-brand-border text-neutral-600 hover:border-brand-black'
                  }`}
                >
                  {outlet.area}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, guest name, phone..."
                className="w-full bg-brand-subtle border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-brand-black placeholder:text-neutral-400 focus:outline-none focus:border-brand-red"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-1.5 border-t border-neutral-100 pt-3 overflow-x-auto scrollbar-none">
            {(['all', 'Confirmed', 'In-Service', 'Completed', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-brand-red text-brand-white shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 hover:text-brand-black'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Incoming Appointments Cards / Table */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-brand-white border border-dashed border-brand-border rounded-2xl p-12 text-center space-y-2">
              <Building className="w-10 h-10 text-neutral-300 mx-auto" />
              <div className="text-sm font-bold text-brand-black">No incoming appointments match the selected branch or status</div>
              <p className="text-xs text-neutral-500">Try switching your branch or status filters above.</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`bg-brand-white border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                  apt.status === 'In-Service'
                    ? 'border-brand-amber ring-1 ring-brand-amber bg-brand-amber-subtle'
                    : apt.status === 'Confirmed'
                    ? 'border-brand-border hover:border-brand-black'
                    : 'border-brand-border opacity-80'
                }`}
              >
                {/* Top Card Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-black bg-brand-black text-brand-white px-3 py-1 rounded-md">
                      {apt.bookingRef}
                    </span>
                    <span className="text-xs font-extrabold text-brand-red flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{apt.outletName}</span>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        apt.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : apt.status === 'In-Service'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : apt.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {apt.status === 'Confirmed'
                        ? '🟢 Confirmed Arrival'
                        : apt.status === 'In-Service'
                        ? '✂️ In Chair / Service'
                        : apt.status === 'Completed'
                        ? '✅ Completed & Billed'
                        : '❌ Cancelled'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Guest Info */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Guest Information</div>
                    <div className="text-sm font-black text-brand-black flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-brand-black" />
                      <span>{apt.customerName}</span>
                    </div>
                    <div className="text-xs font-bold text-neutral-600 flex items-center space-x-1.5">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <a href={`tel:${apt.customerPhone}`} className="hover:underline text-brand-red">
                        {apt.customerPhone}
                      </a>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-neutral-500 bg-brand-subtle border border-neutral-200/70 p-2 rounded-lg mt-1 italic">
                        &quot;{apt.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Scheduled Slot & Stylist */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Schedule &amp; Stylist</div>
                    <div className="text-xs font-black text-brand-black flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-red" />
                      <span>{apt.date} at {apt.time}</span>
                    </div>
                    <div className="text-xs text-neutral-600 flex items-center space-x-1.5 mt-0.5">
                      <Scissors className="w-3 h-3 text-neutral-400" />
                      <span>Assigned Stylist: <strong>{apt.stylist}</strong></span>
                    </div>
                  </div>

                  {/* Services & Revenue */}
                  <div className="bg-brand-subtle border border-neutral-200/60 p-3 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                        Booked Rituals
                      </div>
                      <ul className="space-y-1 text-xs text-brand-black font-medium">
                        {apt.services.map((s, i) => (
                          <li key={i} className="flex justify-between items-center">
                            <span>{s.name}</span>
                            <strong className="text-brand-black font-bold">{formatPrice(s.price)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">Total Order Value</span>
                      <span className="text-sm font-black text-brand-red">{formatPrice(apt.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Manager Action Toolbar */}
                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-neutral-400 font-medium">
                    Order created {new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {apt.status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt.id, 'In-Service')}
                        className="bg-brand-amber hover:bg-amber-700 text-brand-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Check-In Guest</span>
                      </button>
                    )}

                    {(apt.status === 'Confirmed' || apt.status === 'In-Service') && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                        className="bg-brand-green hover:bg-emerald-700 text-brand-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete &amp; Bill Order</span>
                      </button>
                    )}

                    {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                        className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
