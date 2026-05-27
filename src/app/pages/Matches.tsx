import DashboardLayout from '../components/layout/DashboardLayout';
import { Calendar, MapPin, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import CreateMatchModal from '../components/ui/CreateMatchModal';

export default function Matches() {
  const { matches, teams, loading } = useData();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      live: 'bg-red-500/20 text-red-500 animate-pulse',
      scheduled: 'bg-chart-2/20 text-chart-2',
      finished: 'bg-muted text-muted-foreground',
    };
    const labels: Record<string, string> = {
      live: 'EN VIVO',
      scheduled: 'Programado',
      finished: 'Finalizado',
    };
    return { style: styles[status], label: labels[status] };
  };

  const groupedMatches = {
    live: matches.filter(m => m.status === 'live'),
    upcoming: matches.filter(m => m.status === 'scheduled'),
    finished: matches.filter(m => m.status === 'finished'),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Cargando partidos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Partidos</h1>
            <p className="text-muted-foreground">Calendario y resultados de todos los partidos</p>
          </div>
          <CreateMatchModal />
        </div>

        {groupedMatches.live.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              Partidos en vivo
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {groupedMatches.live.map((match) => {
                const homeTeam = teams.find(t => t.id === match.homeTeamId);
                const awayTeam = teams.find(t => t.id === match.awayTeamId);
                return (
                  <div key={match.id} className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-2 border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-semibold text-red-500 px-3 py-1 bg-red-500/20 rounded-full animate-pulse">EN VIVO</span>
                      <span className="text-sm text-muted-foreground">45'</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">{homeTeam?.logo}</span>
                          <span className="font-semibold">{homeTeam?.name}</span>
                        </div>
                        <span className="text-4xl font-bold">{match.homeScore ?? '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">{awayTeam?.logo}</span>
                          <span className="font-semibold">{awayTeam?.name}</span>
                        </div>
                        <span className="text-4xl font-bold">{match.awayScore ?? '-'}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.venue}</div>
                      {match.referee && <div className="flex items-center gap-2"><User className="h-4 w-4" />Árbitro: {match.referee}</div>}
                    </div>
                    <button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors font-medium">
                      Ver detalles del partido
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Próximos partidos</h2>
          <div className="space-y-3">
            {groupedMatches.upcoming.length === 0 && (
              <p className="text-muted-foreground">No hay partidos programados</p>
            )}
            {groupedMatches.upcoming.map((match) => {
              const homeTeam = teams.find(t => t.id === match.homeTeamId);
              const awayTeam = teams.find(t => t.id === match.awayTeamId);
              const statusBadge = getStatusBadge(match.status);
              return (
                <div key={match.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-32 text-center md:border-r md:border-border md:pr-6">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-sm font-semibold">
                          {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground">{match.time}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{homeTeam?.logo}</span>
                          <span className="font-semibold flex-1">{homeTeam?.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{awayTeam?.logo}</span>
                          <span className="font-semibold flex-1">{awayTeam?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-64 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{match.venue}</div>
                      {match.referee && <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />{match.referee}</div>}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.style}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Partidos finalizados</h2>
          <div className="space-y-3">
            {groupedMatches.finished.length === 0 && (
              <p className="text-muted-foreground">No hay partidos finalizados</p>
            )}
            {groupedMatches.finished.map((match) => {
              const homeTeam = teams.find(t => t.id === match.homeTeamId);
              const awayTeam = teams.find(t => t.id === match.awayTeamId);
              return (
                <div key={match.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-32 text-center md:border-r md:border-border md:pr-6">
                      <p className="text-xs text-muted-foreground mb-2">Final</p>
                      <p className="text-3xl font-bold">{match.homeScore} - {match.awayScore}</p>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{homeTeam?.logo}</span>
                          <span className="font-semibold flex-1">{homeTeam?.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{awayTeam?.logo}</span>
                          <span className="font-semibold flex-1">{awayTeam?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-64 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.venue}</div>
                      <button className="text-primary hover:underline font-medium">Ver estadísticas →</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
