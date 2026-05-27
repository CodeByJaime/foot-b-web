import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Tournament } from '../data/mockData';

export function useTournament(tournamentId?: string) {
  const { tournaments, loading } = useData();
  const tournament = useMemo(
    () => (tournamentId ? tournaments.find(t => t.id === tournamentId) ?? null : null),
    [tournaments, tournamentId]
  );
  return { tournament, loading };
}

export function useTournaments() {
  const { tournaments, loading } = useData();

  const filterByStatus = (status: Tournament['status']) =>
    tournaments.filter(t => t.status === status);

  const filterByFormat = (format: Tournament['format']) =>
    tournaments.filter(t => t.format === format);

  return { tournaments, loading, filterByStatus, filterByFormat };
}
