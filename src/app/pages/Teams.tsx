import { Link } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import CreateTeamModal from '../components/ui/CreateTeamModal';

export default function Teams() {
  const { teams, loading } = useData();
  const [search, setSearch] = useState('');

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.coach.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Equipos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Gestiona todos los equipos de tus torneos
            </p>
          </div>
          <CreateTeamModal />
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-md"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--primary-light)' }}
          >
            <Search className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar equipos..."
            className="flex-1 outline-none bg-transparent text-sm"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="rounded-2xl p-5 animate-pulse"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'var(--surface-high)' }} />
                  <div className="space-y-2">
                    <div className="h-3 rounded-full w-28" style={{ background: 'var(--surface-high)' }} />
                    <div className="h-3 rounded-full w-16" style={{ background: 'var(--surface-high)' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded-full" style={{ background: 'var(--surface-high)' }} />
                  <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--surface-high)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(team => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="rounded-2xl p-5 block group transition-all"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
              >
                {/* Team header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{ background: 'var(--surface-high)', border: '1px solid var(--border)' }}
                  >
                    {team.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--foreground)' }}>
                      {team.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      Fundado: {team.foundedYear}
                    </p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>Entrenador</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{team.coach}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>Jugadores</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      <Users className="h-3 w-3 inline mr-1" />{team.players}
                    </span>
                  </div>
                </div>

                {/* Stats bar */}
                <div
                  className="pt-4 grid grid-cols-3 gap-2"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: 'var(--primary-light)' }}
                  >
                    <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{team.wins}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>V</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: 'var(--warning-light)' }}
                  >
                    <p className="text-xl font-bold" style={{ color: 'var(--warning)' }}>{team.draws}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>E</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: 'var(--destructive-light)' }}
                  >
                    <p className="text-xl font-bold" style={{ color: 'var(--destructive)' }}>{team.losses}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>D</p>
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div
                className="col-span-3 rounded-2xl p-12 flex flex-col items-center justify-center gap-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-high)' }}>
                  <Users className="h-7 w-7" style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>No se encontraron equipos</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Prueba con otro término de búsqueda</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
