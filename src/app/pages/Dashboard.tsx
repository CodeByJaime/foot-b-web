import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy, Users, Calendar, TrendingUp, Plus, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Dashboard() {
  const { tournaments, teams, matches, loading } = useData();

  const stats = [
    {
      title: 'Torneos activos',
      value: tournaments.filter(t => t.status === 'ongoing').length,
      icon: Trophy,
      trend: '+12%',
      iconBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      glowColor: 'rgba(37,99,235,0.18)',
      trendColor: '#16a34a',
      trendBg: '#dcfce7',
    },
    {
      title: 'Equipos totales',
      value: teams.length,
      icon: Users,
      trend: '+8%',
      iconBg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
      glowColor: 'rgba(8,145,178,0.15)',
      trendColor: '#16a34a',
      trendBg: '#dcfce7',
    },
    {
      title: 'Partidos jugados',
      value: matches.filter(m => m.status === 'finished').length,
      icon: Calendar,
      trend: '+25%',
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      glowColor: 'rgba(139,92,246,0.15)',
      trendColor: '#16a34a',
      trendBg: '#dcfce7',
    },
    {
      title: 'Próximos partidos',
      value: matches.filter(m => m.status === 'scheduled').length,
      icon: TrendingUp,
      trend: '+5%',
      iconBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      glowColor: 'rgba(217,119,6,0.15)',
      trendColor: '#16a34a',
      trendBg: '#dcfce7',
    },
  ];

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const recentActivity = [
    { type: 'match', text: 'Partido finalizado: Deportivo Estrella 2 - 1 FC Águilas', time: '2 horas' },
    { type: 'team', text: 'Nuevo equipo registrado: Tigres Unidos', time: '5 horas' },
    { type: 'tournament', text: 'Torneo creado: Copa de Verano', time: '1 día' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--muted-foreground)' }} className="text-sm">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Hero banner — gradient like mobile drawer header */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full translate-y-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />

          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Bienvenido de vuelta — aquí está tu resumen
            </p>
          </div>

          <Link
            to="/tournaments"
            className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 self-start md:self-auto"
            style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <Plus className="h-4 w-4" />
            Crear torneo
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: stat.iconBg, boxShadow: `0 3px 10px ${stat.glowColor}` }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: stat.trendBg, color: stat.trendColor }}
                  >
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Matches & Activity */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Upcoming matches */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Próximos partidos</h2>
              <Link
                to="/matches"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingMatches.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay partidos próximos</p>
              )}
              {upcomingMatches.slice(0, 4).map((match) => {
                const homeTeam = teams.find(t => t.id === match.homeTeamId);
                const awayTeam = teams.find(t => t.id === match.awayTeamId);
                return (
                  <div
                    key={match.id}
                    className="rounded-xl p-4 space-y-2"
                    style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{homeTeam?.logo}</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{homeTeam?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{awayTeam?.logo}</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{awayTeam?.name}</span>
                        </div>
                      </div>

                      {match.status === 'live' && (
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                            style={{ background: 'var(--destructive-light)', color: 'var(--destructive)' }}
                          >
                            EN VIVO
                          </span>
                          <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                            {match.homeScore} - {match.awayScore}
                          </span>
                        </div>
                      )}
                      {match.status === 'scheduled' && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs font-semibold justify-end" style={{ color: 'var(--muted-foreground)' }}>
                            <Calendar className="h-3 w-3" />
                            {match.date}
                          </div>
                          <div className="flex items-center gap-1 text-xs justify-end mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="h-3 w-3" />
                            {match.time}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="h-3 w-3" />
                      {match.venue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Actividad reciente</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3"
                  style={{ borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--primary-light)' }}
                  >
                    {activity.type === 'match' && <Calendar className="h-4 w-4" style={{ color: 'var(--primary)' }} />}
                    {activity.type === 'team' && <Users className="h-4 w-4" style={{ color: 'var(--primary)' }} />}
                    {activity.type === 'tournament' && <Trophy className="h-4 w-4" style={{ color: 'var(--primary)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{activity.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Hace {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active tournaments */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Torneos activos</h2>
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.filter(t => t.status === 'ongoing').map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                className="rounded-xl overflow-hidden transition-all group block"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-high)' }}
              >
                {/* Tournament card header */}
                <div
                  className="p-4 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <Trophy className="h-7 w-7 text-white relative z-10 mb-2" />
                  <h3 className="font-bold text-white text-sm relative z-10 group-hover:translate-x-0.5 transition-transform">
                    {tournament.name}
                  </h3>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
                      {new Date(tournament.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Users className="h-3.5 w-3.5" />
                    <span>{tournament.teams} equipos</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                      En curso
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                      Ver →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {tournaments.filter(t => t.status === 'ongoing').length === 0 && (
              <p className="text-sm col-span-3" style={{ color: 'var(--muted-foreground)' }}>
                No hay torneos activos en este momento
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
