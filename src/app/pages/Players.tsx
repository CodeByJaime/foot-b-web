import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Trophy, Target, Square } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import CreatePlayerModal from '../components/ui/CreatePlayerModal';

export default function Players() {
  const { players, teams, loading } = useData();

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      GK: 'bg-chart-3/20 text-chart-3',
      DEF: 'bg-primary/20 text-primary',
      MID: 'bg-chart-2/20 text-chart-2',
      FWD: 'bg-destructive/20 text-destructive',
    };
    return colors[position] || 'bg-muted text-muted-foreground';
  };

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Jugadores</h1>
            <p className="text-muted-foreground">Gestiona jugadores y estadísticas</p>
          </div>
          <CreatePlayerModal />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar jugadores..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select className="px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Todas las posiciones</option>
            <option>Portero (GK)</option>
            <option>Defensa (DEF)</option>
            <option>Mediocampo (MID)</option>
            <option>Delantero (FWD)</option>
          </select>
        </div>

        {!loading && topScorers.length > 0 && (
          <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Tabla de Goleadores
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {topScorers.map((player, index) => {
                const team = teams.find(t => t.id === player.teamId);
                return (
                  <div key={player.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl font-bold text-white/50">#{index + 1}</span>
                          <div>
                            <p className="font-bold text-white">{player.name}</p>
                            <p className="text-sm text-white/70">{team?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">{player.goals}</p>
                        <p className="text-xs text-white/70">goles</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">#</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Jugador</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Equipo</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">Pos.</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">Goles</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">Asist.</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">TA</th>
                  <th className="px-6 py-4 text-center text-sm font-medium">TR</th>
                  <th className="px-6 py-4 text-right text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        Cargando jugadores...
                      </div>
                    </td>
                  </tr>
                ) : players.map((player) => {
                  const team = teams.find(t => t.id === player.teamId);
                  return (
                    <tr key={player.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-2xl text-muted-foreground/30">{player.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">👤</span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-muted-foreground">N° {player.number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{team?.logo}</span>
                          <span className="text-sm">{team?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{player.goals}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Target className="h-4 w-4 text-chart-2" />
                          <span className="font-semibold">{player.assists}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Square className="h-4 w-4 text-chart-3 fill-chart-3" />
                          <span className="font-semibold">{player.yellowCards}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Square className="h-4 w-4 text-destructive fill-destructive" />
                          <span className="font-semibold">{player.redCards}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-primary hover:underline">Ver perfil</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
