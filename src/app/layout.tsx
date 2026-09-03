import type { Metadata } from 'next';
import './globals.css';
import { BookingProvider } from '@/features/booking/context/BookingContext';
import { Header, Footer } from '@/components/layout/Navigation';

export const metadata: Metadata = {
  title: 'TONI&GUY | AI Digital Salon Concierge & Appointment Booking',
  description: 'Experience effortless salon discovery, adaptive appointment booking, bespoke services, and exclusive combos across 64 TONI&GUY salons in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#111111] flex flex-col antialiased selection:bg-black selection:text-white">
        <BookingProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </BookingProvider>
      </body>
    </html>
  );
}
