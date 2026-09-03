'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/features/booking/context/BookingContext';
import { MOCK_OUTLETS } from '@/data/outlets';
import { PreConsultationData } from '@/types';
import { Sparkles, MessageSquare, Check, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function ConsultationPage() {
  const router = useRouter();
  const { dispatch } = useBooking();

  const [concern, setConcern] = useState('Hair Colour & Transformation');
  const [currentSituation, setCurrentSituation] = useState('');
  const [previousTreatments, setPreviousTreatments] = useState('');
  const [desiredResult, setDesiredResult] = useState('');
  const [maintenance, setMaintenance] = useState<'low' | 'medium' | 'high' | 'flexible'>('low');
  const [preferredOutletId, setPreferredOutletId] = useState(MOCK_OUTLETS[0].id);
  const [submitted, setSubmitted] = useState(false);

  const concernsList = [
    'Hair Colour & Transformation (Balayage / Highlights)',
    'Frizz Control & Keratin Smoothing',
    'Hair Fall & Scalp Health Therapy',
    'Creative Haircut & Face-Shape Styling',
    'Skin Brightening & Anti-Aging Facials',
    'Bridal / Event Makeover Diagnostic'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleBookWithConsultation = () => {
    const outlet = MOCK_OUTLETS.find((o) => o.id === preferredOutletId) || MOCK_OUTLETS[0];
    dispatch({ type: 'SET_OUTLET', payload: outlet });
    router.push('/book');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Banner */}
      <div className="bg-[#F7F7F7] border-b border-[#E5E5E5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            Bespoke Diagnostic Protocol
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-2">
            Hair &amp; Beauty Pre-Consultation
          </h1>
          <p className="text-sm text-[#666666] mt-2 leading-relaxed">
            Share your current hair condition, past treatments, and aesthetic goals. Our Creative Directors will prepare custom formulations and recommendations prior to your visit.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {submitted ? (
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase text-black tracking-tight">
              Diagnostic Summary Recorded
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-lg mx-auto leading-relaxed">
              Your consultation profile for <strong>{concern}</strong> is safely linked to your session. Let&apos;s schedule your appointment with a certified Creative Director.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleBookWithConsultation}
                className="bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center space-x-2"
              >
                <span>Proceed to Appointment Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="border border-neutral-300 text-neutral-700 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition"
              >
                Edit Consultation Notes
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Primary Concern */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">
                1. What is your primary area of focus?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {concernsList.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setConcern(item)}
                    className={`text-left p-3.5 rounded-lg text-xs font-medium border transition ${
                      concern === item
                        ? 'bg-black text-white border-black'
                        : 'bg-[#F7F7F7] text-neutral-800 border-[#E5E5E5] hover:border-black'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Current Hair / Skin Situation */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                2. Describe your current hair or skin condition
              </label>
              <p className="text-[11px] text-neutral-500 mb-3">
                E.g., &quot;Medium-length dark brown hair, dry ends, frizzy in humid weather.&quot;
              </p>
              <textarea
                rows={3}
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                placeholder="Type your current hair texture, length, or concerns..."
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-3.5 text-xs sm:text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400"
              />
            </div>

            {/* 3. Previous Treatments */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                3. Have you had any chemical treatments in the last 12 months?
              </label>
              <p className="text-[11px] text-neutral-500 mb-3">
                E.g., Global colour, bleaching, keratin, cysteine, botox, or henna/box dye.
              </p>
              <input
                type="text"
                value={previousTreatments}
                onChange={(e) => setPreviousTreatments(e.target.value)}
                placeholder="E.g., Balayage 6 months ago, no henna..."
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-3.5 text-xs sm:text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400"
              />
            </div>

            {/* 4. Desired Aesthetic Goal */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                4. What is your desired aesthetic result?
              </label>
              <p className="text-[11px] text-neutral-500 mb-3">
                E.g., &quot;Subtle sun-kissed caramel balayage that blends seamlessly with regrowth.&quot;
              </p>
              <input
                type="text"
                value={desiredResult}
                onChange={(e) => setDesiredResult(e.target.value)}
                placeholder="E.g., Warm caramel highlights with face-framing layers..."
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-3.5 text-xs sm:text-sm focus:outline-none focus:border-black text-black placeholder:text-neutral-400"
              />
            </div>

            {/* 5. Maintenance Preference & Salon selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">
                  5. Maintenance Preference
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'low', label: 'Low Maintenance (Touch up every 4-6 months)' },
                    { id: 'medium', label: 'Moderate (Touch up every 8-10 weeks)' },
                    { id: 'high', label: 'High Precision (Frequent root & cut refresh)' },
                    { id: 'flexible', label: 'Flexible / As recommended by Stylist' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMaintenance(m.id as any)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition ${
                        maintenance === m.id
                          ? 'bg-black text-white border-black'
                          : 'bg-[#F7F7F7] text-neutral-800 border-[#E5E5E5] hover:border-black'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                    6. Preferred Salon
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    Choose which salon should prepare your diagnostic notes.
                  </p>
                  <select
                    value={preferredOutletId}
                    onChange={(e) => setPreferredOutletId(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-3 text-xs focus:outline-none focus:border-black text-black"
                  >
                    {MOCK_OUTLETS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center space-x-2 text-[11px] text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span>Confidential pre-consultation saved to your session</span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center space-x-2 shadow-md"
              >
                <span>Save Consultation &amp; Plan Visit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
