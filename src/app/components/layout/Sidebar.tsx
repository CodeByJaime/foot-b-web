import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCircle,
  Calendar,
  BarChart3,
  GitBranch,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Panel',    path: '/dashboard'    },
  { icon: Trophy,          label: 'Torneos',      path: '/tournaments'  },
  { icon: Users,           label: 'Equipos',      path: '/teams'        },
  { icon: UserCircle,      label: 'Jugadores',    path: '/players'      },
  { icon: Calendar,        label: 'Partidos',     path: '/matches'      },
  { icon: BarChart3,       label: 'Estadísticas', path: '/standings/1'  },
  { icon: GitBranch,       label: 'Brackets',     path: '/brackets/1'   },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside
      className="w-64 h-screen sticky top-0 hidden md:flex flex-col overflow-hidden"
      style={{
        background: '#080c14',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif",
      }}
    >

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '24px 20px',
        background: 'linear-gradient(160deg, #052e16 0%, #14532d 45%, #166534 75%, #15803d 100%)',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', transform: 'translate(40%,-40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', transform: 'translate(-40%,40%)', pointerEvents: 'none' }} />

        {/* Cancha decorativa */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 256 130" preserveAspectRatio="xMidYMid slice">
            <line x1="128" y1="0" x2="128" y2="130" stroke="white" strokeWidth="1.5"/>
            <circle cx="128" cy="65" r="38" fill="none" stroke="white" strokeWidth="1.5"/>
            <circle cx="128" cy="65" r="3" fill="white"/>
          </svg>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative', zIndex: 2 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)', flexShrink: 0 }}>
            <img
              src="/icon-foot-b.svg"
              alt="Foot-B"
              width={26}
              height={26}
              style={{ filter: 'brightness(0) invert(1)', display: 'block' }}
            />
          </div>
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>
            FOOT-<span style={{ color: '#86efac' }}>B</span>
          </span>
        </div>

        {/* User card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2, background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email?.split('@')[0] ?? 'Usuario'}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Barlow', sans-serif", letterSpacing: 0.3 }}>
              {user?.email ?? 'Organizador'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── SECTION LABEL ──────────────────────────────────── */}
      <div style={{ padding: '18px 20px 8px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, textTransform: 'uppercase' }}>
        Navegación
      </div>

      {/* ─── NAV ────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith('/' + item.path.split('/')[1]));

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 12,
                textDecoration: 'none',
                position: 'relative',
                transition: 'transform 0.2s ease, background 0.2s ease',
                background: isActive ? 'rgba(22,163,74,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(22,163,74,0.25)' : 'transparent'}`,
                color: isActive ? '#22c55e' : 'rgba(255,255,255,0.45)',
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', borderRadius: '0 4px 4px 0', background: '#22c55e' }} />
              )}

              {/* Icon */}
              <span style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isActive ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.05)',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.06)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s ease',
              }}>
                <Icon size={15} />
              </span>

              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          to="/"
          onClick={() => signOut?.()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', transition: 'all 0.2s ease' }}
        >
          <span style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', flexShrink: 0 }}>
            <LogOut size={15} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Cerrar sesión</span>
        </Link>
      </div>
    </aside>
  );
}
