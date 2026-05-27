import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif", color: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; }
        .auth-input:focus { border-color: #22c55e !important; outline: none; }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { opacity: 0.85; }
        .auth-field-icon { transition: background 0.2s ease; }
      `}</style>

      {/* ─── FONDOS DECORATIVOS ──────────────────────────────── */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 320, height: 320, borderRadius: '50%', background: 'rgba(37,99,235,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Cancha SVG tenue */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
          <rect x="60" y="40" width="1080" height="620" rx="8" fill="none" stroke="white" strokeWidth="3"/>
          <line x1="600" y1="40" x2="600" y2="660" stroke="white" strokeWidth="3"/>
          <circle cx="600" cy="350" r="120" fill="none" stroke="white" strokeWidth="3"/>
          <circle cx="600" cy="350" r="5" fill="white"/>
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>

        {/* ─── LOGO ────────────────────────────────────────────── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
            <img src="/assets/icon-foot-b.png" alt="Foot-B" width={30} height={30} style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.5px', color: '#fff', textTransform: 'uppercase' }}>
            FOOT<span style={{ color: '#22c55e' }}>B</span>
          </span>
        </Link>

        {/* ─── CARD ────────────────────────────────────────────── */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #16a34a, #22c55e, transparent)', borderRadius: '24px 24px 0 0', marginTop: -1 }} />

          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5, marginBottom: 6, textTransform: 'uppercase' }}>
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)', fontFamily: "'Barlow', sans-serif", fontWeight: 400 }}>
              {isLogin ? 'Accede a tus torneos' : 'Empieza a organizar hoy'}
            </p>
          </div>

          {/* ─── TABS ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
            {[{ label: 'Iniciar sesión', value: true }, { label: 'Registrarse', value: false }].map(tab => {
              const active = isLogin === tab.value;
              return (
                <button
                  key={tab.label}
                  className="tab-btn"
                  onClick={() => setIsLogin(tab.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    background: active ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                    boxShadow: active ? '0 2px 12px rgba(22,163,74,0.3)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ─── FORM ────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Nombre completo</label>
                <div style={{ position: 'relative' }}>
                  <div className="auth-field-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 8, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="#22c55e" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="auth-input"
                    style={{ width: '100%', paddingLeft: 52, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif", transition: 'border-color 0.2s ease' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <div className="auth-field-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 8, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={14} color="#22c55e" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="auth-input"
                  style={{ width: '100%', paddingLeft: 52, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif", transition: 'border-color 0.2s ease' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <div className="auth-field-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 8, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={14} color="#22c55e" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="auth-input"
                  style={{ width: '100%', paddingLeft: 52, paddingRight: 48, paddingTop: 12, paddingBottom: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif", transition: 'border-color 0.2s ease' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 12,
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #15803d)',
                color: submitting ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontFamily: "'Barlow Condensed', sans-serif",
                boxShadow: submitting ? 'none' : '0 4px 24px rgba(22,163,74,0.35)',
                transition: 'all 0.2s ease',
                marginTop: 4,
              }}
            >
              {submitting ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Legal */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif", marginTop: 20 }}>
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" style={{ color: 'rgba(34,197,94,0.7)', textDecoration: 'none', fontWeight: 600 }}>Términos</Link>
            {' '}y{' '}
            <Link to="/privacy" style={{ color: 'rgba(34,197,94,0.7)', textDecoration: 'none', fontWeight: 600 }}>Privacidad</Link>
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontFamily: "'Barlow', sans-serif", fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
