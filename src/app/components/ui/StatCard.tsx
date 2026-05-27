import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'chart-2' | 'chart-3' | 'chart-4' | 'destructive';
  children?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'primary',
  children,
}: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    'chart-2': 'text-chart-2 bg-chart-2/10',
    'chart-3': 'text-chart-3 bg-chart-3/10',
    'chart-4': 'text-chart-4 bg-chart-4/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-3 hover:shadow-lg hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-primary">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
