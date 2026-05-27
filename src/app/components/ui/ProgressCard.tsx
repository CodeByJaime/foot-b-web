import { Progress } from '@radix-ui/react-progress';
import { LucideIcon } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  icon: LucideIcon;
  color?: string;
}

export default function ProgressCard({ title, value, total, icon: Icon, color = 'primary' }: ProgressCardProps) {
  const percentage = (value / total) * 100;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`bg-${color}/10 p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {value} / {total}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{percentage.toFixed(0)}%</p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
