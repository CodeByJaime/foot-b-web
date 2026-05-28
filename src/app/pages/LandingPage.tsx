import { Link } from 'react-router-dom';
import {
  Trophy, Calendar, Users, BarChart3, Zap, Shield, Check, ArrowRight, Play,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const features = [
  { icon: Trophy, title: 'Múltiples formatos', description: 'Liga, Copa, Grupos + Eliminación y formatos personalizados para cualquier competición.', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  { icon: Calendar, title: 'Fixture automático', description: 'Genera calendario y llaves en un clic, ajustado a tus fechas y equipos.', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  { icon: Users, title: 'Gestión completa', description: 'Equipos, jugadores, estadísticas y resultados administrados desde un solo lugar.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { icon: BarChart3, title: 'Estadísticas en vivo', description: 'Tablas, goleadores, tarjetas y gráficas actualizadas al instante.', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  { icon: Zap, title: 'Notificaciones al instante', description: 'Marcadores y alertas en tiempo real para todos los participantes.', color: '#db2777', bg: 'rgba(219,39,119,0.12)' },
  { icon: Shield, title: 'Roles y permisos', description: 'Organizadores, árbitros, jugadores y espectadores con accesos diferenciados.', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
];

const steps = [
  { n: '01', title: 'Crea tu torneo', sub: 'Elige formato, configura reglas y fechas en segundos.' },
  { n: '02', title: 'Agrega equipos', sub: 'Invita equipos o créalos tú mismo con todos sus jugadores.' },
  { n: '03', title: 'Comienza a jugar', sub: 'El sistema genera el calendario y gestiona todo automáticamente.' },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  /* parallax suave en el hero */
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#080c14', minHeight: '100vh', fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif", color: '#f1f5f9', overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Barlow Condensed', system-ui, sans-serif; }

        .hero-word { display: inline-block; opacity: 0; transform: translateY(40px); animation: wordIn 0.7s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes wordIn { to { opacity: 1; transform: translateY(0); } }

        .fade-up { opacity: 0; transform: translateY(24px); animation: fadeUp 0.6s ease forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        .feature-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .feature-card:hover { transform: translateY(-6px); }

        .btn-primary { position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.08); opacity: 0; transition: opacity 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(22,163,74,0.4); }
        .btn-primary:hover::after { opacity: 1; }

        .step-card { position: relative; overflow: hidden; }
        .step-card::before { content: attr(data-n); position: absolute; right: -10px; bottom: -20px; font-size: 120px; font-weight: 900; color: rgba(255,255,255,0.03); line-height: 1; pointer-events: none; font-family: 'Barlow Condensed', sans-serif; }

        .ticker { display: flex; gap: 3rem; white-space: nowrap; animation: ticker 18s linear infinite; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .nav-link { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(255,255,255,0.55); transition: color 0.2s; text-decoration: none; }
        .nav-link:hover { color: #fff; }

        .grass-line { background: linear-gradient(90deg, transparent, #16a34a 30%, #22c55e 50%, #16a34a 70%, transparent); }
      `}</style>

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="px-4! md:px-8" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <img
              src="/icon-foot-b.svg"
              alt="Foot-B"
              width={26}
              height={26}
              style={{ filter: 'brightness(0) invert(1)', display: 'block' }}
            />
          </div>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', color: '#fff' }}>FOOT-<span style={{ color: '#22c55e' }}>B</span></span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" className="nav-link hidden md:inline">Características</a>
          <a href="#how-it-works" className="nav-link hidden md:inline">Cómo funciona</a>
          <Link to="/auth"
            style={{ padding: '8px 16px', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ─── TICKER TAPE ─────────────────────────────────────── */}
      <div style={{ marginTop: 64, background: '#16a34a', overflow: 'hidden', padding: '10px 0' }}>
        <div className="ticker">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
              {['FÚTBOL AMATEUR', 'ORGANIZA TORNEOS', 'GENERA FIXTURE', 'CREA LIGAS', 'ESTADÍSTICAS EN VIVO', 'FIXTURE AUTOMÁTICO', '100% GRATIS'].map(t => (
                <span key={t} style={{ fontWeight: 800, fontSize: 13, letterSpacing: 2, color: '#fff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {t} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '80px 0' }}>

        {/* Cancha de fondo */}
        <div ref={heroRef} style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            <rect x="60" y="40" width="1080" height="620" rx="8" fill="none" stroke="white" strokeWidth="3" />
            <line x1="600" y1="40" x2="600" y2="660" stroke="white" strokeWidth="3" />
            <circle cx="600" cy="350" r="120" fill="none" stroke="white" strokeWidth="3" />
            <circle cx="600" cy="350" r="5" fill="white" />
            <rect x="60" y="230" width="140" height="240" fill="none" stroke="white" strokeWidth="3" />
            <rect x="1000" y="230" width="140" height="240" fill="none" stroke="white" strokeWidth="3" />
            <path d="M200 280 Q260 350 200 420" fill="none" stroke="white" strokeWidth="3" />
            <path d="M1000 280 Q940 350 1000 420" fill="none" stroke="white" strokeWidth="3" />
          </svg>
        </div>

        {/* Glow verde */}
        <div style={{ position: 'absolute', top: '30%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Texto */}
            <div>
              <div className="fade-up" style={{ animationDelay: '0.1s', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', marginBottom: '1.5rem' }}>
                <Trophy size={13} color="#22c55e" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: 1.5, textTransform: 'uppercase' }}>Plataforma #1 para torneos</span>
              </div>

              <div style={{ lineHeight: 0.92, marginBottom: '1.5rem' }}>
                {[
                  { text: 'ORGANIZA', delay: '0.2s', color: '#f1f5f9' },
                  { text: 'TORNEOS', delay: '0.35s', color: '#f1f5f9' },
                  { text: 'COMO UN', delay: '0.5s', color: 'rgba(241,245,249,0.5)' },
                  { text: 'PRO.', delay: '0.65s', color: '#22c55e' },
                ].map(({ text, delay, color }) => (
                  <div key={text} className="hero-word" style={{ animationDelay: delay, display: 'block', fontSize: 'clamp(64px, 8vw, 96px)', fontWeight: 900, color, letterSpacing: '-2px', fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {text}
                  </div>
                ))}
              </div>

              <p className="fade-up" style={{ animationDelay: '0.8s', fontSize: 18, lineHeight: 1.6, color: 'rgba(241,245,249,0.55)', fontFamily: "'Barlow', sans-serif", fontWeight: 400, maxWidth: 480, marginBottom: '2rem' }}>
                La plataforma más moderna y completa para gestionar torneos de fútbol amateur y profesional. Rápida, intuitiva y totalmente automatizada.
              </p>

              <div className="fade-up" style={{ animationDelay: '0.95s', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <Link to="/dashboard" className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 1, textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', boxShadow: '0 4px 24px rgba(22,163,74,0.3)' }}>
                  Crear torneo gratis <ArrowRight size={16} />
                </Link>
                <button
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontWeight: 700, fontSize: 15, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                  <Play size={14} fill="currentColor" /> Ver demo
                </button>
              </div>

              <div className="fade-up" style={{ animationDelay: '1.1s', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['Sin tarjeta de crédito', 'Setup en 2 min', 'Soporte 24/7'].map(label => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#22c55e" />
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow', sans-serif", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup visual */}
            <div style={{ position: 'relative' }}>
              {/* Card principal — simulando la app */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '28px', backdropFilter: 'blur(12px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

                {/* Header simulado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>TORNEO ACTIVO</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>Copa Municipal 2026</div>
                  </div>
                  <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1 }}>⚽ En curso</span>
                  </div>
                </div>

                {/* Partido destacado */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Semifinal · Hoy 18:00</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 16, fontWeight: 900, color: '#fff' }}>TI</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Tigres FC</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0 16px' }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>2 — 1</div>
                      <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: 1 }}>EN VIVO</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #db2777, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 16, fontWeight: 900, color: '#fff' }}>LE</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Leones SC</div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[{ v: '8', l: 'Equipos' }, { v: '24', l: 'Partidos' }, { v: '67', l: 'Goles' }].map(s => (
                    <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', letterSpacing: -1 }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif", textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card flotante goleador */}
              <div className="hidden lg:flex" style={{ position: 'absolute', right: -32, bottom: -24, background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px', alignItems: 'center', gap: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #d97706, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚽</div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Goleador</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Carlos M. · 12 goles</div>
                </div>
              </div>

              {/* Card flotante tabla */}
              <div className="hidden lg:block" style={{ position: 'absolute', left: -28, top: -20, background: '#0d1520', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 14, padding: '14px 18px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: 10, color: '#22c55e', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Tabla</div>
                {[['1', 'Tigres FC', '15'], ['2', 'Rayos SC', '12'], ['3', 'Leones SC', '10']].map(([pos, name, pts]) => (
                  <div key={name} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', width: 12 }}>{pos}</span>
                    <span style={{ color: '#fff', fontWeight: 700, flex: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>{name}</span>
                    <span style={{ color: '#22c55e', fontWeight: 800 }}>{pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 0', background: '#0d1117', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-12 lg:mb-16">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Características</div>
              <h2 style={{ fontSize: 'clamp(40px,5vw,60px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: -1.5, lineHeight: 0.95 }}>
                TODO LO QUE<br /><span style={{ color: 'rgba(241,245,249,0.3)' }}>NECESITAS</span>
              </h2>
            </div>
            <p style={{ maxWidth: 320, fontSize: 15, lineHeight: 1.7, color: 'rgba(241,245,249,0.4)', fontFamily: "'Barlow', sans-serif", fontWeight: 400 }}>
              Una plataforma completa para organizar torneos de fútbol sin complicaciones
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="feature-card"
                style={{ padding: '28px', borderRadius: 20, background: '#13171f', border: '1px solid rgba(255,255,255,0.06)', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                {/* Glow de color */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, border: `1px solid ${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 10, letterSpacing: -0.3 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(241,245,249,0.4)', fontFamily: "'Barlow', sans-serif", fontWeight: 400 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 0', background: '#080c14', position: 'relative', overflow: 'hidden' }}>
        {/* Línea diagonal decorativa */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 40px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Proceso</div>
            <h2 style={{ fontSize: 'clamp(40px,5vw,60px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: -1.5 }}>CÓMO FUNCIONA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="step-card" data-n={step.n}
                style={{ padding: '36px 28px', borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 72, fontWeight: 900, color: '#22c55e', lineHeight: 1, marginBottom: 20, letterSpacing: -3, fontFamily: "'Barlow Condensed', sans-serif" }}>{step.n}</div>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 12, letterSpacing: -0.5 }}>{step.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(241,245,249,0.45)', fontFamily: "'Barlow', sans-serif", fontWeight: 400 }}>{step.sub}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex" style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#16a34a', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <ArrowRight size={12} color="#fff" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo dinámico */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)' }} />
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }} />

        {/* Cancha tenue */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
            <rect x="40" y="30" width="1120" height="440" rx="8" fill="none" stroke="white" strokeWidth="2.5" />
            <line x1="600" y1="30" x2="600" y2="470" stroke="white" strokeWidth="2.5" />
            <circle cx="600" cy="250" r="100" fill="none" stroke="white" strokeWidth="2.5" />
          </svg>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>¿Listo?</div>
          <h2 style={{ fontSize: 'clamp(48px,6vw,80px)', fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 0.95, marginBottom: 24 }}>
            ORGANIZA TU<br />PRÓXIMO TORNEO
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', fontFamily: "'Barlow', sans-serif", fontWeight: 400, marginBottom: 40, lineHeight: 1.6 }}>
            Únete a miles de organizadores que ya confían en Foot-B para gestionar sus competiciones.
          </p>
          <Link to="/dashboard" className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 40px', borderRadius: 14, background: '#fff', color: '#15803d', fontWeight: 900, fontSize: 18, letterSpacing: 0.5, textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
            Comenzar ahora — gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10 lg:mb-12">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/icon-foot-b.svg"
                    alt="Foot-B"
                    width={26}
                    height={26}
                    style={{ filter: 'brightness(0) invert(1)', display: 'block' }}
                  />
                </div>
                <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#fff' }}>FOOT<span style={{ color: '#22c55e' }}>B</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", maxWidth: 240 }}>
                La plataforma líder para gestión de torneos de fútbol amateur y profesional.
              </p>
            </div>

            {[
              { title: 'Producto', links: ['Características', 'Precios', 'Demo'] },
              { title: 'Soporte', links: ['Centro de ayuda', 'Contacto', 'Estado'] },
              { title: 'Legal', links: ['Privacidad', 'Términos'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontFamily: "'Barlow', sans-serif", transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif" }}>© 2026 Foot-B. Todos los derechos reservados.</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif" }}>El fútbol de barrio también merece su liga.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}