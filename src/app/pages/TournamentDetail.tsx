import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Calendar, Users, Trophy, BarChart3, GitBranch, Settings, Share2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function TournamentDetail() {
  const { id } = useParams();
  const { tournaments, teams, matches, standings, loading } = useData();

  const tournament = tournaments.find(t => t.id === id);
  const tournamentMatches = matches.filter(m => m.tournamentId === id);
  const standingsList = standings[id || ''] || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Cargando torneo...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tournament) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Torneo no encontrado</h1>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ongoing: 'bg-primary text-primary-foreground',
      upcoming: 'bg-chart-2 text-white',
      finished: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const stats = [
    { label: 'Equipos', value: tournament.teams, icon: Users, color: 'text-primary' },
    { label: 'Partidos jugados', value: tournamentMatches.filter(m => m.status === 'finished').length, icon: Calendar, color: 'text-chart-2' },
    { label: 'Partidos restantes', value: tournamentMatches.filter(m => m.status !== 'finished').length, icon: Trophy, color: 'text-chart-3' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'ongoing' ? 'En curso' : tournament.status === 'upcoming' ? 'Próximo' : 'Finalizado'}
                    </span>
                    <span className="text-white/80">
                      Formato: {tournament.format === 'league' ? 'Liga' : tournament.format === 'cup' ? 'Copa' : 'Grupos + Eliminación'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Compartir
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurar
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Fecha de inicio</p>
                <p className="text-xl font-semibold">
                  {new Date(tournament.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Fecha de fin</p>
                <p className="text-xl font-semibold">
                  {new Date(tournament.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Duración</p>
                <p className="text-xl font-semibold">
                  {Math.ceil((new Date(tournament.endDate).getTime() - new Date(tournament.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={`/standings/${id}`} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <div className="bg-primary/10 p-3 rounded-lg w-fit mb-3 group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Tabla de posiciones</h3>
            <p className="text-sm text-muted-foreground">Ver clasificación actual</p>
          </Link>
          <Link to={`/brackets/${id}`} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <div className="bg-chart-2/10 p-3 rounded-lg w-fit mb-3 group-hover:bg-chart-2/20 transition-colors">
              <GitBranch className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="font-semibold mb-1">Llaves</h3>
            <p className="text-sm text-muted-foreground">Ver eliminatorias</p>
          </Link>
          <Link to="/matches" className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <div className="bg-chart-3/10 p-3 rounded-lg w-fit mb-3 group-hover:bg-chart-3/20 transition-colors">
              <Calendar className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="font-semibold mb-1">Calendario</h3>
            <p className="text-sm text-muted-foreground">Ver todos los partidos</p>
          </Link>
          <Link to="/teams" className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <div className="bg-chart-4/10 p-3 rounded-lg w-fit mb-3 group-hover:bg-chart-4/20 transition-colors">
              <Users className="h-6 w-6 text-chart-4" />
            </div>
            <h3 className="font-semibold mb-1">Equipos</h3>
            <p className="text-sm text-muted-foreground">Gestionar equipos</p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Top 3 Equipos</h2>
            <div className="space-y-3">
              {standingsList.length === 0 && (
                <p className="text-muted-foreground text-sm">No hay clasificación disponible</p>
              )}
              {standingsList.slice(0, 3).map((standing, index) => {
                const team = teams.find(t => t.id === standing.teamId);
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={standing.teamId} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <span className="text-3xl">{medals[index]}</span>
                    <span className="text-2xl">{team?.logo}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{team?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {standing.played} PJ • {standing.won} PG • {standing.points} PTS
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{standing.points}</p>
                      <p className="text-xs text-muted-foreground">puntos</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to={`/standings/${id}`} className="block text-center text-sm text-primary hover:underline mt-4">
              Ver tabla completa →
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Últimos resultados</h2>
            <div className="space-y-3">
              {tournamentMatches.filter(m => m.status === 'finished').length === 0 && (
                <p className="text-muted-foreground text-sm">No hay resultados aún</p>
              )}
              {tournamentMatches
                .filter(m => m.status === 'finished')
                .slice(0, 3)
                .map((match) => {
                  const homeTeam = teams.find(t => t.id === match.homeTeamId);
                  const awayTeam = teams.find(t => t.id === match.awayTeamId);
                  return (
                    <div key={match.id} className="p-4 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xl">{homeTeam?.logo}</span>
                          <span className="font-medium text-sm">{homeTeam?.name}</span>
                        </div>
                        <div className="px-4 py-1 bg-muted rounded-lg font-bold">
                          {match.homeScore} - {match.awayScore}
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-medium text-sm">{awayTeam?.name}</span>
                          <span className="text-xl">{awayTeam?.logo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <Link to="/matches" className="block text-center text-sm text-primary hover:underline mt-4">
              Ver todos los partidos →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
