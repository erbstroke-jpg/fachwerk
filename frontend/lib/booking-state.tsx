"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface BookingState {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  modalOpen: boolean;
}

interface BookingContextType extends BookingState {
  setCheckIn: (d: Date | undefined) => void;
  setCheckOut: (d: Date | undefined) => void;
  setGuests: (n: number) => void;
  openModal: () => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BookingContext.Provider value={{
      checkIn, setCheckIn,
      checkOut, setCheckOut,
      guests, setGuests,
      modalOpen,
      openModal: () => setModalOpen(true),
      closeModal: () => setModalOpen(false),
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
