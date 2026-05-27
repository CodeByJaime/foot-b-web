import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ArrowLeft, Users, Trophy, Target, Square, Calendar, Shield, Star } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import EditTeamModal from '../components/ui/EditTeamModal';

export default function TeamDetail() {
  const { id } = useParams();
  const { teams, players, matches, loading } = useData();
  const { user } = useAuth();

  const team = teams.find(t => t.id === id);
  const teamPlayers = players.filter(p => p.teamId === id);
  const teamMatches = matches.filter(
    m => m.homeTeamId === id || m.awayTeamId === id
  );
  const finishedMatches = teamMatches.filter(m => m.status === 'finished');

  const isOwner = !!user && !!team?.createdBy && user.id === team.createdBy;

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      GK: 'bg-chart-3/20 text-chart-3',
      DEF: 'bg-primary/20 text-primary',
      MID: 'bg-chart-2/20 text-chart-2',
      FWD: 'bg-destructive/20 text-destructive',
    };
    return colors[position] || 'bg-muted text-muted-foreground';
  };

  const totalGoals = teamPlayers.reduce((s, p) => s + p.goals, 0);
  const totalAssists = teamPlayers.reduce((s, p) => s + p.assists, 0);
  const winRate = team
    ? Math.round((team.wins / Math.max(team.wins + team.draws + team.losses, 1)) * 100)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Cargando equipo...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Equipo no encontrado</h1>
          <Link to="/teams" className="text-primary hover:underline">← Volver a equipos</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Back */}
        <Link to="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a equipos
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-8xl drop-shadow-lg">{team.logo}</div>
              <div>
                <h1 className="text-4xl font-bold mb-1">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-white/80">
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Fundado en {team.foundedYear}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team.players} jugadores
                  </span>
                  {team.coach && (
                    <>
                      <span>·</span>
                      <span>DT: {team.coach}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Edit — solo para el creador */}
            {isOwner && (
              <div className="shrink-0">
                <EditTeamModal team={team} />
              </div>
            )}
          </div>

          {/* Record bar */}
          <div className="relative mt-6 grid grid-cols-3 gap-4 max-w-sm">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{team.wins}</p>
              <p className="text-xs text-white/70">Victorias</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{team.draws}</p>
              <p className="text-xs text-white/70">Empates</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{team.losses}</p>
              <p className="text-xs text-white/70">Derrotas</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Efectividad', value: `${winRate}%`, icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Goles del equipo', value: totalGoals, icon: Trophy, color: 'text-chart-2', bg: 'bg-chart-2/10' },
            { label: 'Asistencias', value: totalAssists, icon: Target, color: 'text-chart-4', bg: 'bg-chart-4/10' },
            { label: 'Partidos', value: teamMatches.length, icon: Calendar, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className={`${s.bg} p-2.5 rounded-lg w-fit mb-3`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Players */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Plantilla</h2>
              <span className="text-sm text-muted-foreground">{teamPlayers.length} jugadores</span>
            </div>
            {teamPlayers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No hay jugadores registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {teamPlayers
                  .sort((a, b) => a.number - b.number)
                  .map((player) => (
                    <div key={player.id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/40 transition-colors">
                      <span className="text-2xl font-bold text-muted-foreground/30 w-8 text-center shrink-0">
                        {player.number}
                      </span>
                      <div className="bg-primary/10 p-1.5 rounded-full shrink-0">
                        <span className="text-base">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{player.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm shrink-0">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Trophy className="h-3.5 w-3.5" />
                          {player.goals}
                        </span>
                        <span className="flex items-center gap-1 text-chart-2 font-semibold">
                          <Target className="h-3.5 w-3.5" />
                          {player.assists}
                        </span>
                        {player.yellowCards > 0 && (
                          <span className="flex items-center gap-0.5 text-chart-3 text-xs">
                            <Square className="h-3 w-3 fill-chart-3" />
                            {player.yellowCards}
                          </span>
                        )}
                        {player.redCards > 0 && (
                          <span className="flex items-center gap-0.5 text-destructive text-xs">
                            <Square className="h-3 w-3 fill-destructive" />
                            {player.redCards}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Match history */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Últimos partidos</h2>
              <span className="text-sm text-muted-foreground">{finishedMatches.length} jugados</span>
            </div>
            {finishedMatches.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No hay partidos finalizados</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {finishedMatches.slice(0, 6).map((match) => {
                  const isHome = match.homeTeamId === id;
                  const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                  const opponent = teams.find(t => t.id === opponentId);
                  const myScore = isHome ? match.homeScore : match.awayScore;
                  const theirScore = isHome ? match.awayScore : match.homeScore;
                  const result = myScore != null && theirScore != null
                    ? myScore > theirScore ? 'W' : myScore < theirScore ? 'L' : 'D'
                    : null;

                  const resultStyle = {
                    W: 'bg-primary/20 text-primary',
                    D: 'bg-muted text-muted-foreground',
                    L: 'bg-destructive/20 text-destructive',
                  };

                  return (
                    <div key={match.id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/40 transition-colors">
                      {result && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${resultStyle[result]}`}>
                          {result}
                        </span>
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{opponent?.logo}</span>
                        <span className="text-sm font-medium truncate">{opponent?.name}</span>
                      </div>
                      <span className="text-lg font-bold shrink-0">
                        {myScore} - {theirScore}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top performers */}
        {teamPlayers.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Mejores rendimientos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Top scorer */}
              {(() => {
                const top = [...teamPlayers].sort((a, b) => b.goals - a.goals)[0];
                return top ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Trophy className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Goleador</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-xl">👤</div>
                      <div>
                        <p className="font-bold">{top.name}</p>
                        <p className="text-sm text-muted-foreground">{top.goals} goles</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Top assist */}
              {(() => {
                const top = [...teamPlayers].sort((a, b) => b.assists - a.assists)[0];
                return top ? (
                  <div className="bg-chart-2/5 border border-chart-2/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-chart-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Asistidor</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-chart-2/10 p-2 rounded-full text-xl">👤</div>
                      <div>
                        <p className="font-bold">{top.name}</p>
                        <p className="text-sm text-muted-foreground">{top.assists} asistencias</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Captain (highest number or GK) */}
              {(() => {
                const gk = teamPlayers.find(p => p.position === 'GK');
                return gk ? (
                  <div className="bg-chart-3/5 border border-chart-3/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-chart-3 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Portero</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-chart-3/10 p-2 rounded-full text-xl">👤</div>
                      <div>
                        <p className="font-bold">{gk.name}</p>
                        <p className="text-sm text-muted-foreground">N° {gk.number}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
