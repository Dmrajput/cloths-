import { useState } from 'react';

export function useListings() {
  const [listings, setListings] = useState([]);

  return {
    listings,
    setListings,
  };
}
