import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Trophy,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Shield,
  Check,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Múltiples formatos',
    description: 'Liga, Copa, Grupos + Eliminación, y formatos personalizados para cualquier competición.',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    glow: 'rgba(37,99,235,0.18)',
  },
  {
    icon: Calendar,
    title: 'Calendario automático',
    description: 'Genera fixture y llaves automáticamente sin esfuerzo, ajustado a tus fechas.',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    glow: 'rgba(8,145,178,0.15)',
  },
  {
    icon: Users,
    title: 'Gestión completa',
    description: 'Administra equipos, jugadores, estadísticas y resultados desde un solo lugar.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en vivo',
    description: 'Tablas, goleadores, tarjetas y gráficas actualizadas en tiempo real.',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    glow: 'rgba(217,119,6,0.15)',
  },
  {
    icon: Zap,
    title: 'Tiempo real',
    description: 'Marcadores y notificaciones instantáneas para todos los participantes.',
    gradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    glow: 'rgba(219,39,119,0.15)',
  },
  {
    icon: Shield,
    title: 'Roles y permisos',
    description: 'Organizadores, árbitros, jugadores y espectadores con accesos diferenciados.',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    glow: 'rgba(22,163,74,0.15)',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Background gradient blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(37,99,235,0.07)' }} />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.07)' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <Trophy className="h-4 w-4" />
              La plataforma #1 para torneos de fútbol
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold leading-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Organiza tus torneos{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                como un profesional
              </span>
            </h1>

            <p className="text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              La plataforma más moderna y completa para gestionar torneos de fútbol amateur y profesional.
              Rápida, intuitiva y totalmente automatizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  boxShadow: '0 4px 16px var(--primary-glow)',
                }}
              >
                Crear torneo gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm pt-2" style={{ color: 'var(--muted-foreground)' }}>
              {['Sin tarjeta de crédito', 'Setup en 2 minutos', 'Soporte 24/7'].map(label => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--success-light)' }}>
                    <Check className="h-3 w-3" style={{ color: 'var(--success)' }} />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ background: 'var(--card)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Características principales
            </h2>
            <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Todo lo que necesitas para organizar torneos profesionales en una sola plataforma
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 space-y-4 transition-all group"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: feature.gradient, boxShadow: `0 4px 12px ${feature.glow}` }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--foreground)' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Cómo funciona</h2>
            <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Organiza tu torneo en minutos con nuestro flujo simple y guiado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Crea tu torneo', description: 'Elige el formato, configura reglas y fechas en segundos.' },
              { step: '02', title: 'Agrega equipos', description: 'Invita equipos o créalos tú mismo con todos sus jugadores.' },
              { step: '03', title: 'Comienza a jugar', description: 'El sistema genera el calendario automáticamente y gestiona todo.' },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div
                  className="rounded-2xl p-6 space-y-4 h-full"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="text-4xl font-black"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full items-center justify-center"
                    style={{ background: 'var(--primary-light)' }}>
                    <ArrowRight className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full -translate-y-1/2 translate-x-1/4" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full translate-y-1/2 -translate-x-1/4" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para organizar tu próximo torneo?
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Únete a miles de organizadores que ya confían en Foot-B
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            Comenzar ahora gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }} className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
                >
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>Foot-B</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                La plataforma líder para gestión de torneos de fútbol
              </p>
            </div>

            {[
              { title: 'Producto', links: [{ label: 'Características', to: '/features' }, { label: 'Precios', to: '/pricing' }, { label: 'Demo', to: '/demo' }] },
              { title: 'Soporte', links: [{ label: 'Centro de ayuda', to: '/help' }, { label: 'Contacto', to: '/contact' }, { label: 'Estado del servicio', to: '/status' }] },
              { title: 'Legal', links: [{ label: 'Privacidad', to: '/privacy' }, { label: 'Términos', to: '/terms' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--foreground)' }}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-xs transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            © 2026 Foot-B. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
