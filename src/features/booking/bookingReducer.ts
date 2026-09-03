import { BookingState, BookingField, Service, Offer, Outlet, Staff, TimeSlot, CustomerInfo, StylistPreference, TimePreference } from '@/types';

export const INITIAL_BOOKING_STATE: BookingState = {
  intent: 'BOOK_APPOINTMENT',
  services: [],
  selectedOffer: null,
  outlet: null,
  locationPreference: null,
  stylistPreference: 'any',
  selectedStaff: null,
  date: null,
  timePreference: null,
  selectedSlot: null,
  customer: null,
  totalDuration: 0,
  totalPrice: 0,
  status: 'idle',
  missingFields: ['services', 'outlet', 'date', 'time', 'customer'],
  completedFields: [],
  errorMessage: null,
};

export function computeMissingFields(state: BookingState): BookingField[] {
  const missing: BookingField[] = [];
  if (!state.services || state.services.length === 0) {
    missing.push('services');
  }
  if (!state.outlet) {
    missing.push('outlet');
  }
  if (!state.date) {
    missing.push('date');
  }
  if (!state.selectedSlot) {
    missing.push('time');
  }
  if (!state.customer || !state.customer.name || !state.customer.phone) {
    missing.push('customer');
  }
  return missing;
}

export function computeCompletedFields(state: BookingState): BookingField[] {
  const completed: BookingField[] = [];
  if (state.services && state.services.length > 0) completed.push('services');
  if (state.outlet) completed.push('outlet');
  if (state.stylistPreference === 'any' || state.selectedStaff) completed.push('stylist');
  if (state.date) completed.push('date');
  if (state.selectedSlot) completed.push('time');
  if (state.customer && state.customer.name && state.customer.phone) completed.push('customer');
  return completed;
}

export type BookingAction =
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'SET_OFFER'; payload: { offer: Offer; services: Service[] } }
  | { type: 'CLEAR_OFFER' }
  | { type: 'SET_OUTLET'; payload: Outlet }
  | { type: 'SET_LOCATION_PREFERENCE'; payload: string }
  | { type: 'SET_STYLIST_PREFERENCE'; payload: StylistPreference }
  | { type: 'SELECT_STAFF'; payload: Staff | null }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME_PREFERENCE'; payload: TimePreference }
  | { type: 'SELECT_SLOT'; payload: TimeSlot }
  | { type: 'SET_CUSTOMER'; payload: CustomerInfo }
  | { type: 'SET_STATUS'; payload: BookingState['status'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CONFIRM_BOOKING'; payload: { bookingReference: string } }
  | { type: 'RESET_BOOKING' };

function recalculateTotals(services: Service[], offer: Offer | null) {
  if (offer) {
    return {
      totalDuration: offer.durationMinutes,
      totalPrice: offer.offerPrice,
    };
  }
  const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalPrice = services.reduce((acc, s) => acc + (s.price || 0), 0);
  return { totalDuration, totalPrice };
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  let newState: BookingState;

  switch (action.type) {
    case 'SET_SERVICES': {
      const { totalDuration, totalPrice } = recalculateTotals(action.payload, state.selectedOffer);
      newState = {
        ...state,
        services: action.payload,
        totalDuration,
        totalPrice,
        // Reset selected slot since duration might change
        selectedSlot: null,
      };
      break;
    }

    case 'ADD_SERVICE': {
      if (state.services.some((s) => s.id === action.payload.id)) {
        return state;
      }
      const updatedServices = [...state.services, action.payload];
      const { totalDuration, totalPrice } = recalculateTotals(updatedServices, null);
      newState = {
        ...state,
        services: updatedServices,
        selectedOffer: null, // Clear offer if custom services modified
        totalDuration,
        totalPrice,
        selectedSlot: null,
      };
      break;
    }

    case 'REMOVE_SERVICE': {
      const updatedServices = state.services.filter((s) => s.id !== action.payload);
      const { totalDuration, totalPrice } = recalculateTotals(updatedServices, null);
      newState = {
        ...state,
        services: updatedServices,
        selectedOffer: null,
        totalDuration,
        totalPrice,
        selectedSlot: null,
      };
      break;
    }

    case 'SET_OFFER': {
      newState = {
        ...state,
        selectedOffer: action.payload.offer,
        services: action.payload.services,
        totalDuration: action.payload.offer.durationMinutes,
        totalPrice: action.payload.offer.offerPrice,
        selectedSlot: null,
      };
      break;
    }

    case 'CLEAR_OFFER': {
      newState = {
        ...state,
        selectedOffer: null,
      };
      break;
    }

    case 'SET_OUTLET': {
      newState = {
        ...state,
        outlet: action.payload,
        locationPreference: null,
        selectedStaff: null,
        selectedSlot: null,
      };
      break;
    }

    case 'SET_LOCATION_PREFERENCE': {
      newState = {
        ...state,
        locationPreference: action.payload,
      };
      break;
    }

    case 'SET_STYLIST_PREFERENCE': {
      newState = {
        ...state,
        stylistPreference: action.payload,
        selectedStaff: action.payload === 'any' ? null : state.selectedStaff,
      };
      break;
    }

    case 'SELECT_STAFF': {
      newState = {
        ...state,
        selectedStaff: action.payload,
        stylistPreference: action.payload ? 'specific' : 'any',
        selectedSlot: null,
      };
      break;
    }

    case 'SET_DATE': {
      newState = {
        ...state,
        date: action.payload,
        selectedSlot: null,
      };
      break;
    }

    case 'SET_TIME_PREFERENCE': {
      newState = {
        ...state,
        timePreference: action.payload,
      };
      break;
    }

    case 'SELECT_SLOT': {
      newState = {
        ...state,
        selectedSlot: action.payload,
        errorMessage: null,
      };
      break;
    }

    case 'SET_CUSTOMER': {
      newState = {
        ...state,
        customer: action.payload,
      };
      break;
    }

    case 'SET_STATUS': {
      return {
        ...state,
        status: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        errorMessage: action.payload,
      };
    }

    case 'CONFIRM_BOOKING': {
      return {
        ...state,
        status: 'confirmed',
        bookingReference: action.payload.bookingReference,
      };
    }

    case 'RESET_BOOKING': {
      return { ...INITIAL_BOOKING_STATE };
    }

    default:
      return state;
  }

  const missingFields = computeMissingFields(newState);
  const completedFields = computeCompletedFields(newState);

  return {
    ...newState,
    missingFields,
    completedFields,
  };
}
