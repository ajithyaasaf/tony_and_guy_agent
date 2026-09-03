import { Service, Outlet, Offer, TimePreference } from '@/types';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OUTLETS } from '@/data/outlets';
import { MOCK_OFFERS } from '@/data/offers';
import { addDays, format, isSaturday, isSunday, nextSaturday, nextSunday, isMonday, nextMonday, isTuesday, nextTuesday, isWednesday, nextWednesday, isThursday, nextThursday, isFriday, nextFriday } from 'date-fns';

export interface ExtractedBookingIntent {
  intent: 'BOOK_APPOINTMENT' | 'SERVICE_INFO' | 'OFFERS' | 'FIND_SALON' | 'PRE_CONSULTATION' | 'GREETING' | 'GENERAL_QUESTION';
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
  const rawText = input.trim();
  const text = rawText.toLowerCase();

  // 1. Identify Intent
  let intent: ExtractedBookingIntent['intent'] = 'GENERAL_QUESTION';

  // Check for Greetings & Thanks
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|greetings)\b/i.test(text)) {
    intent = 'GREETING';
  } else if (text.includes('thanks') || text.includes('thank you') || text.includes('awesome') || text.includes('great')) {
    return {
      intent: 'GREETING',
      services: [],
      offer: null,
      outlet: null,
      locationQuery: null,
      date: null,
      timePreference: null,
      stylistPreference: 'any',
      responseMessage: "You're very welcome! Let me know whenever you'd like to reserve a time or explore our luxury menu."
    };
  } else if (text.includes('consult') || text.includes('hair problem') || text.includes('treatment advice') || text.includes('damaged hair') || text.includes('dandruff') || text.includes('fall')) {
    intent = 'PRE_CONSULTATION';
  } else if (text.includes('offer') || text.includes('combo') || text.includes('discount') || text.includes('package') || text.includes('deal')) {
    intent = 'OFFERS';
  } else if (text.includes('salon') || text.includes('outlet') || text.includes('near me') || text.includes('locate') || text.includes('branch') || text.includes('where is')) {
    intent = 'FIND_SALON';
  } else if (text.includes('price') || text.includes('how much') || text.includes('cost') || text.includes('charges') || text.includes('rate')) {
    intent = 'SERVICE_INFO';
  } else if (text.includes('book') || text.includes('appointment') || text.includes('haircut') || text.includes('facial') || text.includes('slot') || text.includes('want') || text.includes('need') || text.includes('schedule') || text.includes('reserve')) {
    intent = 'BOOK_APPOINTMENT';
  }

  // 2. Identify Services with Strict Gender Isolation & Synonyms
  const matchedServices: Service[] = [];
  
  // Gender detection flags
  const isWomenSpecific = /\b(women|woman|ladies|female|girl)\b/.test(text);
  const isMenSpecific = /\b(men|man|gents|male|boy)\b/.test(text);

  MOCK_SERVICES.forEach((srv) => {
    const srvName = srv.name.toLowerCase();
    
    // Direct match
    if (text.includes(srvName)) {
      if (!matchedServices.some((s) => s.id === srv.id)) matchedServices.push(srv);
      return;
    }

    // Haircuts
    if (srv.id === 'srv_women_haircut' && isWomenSpecific && (text.includes('cut') || text.includes('haircut') || text.includes('styling'))) {
      if (!matchedServices.some((s) => s.id === 'srv_women_haircut')) matchedServices.push(srv);
    } else if (srv.id === 'srv_men_haircut' && (isMenSpecific || (!isWomenSpecific && (text.includes('haircut') || text.includes('hair cut') || text.includes('cut'))))) {
      if (!matchedServices.some((s) => s.id === 'srv_men_haircut' || s.id === 'srv_women_haircut')) {
        matchedServices.push(srv);
      }
    }

    // Beard / Shave
    if (srv.id === 'srv_beard_trim' && (text.includes('beard') || text.includes('shave') || text.includes('trim') || text.includes('mustache'))) {
      if (!matchedServices.some((s) => s.id === 'srv_beard_trim')) matchedServices.push(srv);
    }

    // Hair Spa & Treatments
    if (srv.id === 'srv_hair_spa' && (text.includes('spa') || text.includes('hair spa') || text.includes('treatment') || text.includes('keratin') || text.includes('botox'))) {
      if (!matchedServices.some((s) => s.id === 'srv_hair_spa')) matchedServices.push(srv);
    }

    // Hair Colour & Highlights
    if (srv.id === 'srv_global_colour_women' && (text.includes('colour') || text.includes('color') || text.includes('highlights') || text.includes('balayage') || text.includes('touchup') || text.includes('streaks'))) {
      if (!matchedServices.some((s) => s.id === 'srv_global_colour_women')) matchedServices.push(srv);
    }

    // Facials & Cleanup
    if (srv.id === 'srv_sothys_cleanup' && (text.includes('facial') || text.includes('cleanup') || text.includes('skin') || text.includes('glow'))) {
      if (!matchedServices.some((s) => s.id === 'srv_sothys_cleanup')) matchedServices.push(srv);
    }

    // Pedicure & Feet Care
    if (srv.id === 'srv_deluxe_pedicure' && (text.includes('pedicure') || text.includes('feet') || text.includes('manicure') || text.includes('nails'))) {
      if (!matchedServices.some((s) => s.id === 'srv_deluxe_pedicure')) matchedServices.push(srv);
    }
  });

  // 3. Identify Offers & Combos
  let matchedOffer: Offer | null = null;
  MOCK_OFFERS.forEach((off) => {
    const offName = off.name.toLowerCase();
    if (text.includes(offName) || (text.includes('haircut') && text.includes('beard') && text.includes('spa') && off.id === 'off_1')) {
      matchedOffer = off;
    }
  });

  // 4. Normalize Location & Match Outlets
  let matchedOutlet: Outlet | null = null;
  let locationQuery: string | null = null;

  // Location aliases & shorthands
  const locationAliases: Record<string, string> = {
    'annanagar': 'Anna Nagar',
    'anna nagar': 'Anna Nagar',
    'nungambakkam': 'Nungambakkam',
    'nungambakam': 'Nungambakkam',
    'knk': 'Nungambakkam',
    'alwarpet': 'Alwarpet',
    'adyar': 'Adyar',
    'ecr': 'ECR',
    'neelankarai': 'ECR',
    'omr': 'OMR',
    'thoraipakkam': 'OMR',
    'velachery': 'Velachery',
    'velacheri': 'Velachery',
    'besant nagar': 'Besant Nagar',
    'kilpauk': 'Kilpauk',
    't nagar': 'T. Nagar',
    'tnagar': 'T. Nagar',
    'indiranagar': 'Indiranagar',
    'indira nagar': 'Indiranagar',
    'koramangala': 'Koramangala',
    'lavelle': 'Lavelle Road',
    'whitefield': 'Whitefield',
    'jayanagar': 'Jayanagar',
    'hsr': 'HSR Layout',
    'jubilee': 'Jubilee Hills',
    'banjara': 'Banjara Hills',
    'gachibowli': 'Gachibowli',
    'hitec': 'Madhapur',
    'madhapur': 'Madhapur',
    'bandra': 'Bandra West',
    'juhu': 'Juhu',
    'worli': 'Worli',
    'powai': 'Powai',
    'gurgaon': 'Gurgaon',
    'gurugram': 'Gurgaon',
    'saket': 'Saket',
  };

  let normalizedSearchKey = text;
  for (const [alias, realArea] of Object.entries(locationAliases)) {
    if (text.includes(alias)) {
      normalizedSearchKey = realArea.toLowerCase();
      locationQuery = realArea;
      break;
    }
  }

  for (const out of MOCK_OUTLETS) {
    const area = out.area.toLowerCase();
    const city = out.city.toLowerCase();
    const name = out.name.toLowerCase();
    if (normalizedSearchKey.includes(area) || text.includes(area) || text.includes(name)) {
      matchedOutlet = out;
      locationQuery = out.area;
      break;
    } else if (text.includes(city) && !matchedOutlet) {
      locationQuery = out.city;
    }
  }

  // 5. Robust Date Parsing (Handles tomorrow, day after tomorrow, weekdays, etc.)
  let extractedDate: string | null = null;
  let dateLabel: string | undefined = undefined;

  if (text.includes('day after tomorrow')) {
    const d = addDays(today, 2);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = format(d, 'EEEE, MMM d');
  } else if (text.includes('tomorrow')) {
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
  } else if (text.includes('friday')) {
    const d = isFriday(today) ? today : nextFriday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Friday';
  } else if (text.includes('monday')) {
    const d = isMonday(today) ? today : nextMonday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Monday';
  } else if (text.includes('tuesday')) {
    const d = isTuesday(today) ? today : nextTuesday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Tuesday';
  } else if (text.includes('wednesday')) {
    const d = isWednesday(today) ? today : nextWednesday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Wednesday';
  } else if (text.includes('thursday')) {
    const d = isThursday(today) ? today : nextThursday(today);
    extractedDate = format(d, 'yyyy-MM-dd');
    dateLabel = 'This Thursday';
  }

  // 6. Dynamic Regex Time Extraction (e.g., 7 pm, 11:30 am, 4pm, 19:00, evening)
  let timePreference: TimePreference | null = null;
  const timeRegex = /\b(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)\b/i;
  const match = text.match(timeRegex);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? match[2] : '00';
    const period = match[3].toLowerCase();

    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    const formattedHour = hour.toString().padStart(2, '0');
    const formattedTime = `${formattedHour}:${minute}`;

    let category: TimePreference['type'] = 'EXACT';
    if (hour < 12) category = 'MORNING';
    else if (hour < 16) category = 'AFTERNOON';
    else category = 'EVENING';

    timePreference = { type: category, time: formattedTime };
  } else if (text.includes('evening') || text.includes('night') || text.includes('after 6')) {
    timePreference = { type: 'EVENING', time: '18:00' };
  } else if (text.includes('morning')) {
    timePreference = { type: 'MORNING', time: '10:00' };
  } else if (text.includes('afternoon')) {
    timePreference = { type: 'AFTERNOON', time: '14:00' };
  }

  // 7. Stylist preference
  const stylistPreference: 'any' | 'specific' = 'any';

  // 8. Formulate Conversational Response
  let responseMessage = 'Welcome to TONI&GUY! How may I assist with your appointment today?';

  if (intent === 'GREETING') {
    responseMessage = 'Hello! Welcome to TONI&GUY. I can help you reserve haircuts, hair spa, colouring, or book an appointment at your nearest salon. What would you like to schedule?';
  } else if (matchedOffer) {
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
    if (locationQuery) {
      responseMessage = `Searching for TONI&GUY salons near **${locationQuery}**. Here are our closest locations:`;
    } else {
      responseMessage = 'Here are our nearby salons across Chennai, Bengaluru, Hyderabad, Mumbai, and Delhi NCR.';
    }
  } else if (intent === 'SERVICE_INFO') {
    responseMessage = 'Our signature services start from ₹850 for Men Haircuts, ₹1,250 for Women Haircuts, and ₹2,500 for Kérastase Hair Spa. What service would you like details on?';
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
