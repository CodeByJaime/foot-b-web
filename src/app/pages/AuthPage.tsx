import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('¡Bienvenido a Foot-B!');
      } else {
        await signUp(email, password);
        toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error de autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl" style={{ background: 'rgba(37,99,235,0.08)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.06)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}
          >
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Foot<span style={{ color: 'var(--primary)' }}>-B</span>
          </span>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-7 space-y-6"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {isLogin ? 'Accede a tus torneos' : 'Empieza a organizar hoy'}
            </p>
          </div>

          {/* Tab switcher — matches mobile style */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: 'var(--surface-high)' }}
          >
            {['Iniciar sesión', 'Registrarse'].map((label, i) => {
              const active = i === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(i === 0)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                          color: '#fff',
                          boxShadow: '0 2px 8px var(--primary-glow)',
                        }
                      : { color: 'var(--muted-foreground)' }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Nombre completo</label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--primary-light)' }}
                  >
                    <User className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--input-background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Email</label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--primary-light)' }}
                >
                  <Mail className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Contraseña</label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--primary-light)' }}
                >
                  <Lock className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mt-2"
              style={{
                background: submitting
                  ? 'var(--muted-foreground)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                boxShadow: submitting ? 'none' : '0 4px 14px var(--primary-glow)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" className="font-semibold" style={{ color: 'var(--primary)' }}>Términos</Link>
            {' '}y{' '}
            <Link to="/privacy" className="font-semibold" style={{ color: 'var(--primary)' }}>Privacidad</Link>
          </p>
        </div>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
