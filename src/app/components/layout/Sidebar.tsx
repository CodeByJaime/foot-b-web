import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCircle,
  Calendar,
  BarChart3,
  GitBranch,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Trophy, label: 'Torneos', path: '/tournaments' },
  { icon: Users, label: 'Equipos', path: '/teams' },
  { icon: UserCircle, label: 'Jugadores', path: '/players' },
  { icon: Calendar, label: 'Partidos', path: '/matches' },
  { icon: BarChart3, label: 'Estadísticas', path: '/standings/1' },
  { icon: GitBranch, label: 'Brackets', path: '/brackets/1' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 h-screen sticky top-0 hidden md:flex flex-col overflow-hidden" style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}>

      {/* Gradient header — mirrors the mobile drawer header */}
      <div
        className="px-5 py-6 flex flex-col gap-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--sidebar-header-from) 0%, var(--sidebar-header-via) 50%, var(--sidebar-header-to) 100%)' }}
      >
        {/* Decorative circles (same as mobile) */}
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
            
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Foot-B</span>
        </div>

        {/* User avatar & info */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.3)' }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {user?.email?.split('@')[0] ?? 'Usuario'}
            </p>
            <p className="text-xs truncate leading-tight" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {user?.email ?? 'Organizador'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith('/' + item.path.split('/')[1]));

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group"
              style={
                isActive
                  ? {
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                    }
                  : {
                      color: 'var(--muted-foreground)',
                    }
              }
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{ height: '60%', background: 'var(--primary)' }}
                />
              )}

              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={
                  isActive
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { background: 'var(--surface-high)', color: 'var(--muted-foreground)' }
                }
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pt-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface-high)' }}>
              <Settings className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Configuración</span>
          </Link>

          <button
            onClick={() => signOut?.()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: 'var(--destructive)' }}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--destructive-light)' }}>
              <LogOut className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
