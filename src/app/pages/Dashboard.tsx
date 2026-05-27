import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy, Users, Calendar, TrendingUp, ArrowRight, MapPin, Zap } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CommunityStats {
  municipalityName: string;
  torneos: number;
  equipos: number;
  jugadores: number;
}

export default function Dashboard() {
  const { tournaments, teams, matches, loading } = useData();
  const { user } = useAuth();
  const [community, setCommunity] = useState<CommunityStats | null>(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoadingCommunity(false); return; }

    const fetchCommunity = async () => {
      setLoadingCommunity(true);
      try {
        const { data: profile } = await supabase
          .from('PROFILE')
          .select('ubication_id')
          .eq('auth_id', user.id)
          .single();

        if (!profile?.ubication_id) return;

        const { data: ubication } = await supabase
          .from('UBICATION')
          .select('municipality_id')
          .eq('id', profile.ubication_id)
          .single();

        if (!ubication?.municipality_id) return;

        const { data: municipality } = await supabase
          .from('MUNICIPALITY')
          .select('name')
          .eq('id', ubication.municipality_id)
          .single();

        const { data: ubicaciones } = await supabase
          .from('UBICATION')
          .select('id')
          .eq('municipality_id', ubication.municipality_id);

        const ids = ubicaciones?.map(u => u.id) ?? [];

        const [torneosRes, equiposRes, jugadoresRes] = await Promise.all([
          supabase.from('TORNEO').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
          supabase.from('TEAM').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
          supabase.from('PROFILE').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
        ]);

        setCommunity({
          municipalityName: municipality?.name ?? 'tu municipio',
          torneos: torneosRes.count ?? 0,
          equipos: equiposRes.count ?? 0,
          jugadores: jugadoresRes.count ?? 0,
        });
      } catch {
        // silently ignore
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunity();
  }, [user?.id]);

  const stats = [
    {
      title: 'Torneos activos',
      value: tournaments.filter(t => t.status === 'ongoing').length,
      icon: Trophy,
      trend: '+12%',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.12)',
      iconGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    },
    {
      title: 'Equipos totales',
      value: teams.length,
      icon: Users,
      trend: '+8%',
      color: '#0891b2',
      bg: 'rgba(8,145,178,0.12)',
      iconGradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    },
    {
      title: 'Partidos jugados',
      value: matches.filter(m => m.status === 'finished').length,
      icon: Calendar,
      trend: '+25%',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.12)',
      iconGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    },
    {
      title: 'Próximos partidos',
      value: matches.filter(m => m.status === 'scheduled').length,
      icon: TrendingUp,
      trend: '+5%',
      color: '#d97706',
      bg: 'rgba(217,119,6,0.12)',
      iconGradient: 'linear-gradient(135deg, #d97706, #b45309)',
    },
  ];

  const recentActivity = [
    { type: 'match',      text: 'Partido finalizado: Deportivo Estrella 2 - 1 FC Águilas', time: '2 horas' },
    { type: 'team',       text: 'Nuevo equipo registrado: Tigres Unidos',                  time: '5 horas' },
    { type: 'tournament', text: 'Torneo creado: Copa de Verano',                           time: '1 día'   },
  ];

  const activityIcons: Record<string, typeof Calendar> = {
    match: Calendar,
    team: Users,
    tournament: Trophy,
  };

  const activityColors: Record<string, string> = {
    match:      '#8b5cf6',
    team:       '#0891b2',
    tournament: '#22c55e',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(34,197,94,0.2)', borderTopColor: '#22c55e', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>Cargando datos...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          .dash-card { transition: transform 0.2s ease; }
          .dash-card:hover { transform: translateY(-2px); }
          .tournament-link:hover { transform: translateY(-3px); }
          .tournament-link { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        `}</style>

        {/* ─── HERO ───────────────────────────────────────────── */}
        <div style={{ borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #052e16 0%, #14532d 45%, #166534 75%, #15803d 100%)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', transform: 'translate(30%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '30%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', transform: 'translateY(50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 900 200" preserveAspectRatio="xMidYMid slice">
              <circle cx="450" cy="100" r="70" fill="none" stroke="white" strokeWidth="2"/>
              <line x1="450" y1="0" x2="450" y2="200" stroke="white" strokeWidth="2"/>
              <rect x="10" y="10" width="880" height="180" rx="6" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Panel de control</div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1, marginBottom: 8 }}>
              BIENVENIDO DE<br/><span style={{ color: '#86efac' }}>VUELTA</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow', sans-serif", fontWeight: 400 }}>
              Aquí está el resumen de tu actividad
            </p>
          </div>
        </div>

        {/* ─── STAT CARDS ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="dash-card" style={{ padding: '22px', borderRadius: 18, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: stat.iconGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${stat.bg}` }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', color: '#22c55e', letterSpacing: 0.5 }}>
                    {stat.trend}
                  </span>
                </div>
                <p style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* ─── COMMUNITY + ACTIVITY ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

          {/* Tu Comunidad */}
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>Comunidad local</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.3 }}>
                  {loadingCommunity ? '—' : (community?.municipalityName ?? 'Tu municipio')}
                </div>
              </div>
            </div>

            {/* Stats municipio */}
            <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { icon: Trophy, label: 'Torneos',  value: community?.torneos,  color: '#2563eb', bg: 'rgba(37,99,235,0.1)'   },
                { icon: Users,  label: 'Equipos',  value: community?.equipos,  color: '#0891b2', bg: 'rgba(8,145,178,0.1)'   },
                { icon: Zap,    label: 'Jugadores', value: community?.jugadores, color: '#22c55e', bg: 'rgba(22,163,74,0.1)'  },
              ].map(s => {
                const SIcon = s.icon;
                return (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <SIcon size={14} color={s.color} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>
                      {loadingCommunity ? '·' : (s.value ?? 0)}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* CTA crear torneo */}
            <div style={{ margin: '0 22px 22px', padding: '18px', borderRadius: 14, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  ¿Listo para organizar?
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif" }}>
                  Crea un torneo para tu comunidad
                </div>
              </div>
              <Link
                to="/tournaments"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', flexShrink: 0 }}
              >
                Crear <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Actividad reciente */}
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Actividad</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5, marginBottom: 18 }}>Reciente</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentActivity.map((item, i) => {
                const Icon = activityIcons[item.type];
                const color = activityColors[item.type];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: i < recentActivity.length - 1 ? 14 : 0, marginBottom: i < recentActivity.length - 1 ? 14 : 0, borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${color === '#22c55e' ? '22,163,74' : color === '#8b5cf6' ? '139,92,246' : '8,145,178'},0.12)`, border: `1px solid rgba(${color === '#22c55e' ? '22,163,74' : color === '#8b5cf6' ? '139,92,246' : '8,145,178'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: "'Barlow', sans-serif", lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow', sans-serif", marginTop: 3 }}>Hace {item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── TORNEOS ACTIVOS — solo si hay alguno ───────────── */}
        {tournaments.filter(t => t.status === 'ongoing').length > 0 && (
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>En curso</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5 }}>Torneos activos</h2>
              </div>
              <Link
                to="/tournaments"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#22c55e', textDecoration: 'none', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {tournaments.filter(t => t.status === 'ongoing').map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="tournament-link"
                  style={{ borderRadius: 16, overflow: 'hidden', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)', background: '#13171f', display: 'block' }}
                >
                  <div style={{ padding: '20px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', transform: 'translate(30%,-30%)' }} />
                    <Trophy size={26} color="#fff" style={{ position: 'relative', zIndex: 1, marginBottom: 10 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: -0.3, position: 'relative', zIndex: 1 }}>{tournament.name}</h3>
                  </div>
                  <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif" }}>
                      <Calendar size={12} />
                      <span>{new Date(tournament.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — {new Date(tournament.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif" }}>
                      <Users size={12} /><span>{tournament.teams} equipos</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5 }}>En curso</span>
                      <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 800 }}>Ver →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
