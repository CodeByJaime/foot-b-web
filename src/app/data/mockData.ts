export interface Tournament {
  id: string;
  name: string;
  format: 'league' | 'cup' | 'groups-knockout' | 'custom';
  startDate: string;
  endDate: string;
  teams: number;
  status: 'upcoming' | 'ongoing' | 'finished';
  logo?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  foundedYear: number;
  coach: string;
  players: number;
  wins: number;
  draws: number;
  losses: number;
  createdBy?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  photo?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished';
  referee?: string;
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Liga Amateur Primavera 2026',
    format: 'league',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    teams: 12,
    status: 'ongoing',
  },
  {
    id: '2',
    name: 'Copa de Verano',
    format: 'cup',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    teams: 16,
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Torneo Regional',
    format: 'groups-knockout',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    teams: 8,
    status: 'finished',
  },
];

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Deportivo Estrella',
    logo: '⭐',
    foundedYear: 2015,
    coach: 'Carlos Martínez',
    players: 18,
    wins: 8,
    draws: 3,
    losses: 1,
  },
  {
    id: '2',
    name: 'FC Águilas',
    logo: '🦅',
    foundedYear: 2018,
    coach: 'Roberto Silva',
    players: 20,
    wins: 7,
    draws: 4,
    losses: 1,
  },
  {
    id: '3',
    name: 'Unidos FC',
    logo: '⚽',
    foundedYear: 2020,
    coach: 'Diego López',
    players: 16,
    wins: 6,
    draws: 3,
    losses: 3,
  },
  {
    id: '4',
    name: 'Leones del Sur',
    logo: '🦁',
    foundedYear: 2016,
    coach: 'Miguel Ángel Ruiz',
    players: 19,
    wins: 5,
    draws: 5,
    losses: 2,
  },
  {
    id: '5',
    name: 'Atlético Victoria',
    logo: '🏆',
    foundedYear: 2019,
    coach: 'Fernando Gómez',
    players: 17,
    wins: 4,
    draws: 4,
    losses: 4,
  },
  {
    id: '6',
    name: 'Tigres Unidos',
    logo: '🐯',
    foundedYear: 2017,
    coach: 'Luis Hernández',
    players: 18,
    wins: 3,
    draws: 3,
    losses: 6,
  },
];

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alejandro Ramírez',
    number: 10,
    position: 'FWD',
    teamId: '1',
    goals: 15,
    assists: 7,
    yellowCards: 2,
    redCards: 0,
  },
  {
    id: '2',
    name: 'Gabriel Torres',
    number: 9,
    position: 'FWD',
    teamId: '2',
    goals: 12,
    assists: 5,
    yellowCards: 3,
    redCards: 0,
  },
  {
    id: '3',
    name: 'Martín Suárez',
    number: 7,
    position: 'MID',
    teamId: '1',
    goals: 8,
    assists: 10,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: '4',
    name: 'Lucas Fernández',
    number: 1,
    position: 'GK',
    teamId: '1',
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: '5',
    name: 'Diego Vargas',
    number: 4,
    position: 'DEF',
    teamId: '2',
    goals: 2,
    assists: 3,
    yellowCards: 5,
    redCards: 1,
  },
];

export const mockMatches: Match[] = [
  {
    id: '1',
    tournamentId: '1',
    homeTeamId: '1',
    awayTeamId: '2',
    homeScore: 2,
    awayScore: 1,
    date: '2026-05-10',
    time: '15:00',
    venue: 'Estadio Municipal',
    status: 'finished',
    referee: 'Juan Pérez',
  },
  {
    id: '2',
    tournamentId: '1',
    homeTeamId: '3',
    awayTeamId: '4',
    homeScore: null,
    awayScore: null,
    date: '2026-05-15',
    time: '18:00',
    venue: 'Campo Deportivo Central',
    status: 'live',
    referee: 'Ana García',
  },
  {
    id: '3',
    tournamentId: '1',
    homeTeamId: '5',
    awayTeamId: '6',
    homeScore: null,
    awayScore: null,
    date: '2026-05-18',
    time: '16:00',
    venue: 'Polideportivo Norte',
    status: 'scheduled',
    referee: 'Carlos Ramírez',
  },
];

export const mockStandings: Record<string, Standing[]> = {
  '1': [
    {
      teamId: '1',
      played: 12,
      won: 8,
      drawn: 3,
      lost: 1,
      goalsFor: 25,
      goalsAgainst: 10,
      goalDifference: 15,
      points: 27,
    },
    {
      teamId: '2',
      played: 12,
      won: 7,
      drawn: 4,
      lost: 1,
      goalsFor: 22,
      goalsAgainst: 12,
      goalDifference: 10,
      points: 25,
    },
    {
      teamId: '3',
      played: 12,
      won: 6,
      drawn: 3,
      lost: 3,
      goalsFor: 18,
      goalsAgainst: 15,
      goalDifference: 3,
      points: 21,
    },
    {
      teamId: '4',
      played: 12,
      won: 5,
      drawn: 5,
      lost: 2,
      goalsFor: 17,
      goalsAgainst: 14,
      goalDifference: 3,
      points: 20,
    },
    {
      teamId: '5',
      played: 12,
      won: 4,
      drawn: 4,
      lost: 4,
      goalsFor: 15,
      goalsAgainst: 16,
      goalDifference: -1,
      points: 16,
    },
    {
      teamId: '6',
      played: 12,
      won: 3,
      drawn: 3,
      lost: 6,
      goalsFor: 12,
      goalsAgainst: 20,
      goalDifference: -8,
      points: 12,
    },
  ],
};
