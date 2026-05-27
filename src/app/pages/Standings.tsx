import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Standings() {
  const { tournamentId } = useParams();
  const { tournaments, teams, standings, loading } = useData();

  const tournament = tournaments.find(t => t.id === tournamentId);
  const standingsList = standings[tournamentId || ''] || [];

  const getPositionBadge = (position: number) => {
    if (position <= 2) return 'bg-primary text-primary-foreground';
    if (position <= 4) return 'bg-chart-2/20 text-chart-2';
    if (position >= standingsList.length - 1) return 'bg-destructive/20 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const getPositionIcon = (position: number) => {
    if (position <= 2) return <Trophy className="h-4 w-4" />;
    if (position <= 4) return <TrendingUp className="h-4 w-4" />;
    if (position >= standingsList.length - 1) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Cargando tabla...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tabla de Posiciones</h1>
          <p className="text-muted-foreground">{tournament?.name || 'Torneo'}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span>Clasificación directa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-chart-2/20 border border-chart-2 rounded" />
            <span>Repechaje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive/20 border border-destructive rounded" />
            <span>Descenso</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Pos</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Equipo</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">PJ</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">PG</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">PE</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">PP</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">GF</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">GC</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">DG</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {standingsList.map((standing, index) => {
                  const team = teams.find(t => t.id === standing.teamId);
                  const position = index + 1;
                  return (
                    <tr key={standing.teamId} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionBadge(position)}`}>
                            {position}
                          </span>
                          <div className="text-muted-foreground">{getPositionIcon(position)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{team?.logo}</span>
                          <div>
                            <p className="font-semibold">{team?.name}</p>
                            {position <= 2 && <p className="text-xs text-primary">Clasificado</p>}
                            {position > 2 && position <= 4 && <p className="text-xs text-chart-2">Repechaje</p>}
                            {position >= standingsList.length - 1 && standingsList.length > 2 && (
                              <p className="text-xs text-destructive">Zona de descenso</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{standing.played}</td>
                      <td className="px-6 py-4 text-center"><span className="text-primary font-semibold">{standing.won}</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-chart-3 font-semibold">{standing.drawn}</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-destructive font-semibold">{standing.lost}</span></td>
                      <td className="px-6 py-4 text-center font-medium">{standing.goalsFor}</td>
                      <td className="px-6 py-4 text-center font-medium">{standing.goalsAgainst}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${standing.goalDifference > 0 ? 'text-primary' : standing.goalDifference < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-bold bg-primary text-primary-foreground px-3 py-1 rounded-lg">
                          {standing.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {standingsList.length >= 2 && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Equipo líder</h3>
              </div>
              {standingsList[0] && (() => {
                const team = teams.find(t => t.id === standingsList[0].teamId);
                return (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team?.logo}</span>
                    <div>
                      <p className="font-bold">{team?.name}</p>
                      <p className="text-sm text-muted-foreground">{standingsList[0].points} puntos</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-chart-2/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="font-semibold">Mejor ataque</h3>
              </div>
              {(() => {
                const best = standingsList.reduce((p, c) => p.goalsFor > c.goalsFor ? p : c);
                const team = teams.find(t => t.id === best.teamId);
                return (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team?.logo}</span>
                    <div>
                      <p className="font-bold">{team?.name}</p>
                      <p className="text-sm text-muted-foreground">{best.goalsFor} goles a favor</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-chart-4/10 p-3 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="font-semibold">Mejor defensa</h3>
              </div>
              {(() => {
                const best = standingsList.reduce((p, c) => p.goalsAgainst < c.goalsAgainst ? p : c);
                const team = teams.find(t => t.id === best.teamId);
                return (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team?.logo}</span>
                    <div>
                      <p className="font-bold">{team?.name}</p>
                      <p className="text-sm text-muted-foreground">{best.goalsAgainst} goles en contra</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
