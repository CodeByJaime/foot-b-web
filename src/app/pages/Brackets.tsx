import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Brackets() {
  const { tournamentId } = useParams();
  const { tournaments, teams, loading } = useData();

  const tournament = tournaments.find(t => t.id === tournamentId);

  const bracketData = {
    semifinals: [
      { match: 1, team1: teams[0], team2: teams[1], score1: 2, score2: 1, winner: teams[0] },
      { match: 2, team1: teams[2], team2: teams[3], score1: 1, score2: 3, winner: teams[3] },
    ],
    final: {
      match: 3,
      team1: teams[0],
      team2: teams[3],
      score1: null as number | null,
      score2: null as number | null,
      winner: null as typeof teams[0] | null,
    },
  };

  const MatchCard = ({ team1, team2, score1, score2, winner, isUpcoming }: any) => (
    <div className="bg-card border-2 border-border rounded-lg overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all">
      <div className={`flex items-center gap-4 p-4 ${winner?.id === team1?.id ? 'bg-primary/10' : ''}`}>
        <span className="text-2xl">{team1?.logo}</span>
        <span className="flex-1 font-semibold">{team1?.name || '—'}</span>
        <span className="text-2xl font-bold min-w-[2rem] text-center">{isUpcoming ? '-' : score1}</span>
      </div>
      <div className="border-t border-border" />
      <div className={`flex items-center gap-4 p-4 ${winner?.id === team2?.id ? 'bg-primary/10' : ''}`}>
        <span className="text-2xl">{team2?.logo}</span>
        <span className="flex-1 font-semibold">{team2?.name || '—'}</span>
        <span className="text-2xl font-bold min-w-[2rem] text-center">{isUpcoming ? '-' : score2}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Cargando llaves...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sf = bracketData.semifinals;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Llaves Eliminatorias</h1>
          <p className="text-muted-foreground">{tournament?.name || 'Torneo'}</p>
        </div>

        <div className="bg-gradient-to-br from-background via-primary/5 to-background rounded-xl p-8">
          <div className="max-w-6xl mx-auto">
            <div className="hidden lg:grid grid-cols-7 gap-8 items-center">
              <div className="col-span-2 space-y-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">SEMIFINAL 1</p>
                  {sf[0] && <MatchCard {...sf[0]} />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">SEMIFINAL 2</p>
                  {sf[1] && <MatchCard {...sf[1]} />}
                </div>
              </div>

              <div className="col-span-1 relative h-full">
                <svg className="w-full h-full" viewBox="0 0 100 400" preserveAspectRatio="none">
                  <path d="M 0 100 L 50 100 L 50 200 L 100 200" stroke="currentColor" strokeWidth="2" fill="none" className="text-border" />
                  <path d="M 0 300 L 50 300 L 50 200 L 100 200" stroke="currentColor" strokeWidth="2" fill="none" className="text-border" />
                </svg>
              </div>

              <div className="col-span-2">
                <div className="relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🏆 FINAL
                  </div>
                  <MatchCard {...bracketData.final} isUpcoming={true} />
                </div>
              </div>

              <div className="col-span-2 flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-full inline-block shadow-xl shadow-primary/30">
                    <Trophy className="h-16 w-16 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">CAMPEÓN</p>
                    <p className="text-xl font-bold text-muted-foreground/50">Por definir</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:hidden space-y-6">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg">
                  🏆 CAMINO AL TÍTULO
                </div>
              </div>
              <div className="space-y-6">
                {sf.map((s, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-center mb-3 text-primary">SEMIFINAL {i + 1}</p>
                    <MatchCard {...s} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="h-12 w-0.5 bg-gradient-to-b from-primary to-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  🏆 GRAN FINAL
                </p>
                <MatchCard {...bracketData.final} isUpcoming={true} />
              </div>
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-full inline-block shadow-xl shadow-primary/30 mb-4">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">CAMPEÓN</p>
                <p className="text-xl font-bold text-muted-foreground/50">Por definir</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Calendario de Partidos</h2>
          <div className="space-y-3">
            {sf.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 px-3 py-2 rounded-lg">
                    <p className="text-xs text-primary font-semibold">SEMIFINAL {i + 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.team1?.logo}</span>
                    <span className="font-medium">{s.team1?.name}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-xl">{s.team2?.logo}</span>
                    <span className="font-medium">{s.team2?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">18 May 2026</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? '16:00' : '19:00'} hrs</p>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-primary to-secondary px-3 py-2 rounded-lg">
                  <p className="text-xs text-white font-bold">🏆 FINAL</p>
                </div>
                <span className="font-medium text-muted-foreground">Por definir</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">25 May 2026</p>
                <p className="text-xs text-muted-foreground">18:00 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
