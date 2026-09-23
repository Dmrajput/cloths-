import { useState } from 'react';

export function useBookings() {
  const [bookings, setBookings] = useState([]);

  return {
    bookings,
    setBookings,
  };
}
