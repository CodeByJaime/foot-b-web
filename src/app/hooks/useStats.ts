import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Match } from '../data/mockData';

export function useTopScorers(limit: number = 5) {
  const { players } = useData();
  return useMemo(() => [...players].sort((a, b) => b.goals - a.goals).slice(0, limit), [players, limit]);
}

export function useTopAssists(limit: number = 5) {
  const { players } = useData();
  return useMemo(() => [...players].sort((a, b) => b.assists - a.assists).slice(0, limit), [players, limit]);
}

export function useTeamStats(teamId: string) {
  const { teams, players } = useData();
  const team = useMemo(() => teams.find(t => t.id === teamId), [teams, teamId]);
  const teamPlayers = useMemo(() => players.filter(p => p.teamId === teamId), [players, teamId]);
  const totalGoals = useMemo(() => teamPlayers.reduce((sum, p) => sum + p.goals, 0), [teamPlayers]);
  const totalAssists = useMemo(() => teamPlayers.reduce((sum, p) => sum + p.assists, 0), [teamPlayers]);
  return { team, players: teamPlayers, totalGoals, totalAssists };
}

export function useMatchesByStatus(status: Match['status']) {
  const { matches } = useData();
  return useMemo(() => matches.filter(m => m.status === status), [matches, status]);
}

export function useTournamentStats(tournamentId: string) {
  const { matches } = useData();
  const tournamentMatches = useMemo(() => matches.filter(m => m.tournamentId === tournamentId), [matches, tournamentId]);
  const finishedMatches = useMemo(() => tournamentMatches.filter(m => m.status === 'finished'), [tournamentMatches]);
  const upcomingMatches = useMemo(() => tournamentMatches.filter(m => m.status === 'scheduled'), [tournamentMatches]);
  const liveMatches = useMemo(() => tournamentMatches.filter(m => m.status === 'live'), [tournamentMatches]);
  const totalGoals = useMemo(() =>
    finishedMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0),
    [finishedMatches]
  );
  return {
    matches: tournamentMatches,
    finishedMatches,
    upcomingMatches,
    liveMatches,
    totalGoals,
    totalMatches: tournamentMatches.length,
    completionPercentage: tournamentMatches.length > 0
      ? Math.round((finishedMatches.length / tournamentMatches.length) * 100)
      : 0,
  };
}
