export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatShortDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

export const formatTime = (time: string) => {
  return time;
};

export const calculatePercentage = (value: number, total: number) => {
  return Math.round((value / total) * 100);
};

export const getWinRate = (wins: number, totalMatches: number) => {
  if (totalMatches === 0) return 0;
  return Math.round((wins / totalMatches) * 100);
};

export const formatScore = (homeScore: number | null, awayScore: number | null) => {
  if (homeScore === null || awayScore === null) {
    return 'vs';
  }
  return `${homeScore} - ${awayScore}`;
};
