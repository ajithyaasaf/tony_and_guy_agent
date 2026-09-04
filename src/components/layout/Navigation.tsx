'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/features/booking/context/BookingContext';
import { formatPrice } from '@/lib/utils';
import { Sparkles, Calendar, MapPin, Tag, Scissors, MessageSquare, Menu, X, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { state } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Concierge AI', href: '/', icon: Sparkles },
    { name: 'Services', href: '/services', icon: Scissors },
    { name: 'Offers', href: '/offers', icon: Tag },
    { name: 'My Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Find Salon', href: '/salons', icon: MapPin },
  ];

  const hasPendingBooking = state.services.length > 0 || state.outlet;

  return (
    <header className="sticky top-0 z-50 bg-brand-white/95 backdrop-blur-md border-b border-brand-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-black tracking-widest text-brand-black uppercase font-sans">
                TONI&amp;GUY
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold tracking-widest bg-brand-red text-brand-white px-2 py-0.5 uppercase rounded-sm shadow-sm">
                Concierge
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors flex items-center space-x-1.5 ${isActive
                      ? 'text-brand-red font-bold border-b-2 border-brand-red pb-1'
                      : 'text-brand-muted hover:text-brand-red'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-red' : 'text-neutral-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Booking Status */}
          <div className="hidden md:flex items-center space-x-4">
            {hasPendingBooking ? (
              <Link
                href="/book"
                className="bg-brand-red text-brand-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-brand-red-hover transition-all flex items-center space-x-2 shadow-md shadow-red-900/20"
              >
                <span>Complete Booking ({state.services.length} srv)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/book"
                className="bg-brand-red text-brand-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-brand-red-hover transition-all flex items-center space-x-2 shadow-md shadow-red-900/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            {hasPendingBooking && (
              <Link
                href="/book"
                className="bg-brand-red text-brand-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm"
              >
                Book ({state.services.length})
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-black focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-white border-b border-brand-border px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-neutral-100 font-semibold text-brand-black' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <Icon className={`w-4 h-4 ${link.href === '/offers' ? 'text-brand-red' : 'text-neutral-500'}`} />
                <span>{link.name}</span>
                {link.href === '/offers' && (
                  <span className="bg-brand-red text-brand-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ml-auto">
                    OFFERS
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-brand-black text-brand-white py-3.5 rounded-lg text-center text-xs font-bold uppercase tracking-wider block shadow-sm"
            >
              Start Direct Booking
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-white/95 backdrop-blur-lg border-t border-brand-border px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition min-h-[44px] ${isActive ? 'text-brand-red font-extrabold' : 'text-neutral-500 hover:text-brand-black'
                }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-red scale-110' : link.href === '/offers' ? 'text-brand-red' : 'text-neutral-400'}`} />
              <span>{link.name.replace('Concierge AI', 'AI Chat').replace('Offers & Combos', 'Offers')}</span>
            </Link>
          );
        })}
        <Link
          href="/book"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition min-h-[44px] relative ${pathname === '/book' ? 'text-brand-red font-extrabold' : 'text-neutral-500 hover:text-brand-black'
            }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 mb-0.5 ${pathname === '/book' ? 'text-brand-red scale-110' : 'text-neutral-400'}`} />
            {hasPendingBooking && (
              <span className="absolute -top-1 -right-2 bg-brand-red text-brand-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-brand-white">
                {state.services.length || 1}
              </span>
            )}
          </div>
          <span>Book</span>
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-white border-t border-neutral-800 py-12 px-4 sm:px-6 lg:px-8 mt-20 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="text-xl font-black tracking-widest uppercase">TONI&amp;GUY</div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            World-class hairdressing and luxury salon experiences across 64 bespoke salons in India. Editorial precision, couture hair styling, and holistic wellness.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/" className="hover:text-brand-white transition">AI Digital Concierge</Link></li>
            <li><Link href="/services" className="hover:text-brand-white transition">Service Menu &amp; Pricing</Link></li>
            <li><Link href="/offers" className="hover:text-brand-white transition">Exclusive Combos &amp; Offers</Link></li>
            <li><Link href="/salons" className="hover:text-brand-white transition">Find a Salon (64 Outlets)</Link></li>
            <li><Link href="/consultation" className="hover:text-brand-white transition">Pre-Consultation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">Salons Presence</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Chennai · Bengaluru · Mumbai · Delhi NCR · Hyderabad · Pune · Kolkata · Kochi · Coimbatore · Chandigarh
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">Client Assistance</h4>
          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            Need custom appointment assistance or bridal packages?
          </p>
          <div className="inline-block bg-brand-white text-brand-black text-xs font-semibold px-4 py-2 rounded-sm uppercase tracking-wider">
            Concierge Active
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-neutral-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-500">
        <div>&copy; {new Date().getFullYear()} TONI&amp;GUY Salon Concierge. All rights reserved.</div>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Salon Protocol</span>
        </div>
      </div>
    </footer>
  );
}
