import { Service, Outlet, Offer, Staff, TimeSlot, TimePreference } from '@/types';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OUTLETS } from '@/data/outlets';
import { MOCK_OFFERS } from '@/data/offers';
import { addDays, format, isSaturday, isSunday, nextSaturday, nextSunday } from 'date-fns';

export interface ExtractedBookingIntent {
  intent: 'BOOK_APPOINTMENT' | 'SERVICE_INFO' | 'OFFERS' | 'FIND_SALON' | 'PRE_CONSULTATION' | 'GENERAL_QUESTION';
  services: Service[];
  offer: Offer | null;
  outlet: Outlet | null;
  locationQuery: string | null;
  date: string | null;
  dateLabel?: string;
  timePreference: TimePreference | null;
  stylistPreference: 'any' | 'specific';
  responseMessage: string;
}

export function parseNaturalLanguageInput(input: string, today: Date = new Date()): ExtractedBookingIntent {
  const text = input.toLowerCase().trim();

  // 1. Identify Intent
  let intent: ExtractedBookingIntent['intent'] = 'GENERAL_QUESTION';
  if (text.includes('consult') || text.includes('hair problem') || text.includes('treatment advice')) {
    intent = 'PRE_CONSULTATION';
  } else if (text.includes('offer') || text.includes('combo') || text.includes('discount') || text.includes('package')) {
    intent = 'OFFERS';
  } else if (text.includes('salon') || text.includes('outlet') || text.includes('near me') || text.includes('locate') || text.includes('branch')) {
    intent = 'FIND_SALON';
  } else if (text.includes('price') || text.includes('how much') || text.includes('cost')) {
    intent = 'SERVICE_INFO';
  } else if (text.includes('book') || text.includes('appointment') || text.includes('haircut') || text.includes('facial') || text.includes('slot') || text.includes('want') || text.includes('need')) {
    intent = 'BOOK_APPOINTMENT';
  }

  // 2. Identify Services
  const matchedServices: Service[] = [];
  MOCK_SERVICES.forEach((srv) => {
    const srvName = srv.name.toLowerCase();
    if (text.includes(srvName)) {
      matchedServices.push(srv);
      return;
    }
    // Keyword checks
    if ((text.includes('haircut') || text.includes('cut') || text.includes('hair cut')) && srv.id === 'srv_men_haircut' && !text.includes('women')) {
      if (!matchedServices.some((s) => s.id === 'srv_men_haircut' || s.id === 'srv_women_haircut')) {
        matchedServices.push(srv);
      }
    } else if (text.includes('women haircut') && srv.id === 'srv_women_haircut') {
      matchedServices.push(srv);
    } else if ((text.includes('beard') || text.includes('shave') || text.includes('trim')) && srv.id === 'srv_beard_trim') {
      if (!matchedServices.some((s) => s.id === 'srv_beard_trim')) matchedServices.push(srv);
    } else if (text.includes('spa') && srv.id === 'srv_hair_spa') {
      if (!matchedServices.some((s) => s.id === 'srv_hair_spa')) matchedServices.push(srv);
    } else if ((text.includes('colour') || text.includes('color') || text.includes('highlights') || text.includes('balayage')) && srv.id === 'srv_global_colour_women') {
      if (!matchedServices.some((s) => s.id === 'srv_global_colour_women')) matchedServices.push(srv);
    } else if ((text.includes('facial') || text.includes('cleanup')) && srv.id === 'srv_sothys_cleanup') {
      if (!matchedServices.some((s) => s.id === 'srv_sothys_cleanup')) matchedServices.push(srv);
    } else if ((text.includes('pedicure') || text.includes('feet')) && srv.id === 'srv_deluxe_pedicure') {
      if (!matchedServices.some((s) => s.id === 'srv_deluxe_pedicure')) matchedServices.push(srv);
    }
  });

  // 3. Identify Offers
  let matchedOffer: Offer | null = null;
  MOCK_OFFERS.forEach((off) => {
    const offName = off.name.toLowerCase();
    if (text.includes(offName) || (text.includes('haircut') && text.includes('beard') && text.includes('spa') && off.id === 'off_1')) {
      matchedOffer = off;
    }
  });

  // 4. Identify Outlets & Locations
  let matchedOutlet: Outlet | null = null;
  let locationQuery: string | null = null;

  for (const out of MOCK_OUTLETS) {
    const area = out.area.toLowerCase();
    const city = out.city.toLowerCase();
    const name = out.name.toLowerCase();
    if (text.includes(area) || text.includes(name)) {
      matchedOutlet = out;
      locationQuery = out.area;
      break;
    } else if (text.includes(city) && !matchedOutlet) {
      locationQuery = out.city;
    }
  }

  // 5. Identify Dates
  let extractedDate: string | null = null;
  let dateLabel: string | undefined = undefined;

  if (text.includes('tomorrow')) {
    const d = addDays(today, 1);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'Tomorrow';
  } else if (text.includes('today')) {
    extractedDate = format(today, 'yyyy-MM-dd');
    dateLabel = 'Today';
  } else if (text.includes('saturday')) {
    const d = isSaturday(today) ? today : nextSaturday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Saturday';
  } else if (text.includes('sunday')) {
    const d = isSunday(today) ? today : nextSunday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Sunday';
  }

  // 6. Identify Time Preferences
  let timePreference: TimePreference | null = null;
  if (text.includes('evening') || text.includes('night') || text.includes('after 6') || text.includes('after 6 pm')) {
    timePreference = { type: 'EVENING', time: '18:00' };
  } else if (text.includes('morning')) {
    timePreference = { type: 'MORNING', time: '10:00' };
  } else if (text.includes('afternoon')) {
    timePreference = { type: 'AFTERNOON', time: '14:00' };
  } else if (text.includes('7 pm') || text.includes('7:00 pm') || text.includes('7pm') || text.includes('19:00')) {
    timePreference = { type: 'EXACT', time: '19:00' };
  } else if (text.includes('8 pm') || text.includes('8:00 pm') || text.includes('8pm') || text.includes('20:00')) {
    timePreference = { type: 'EXACT', time: '20:00' };
  } else if (text.includes('6 pm') || text.includes('6:00 pm') || text.includes('6pm') || text.includes('18:00')) {
    timePreference = { type: 'EXACT', time: '18:00' };
  } else if (text.includes('5 pm') || text.includes('5:00 pm') || text.includes('5pm') || text.includes('17:00')) {
    timePreference = { type: 'EXACT', time: '17:00' };
  }

  // 7. Stylist preference
  const stylistPreference: 'any' | 'specific' = text.includes('any stylist') || text.includes('anyone') ? 'any' : 'any';

  // 8. Formulate Response Message
  let responseMessage = 'Certainly! I can help you with your TONI&GUY experience.';

  if (matchedOffer) {
    const offerObj = matchedOffer as Offer;
    responseMessage = `I found the exclusive package: **${offerObj.name}** at the offer price of ₹${offerObj.offerPrice.toLocaleString('en-IN')} (Save ₹${offerObj.savings.toLocaleString('en-IN')}). Let's select your salon and date.`;
  } else if (matchedServices.length > 0) {
    const srvNames = matchedServices.map((s) => s.name).join(' and ');
    if (matchedOutlet && extractedDate && timePreference) {
      responseMessage = `Understood! **${srvNames}** at **${matchedOutlet.name}** for **${dateLabel || extractedDate}** around **${timePreference.time || 'your preferred time'}**. Checking availability now...`;
    } else if (matchedOutlet && extractedDate) {
      responseMessage = `Great! Setting up **${srvNames}** at **${matchedOutlet.name}** on **${dateLabel || extractedDate}**. Please choose your preferred time slot below.`;
    } else if (matchedOutlet) {
      responseMessage = `Got it! **${srvNames}** at **${matchedOutlet.name}**. Which date works best for you?`;
    } else if (extractedDate) {
      responseMessage = `Perfect! **${srvNames}** on **${dateLabel || extractedDate}**. Which TONI&GUY salon would you like to visit?`;
    } else {
      responseMessage = `I've noted your request for **${srvNames}**. Which salon would you like to visit?`;
    }
  } else if (matchedOutlet) {
    responseMessage = `Looking at **${matchedOutlet.name}**. What services would you like to schedule?`;
  } else if (intent === 'OFFERS') {
    responseMessage = 'Here are our most popular bespoke combos and curated packages.';
  } else if (intent === 'FIND_SALON') {
    responseMessage = 'Here are our nearby salons across Chennai, Bengaluru, Mumbai, and Delhi NCR.';
  }

  return {
    intent,
    services: matchedServices,
    offer: matchedOffer,
    outlet: matchedOutlet,
    locationQuery,
    date: extractedDate,
    dateLabel,
    timePreference,
    stylistPreference,
    responseMessage,
  };
}
