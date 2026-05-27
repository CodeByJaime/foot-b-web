import { Link } from 'react-router-dom';
import { Trophy, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavbarProps {
  isDashboard?: boolean;
  onMenuClick?: () => void;
}

export default function Navbar({ isDashboard = false, onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 h-16"
      style={{
        background: 'rgba(var(--card), 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      {/* Left: logo */}
      <Link to="/" className="flex items-center gap-2.5 select-none">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', boxShadow: '0 2px 8px var(--primary-glow)' }}
        >
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
          Foot<span style={{ color: 'var(--primary)' }}>-B</span>
        </span>
      </Link>

      {/* Center links (landing only) */}
      {!isDashboard && (
        <div className="hidden md:flex items-center gap-6">
          {['Características', 'Cómo funciona', 'Planes', 'FAQ'].map((label, i) => {
            const hrefs = ['#features', '#how-it-works', '#pricing', '#faq'];
            return (
              <Link
                key={label}
                to={`/${hrefs[i]}`}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'var(--surface-high)', color: 'var(--muted-foreground)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {isDashboard ? (
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface-high)', color: 'var(--muted-foreground)' }}
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : (
          <>
            <Link
              to="/auth"
              className="hidden sm:block text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                boxShadow: '0 2px 10px var(--primary-glow)',
              }}
            >
              Crear torneo
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
