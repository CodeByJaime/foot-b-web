export const TOURNAMENT_FORMATS = {
  LEAGUE: 'league',
  CUP: 'cup',
  GROUPS_KNOCKOUT: 'groups-knockout',
  CUSTOM: 'custom',
} as const;

export const TOURNAMENT_FORMATS_LABELS = {
  [TOURNAMENT_FORMATS.LEAGUE]: 'Liga',
  [TOURNAMENT_FORMATS.CUP]: 'Copa',
  [TOURNAMENT_FORMATS.GROUPS_KNOCKOUT]: 'Grupos + Eliminación',
  [TOURNAMENT_FORMATS.CUSTOM]: 'Personalizado',
};

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
} as const;

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.SCHEDULED]: 'Programado',
  [MATCH_STATUS.LIVE]: 'En vivo',
  [MATCH_STATUS.FINISHED]: 'Finalizado',
};

export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
} as const;

export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.UPCOMING]: 'Próximo',
  [TOURNAMENT_STATUS.ONGOING]: 'En curso',
  [TOURNAMENT_STATUS.FINISHED]: 'Finalizado',
};

export const PLAYER_POSITIONS = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD',
} as const;

export const PLAYER_POSITIONS_LABELS = {
  [PLAYER_POSITIONS.GK]: 'Portero',
  [PLAYER_POSITIONS.DEF]: 'Defensa',
  [PLAYER_POSITIONS.MID]: 'Mediocampo',
  [PLAYER_POSITIONS.FWD]: 'Delantero',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  REFEREE: 'referee',
  PLAYER: 'player',
  SPECTATOR: 'spectator',
} as const;

export const POINTS_SYSTEM = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
};
