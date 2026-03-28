import React from 'react';
import ReservationSearchClient from '@/components/ReservationSearchClient';

export default function ReservationSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <ReservationSearchClient initialQuery={searchParams.q || ""} />;
}
