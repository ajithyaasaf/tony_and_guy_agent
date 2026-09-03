import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { BookingProvider } from '@/features/booking/context/BookingContext';
import { Header } from '@/components/layout/Navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

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
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} min-h-screen bg-white text-[#111111] flex flex-col antialiased selection:bg-black selection:text-white`}>
        <BookingProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </BookingProvider>
      </body>
    </html>
  );
}
