'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { BookingState } from '@/types';
import { BookingAction, bookingReducer, INITIAL_BOOKING_STATE } from '../bookingReducer';

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, INITIAL_BOOKING_STATE);

  const resetBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
  };

  return (
    <BookingContext.Provider value={{ state, dispatch, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
