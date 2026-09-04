export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  sortOrder: number;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number; // in Rupees
  durationMinutes: number;
  audience: 'men' | 'women' | 'unisex';
  popular?: boolean;
  image?: string;
  includedSteps?: string[];
  status: 'active' | 'inactive';
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  savings: number;
  serviceIds: string[];
  includedServices: string[];
  durationMinutes: number;
  audience: 'men' | 'women' | 'unisex';
  terms?: string;
  badge?: string;
  status: 'active' | 'inactive';
}

export interface Outlet {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  area: string;
  pinCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingHours: {
    open: string;
    close: string;
    days: string;
  };
  features: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive';
}

export interface Staff {
  id: string;
  name: string;
  outletId: string;
  role: 'Stylist' | 'Senior Stylist' | 'Top Stylist' | 'Creative Director' | 'Master Colourist';
  experienceYears: number;
  specialities: string[];
  rating: number;
  status: 'active' | 'inactive';
}

export interface TimeSlot {
  time: string; // e.g. "10:30", "19:00"
  displayTime: string; // "10:30 AM", "07:00 PM"
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
}

export type StylistPreference = 'any' | 'specific';

export interface TimePreference {
  type: 'ANY' | 'EXACT' | 'AFTER' | 'BEFORE' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  time?: string; // e.g. "18:00"
}

export type BookingStatus = 
  | 'idle'
  | 'collecting'
  | 'checking_availability'
  | 'selecting_slot'
  | 'customer_details'
  | 'reviewing'
  | 'confirming'
  | 'confirmed'
  | 'request_submitted'
  | 'error';

export type BookingField = 'services' | 'outlet' | 'stylist' | 'date' | 'time' | 'customer';

export interface BookingState {
  intent: 'BOOK_APPOINTMENT' | null;
  services: Service[];
  selectedOffer: Offer | null;
  outlet: Outlet | null;
  locationPreference: string | null;
  stylistPreference: StylistPreference;
  selectedStaff: Staff | null;
  date: string | null; // YYYY-MM-DD
  timePreference: TimePreference | null;
  selectedSlot: TimeSlot | null;
  customer: CustomerInfo | null;
  
  // Computed values
  totalDuration: number;
  totalPrice: number;
  
  // Workflow tracking
  status: BookingStatus;
  missingFields: BookingField[];
  completedFields: BookingField[];
  errorMessage: string | null;
  bookingReference?: string;
}

export interface PreConsultationData {
  id?: string;
  concern: string;
  currentSituation: string;
  previousTreatments: string;
  desiredResult: string;
  maintenancePreference: 'low' | 'medium' | 'high' | 'flexible';
  preferredOutletId?: string;
  customerInfo?: CustomerInfo;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
}

export interface SisterSalonSuggestion {
  originalOutlet: Outlet;
  sisterOutlet: Outlet;
  distanceKm: number;
  distanceFormatted: string;
  date: string;
  suggestedSlot: TimeSlot;
  requestedTime?: string;
  headline: string;
}
