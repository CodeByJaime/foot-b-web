import { Link } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Trophy, Calendar, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import CreateTournamentModal from '../components/ui/CreateTournamentModal';

type FilterStatus = 'all' | 'ongoing' | 'upcoming' | 'finished';

const stageGradients: Record<string, string> = {
  ongoing:  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  upcoming: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  finished: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
};

const stageGlows: Record<string, string> = {
  ongoing:  'rgba(37,99,235,0.18)',
  upcoming: 'rgba(139,92,246,0.15)',
  finished: 'rgba(100,116,139,0.12)',
};

export default function Tournaments() {
  const { tournaments, loading } = useData();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      league: 'Liga',
      cup: 'Copa',
      'groups-knockout': 'Grupos + Elim.',
      custom: 'Personalizado',
    };
    return formats[format] || format;
  };

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; bg: string; color: string }> = {
      ongoing:  { label: 'En curso',   bg: 'var(--primary-light)', color: 'var(--primary)' },
      upcoming: { label: 'Próximo',    bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
      finished: { label: 'Finalizado', bg: 'var(--surface-high)',   color: 'var(--muted-foreground)' },
    };
    return info[status] ?? info.finished;
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all',      label: 'Todos' },
    { key: 'ongoing',  label: 'En curso' },
    { key: 'upcoming', label: 'Próximos' },
    { key: 'finished', label: 'Finalizados' },
  ];

  const visible = filter === 'all' ? tournaments : tournaments.filter(t => t.status === filter);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Torneos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Administra todos tus torneos en un solo lugar
            </p>
          </div>
          <CreateTournamentModal />
        </div>

        {/* Filter chips — mobile-style pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: '#fff',
                        boxShadow: '0 2px 8px var(--primary-glow)',
                        border: '1.5px solid transparent',
                      }
                    : {
                        background: 'var(--card)',
                        color: 'var(--muted-foreground)',
                        border: '1.5px solid var(--border)',
                      }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="h-36" style={{ background: 'var(--primary-light)' }} />
                <div className="p-5 space-y-3">
                  <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--surface-high)' }} />
                  <div className="h-3 rounded-full w-1/2" style={{ background: 'var(--surface-high)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(tournament => {
              const statusInfo = getStatusInfo(tournament.status);
              const gradient = stageGradients[tournament.status] ?? stageGradients.finished;
              const glow = stageGlows[tournament.status] ?? stageGlows.finished;

              return (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="rounded-2xl overflow-hidden transition-all block group"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 24px ${glow}`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
                >
                  {/* Card gradient header */}
                  <div className="p-5 relative overflow-hidden" style={{ background: gradient }}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2"
                      style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-1/2 -translate-x-1/2"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <Trophy className="h-9 w-9 text-white mb-3 relative z-10" />
                    <h3 className="text-lg font-bold text-white relative z-10 group-hover:translate-x-0.5 transition-transform">
                      {tournament.name}
                    </h3>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--surface-high)', color: 'var(--muted-foreground)' }}
                      >
                        {getFormatLabel(tournament.format)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {new Date(tournament.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
                          {new Date(tournament.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{tournament.teams} equipos</span>
                      </div>
                    </div>

                    <div
                      className="pt-3 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                        Ver detalles →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Create new card */}
            <button
              className="rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] group transition-all"
              style={{
                background: 'var(--card)',
                border: '2px dashed var(--border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--card)';
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: 'var(--primary-light)' }}
              >
                <Plus className="h-8 w-8" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>Crear nuevo torneo</h3>
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Comienza un nuevo torneo en minutos
              </p>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
