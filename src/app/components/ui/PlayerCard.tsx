import { Trophy, Target } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  team: string;
  number: number;
  position: string;
  goals: number;
  assists: number;
  logo?: string;
}

export default function PlayerCard({ name, team, number, position, goals, assists, logo }: PlayerCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all group">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 relative">
        <div className="absolute top-2 right-2 text-6xl font-bold text-white/20">
          {number}
        </div>
        <div className="relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-3 backdrop-blur">
            {logo || '👤'}
          </div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-white/80 text-sm">{team}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
            {position}
          </span>
          <span className="text-2xl font-bold text-muted-foreground/30">#{number}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{goals}</span>
            </div>
            <p className="text-xs text-muted-foreground">Goles</p>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-chart-2" />
              <span className="text-2xl font-bold">{assists}</span>
            </div>
            <p className="text-xs text-muted-foreground">Asistencias</p>
          </div>
        </div>
      </div>
    </div>
  );
}
