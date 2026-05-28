import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy, Users, Calendar, TrendingUp, ArrowRight, MapPin, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Torneo {
  id: string;
  name: string;
  type: 'cup' | 'league';
  start_date: string;
  status: 'upcoming' | 'active' | 'finished';
  season: string;
  period: string;
  level: string;
  gender: string;
  ubication_id: string;
}

interface CommunityStats {
  municipalityName: string;
  torneos: number;
  equipos: number;
  jugadores: number;
}

interface DashStats {
  torneos_activos: number;
  torneos_proximos: number;
  equipos_totales: number;
  partidos_jugados: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  upcoming: { label: 'Inscripciones',  color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  dot: '#3b82f6' },
  active:   { label: 'En curso',       color: '#22c55e', bg: 'rgba(22,163,74,0.12)',  dot: '#22c55e' },
  finished: { label: 'Finalizado',     color: '#64748b', bg: 'rgba(100,116,139,0.1)', dot: '#94a3b8' },
};

const CARD_GRADIENTS = [
  ['#1e1b4b', '#4338ca'],
  ['#164e63', '#0e7490'],
  ['#14532d', '#15803d'],
  ['#7c2d12', '#c2410c'],
  ['#4a044e', '#a21caf'],
  ['#1e3a5f', '#2563eb'],
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  const [profileId, setProfileId]     = useState<string | null>(null);
  const [ubicationId, setUbicationId] = useState<string | null>(null);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [community, setCommunity] = useState<CommunityStats | null>(null);
  const [dashStats, setDashStats] = useState<DashStats>({ torneos_activos: 0, torneos_proximos: 0, equipos_totales: 0, partidos_jugados: 0 });
  const [loading, setLoading] = useState(true);

  // 1. Fetch user profile → ubication_id
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('PROFILE')
      .select('id, ubication_id')
      .eq('auth_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.id)            setProfileId(data.id);
        if (data?.ubication_id)  setUbicationId(data.ubication_id);
      });
  }, [user?.id]);

  // 2. Fetch everything once we have ubication_id + profileId
  useEffect(() => {
    if (!ubicationId || !profileId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Own tournaments via TORNEO_ADMINS
        const { data: adminData } = await supabase
          .from('TORNEO_ADMINS')
          .select('torneo_id')
          .eq('profile_id', profileId);

        const torneoIds = (adminData ?? []).map((a: any) => a.torneo_id);
        let torneosList: Torneo[] = [];
        if (torneoIds.length > 0) {
          const { data: tData } = await supabase
            .from('TORNEO')
            .select('*')
            .in('id', torneoIds)
            .neq('status', 'finished');
          torneosList = (tData ?? []) as Torneo[];
        }
        setTorneos(torneosList);

        // Municipality data for community stats
        const { data: ub } = await supabase
          .from('UBICATION')
          .select('municipality_id')
          .eq('id', ubicationId)
          .single();

        if (ub?.municipality_id) {
          const { data: muni } = await supabase
            .from('MUNICIPALITY')
            .select('name')
            .eq('id', ub.municipality_id)
            .single();

          const { data: allUbs } = await supabase
            .from('UBICATION')
            .select('id')
            .eq('municipality_id', ub.municipality_id);

          const ids = (allUbs ?? []).map(u => u.id);

          const [torneosRes, equiposRes, jugadoresRes] = await Promise.all([
            supabase.from('TORNEO').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
            supabase.from('TEAM').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
            supabase.from('PROFILE').select('id', { count: 'exact', head: true }).in('ubication_id', ids),
          ]);

          setCommunity({
            municipalityName: muni?.name ?? 'tu municipio',
            torneos: torneosRes.count ?? 0,
            equipos: equiposRes.count ?? 0,
            jugadores: jugadoresRes.count ?? 0,
          });
        }

        // Dash summary stats
        const [equiposRes, partidosRes] = await Promise.all([
          supabase.from('TEAM').select('id', { count: 'exact', head: true }).eq('ubication_id', ubicationId),
          supabase.from('MATCH').select('id', { count: 'exact', head: true }).eq('status', 'finished'),
        ]);

        setDashStats({
          torneos_activos:  torneosList.length,                                        // active + upcoming (ya excluye finished)
          torneos_proximos: torneosList.filter(t => t.status === 'upcoming').length,
          equipos_totales:  equiposRes.count ?? 0,
          partidos_jugados: partidosRes.count ?? 0,
        });

      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [ubicationId, profileId]);

  const stats = [
    { title: 'Torneos activos',  value: dashStats.torneos_activos,  icon: Trophy,     color: '#22c55e', bg: 'rgba(22,163,74,0.12)',    grad: 'linear-gradient(135deg, #16a34a, #22c55e)', trend: null },
    { title: 'Equipos totales',  value: dashStats.equipos_totales,  icon: Users,      color: '#0891b2', bg: 'rgba(8,145,178,0.12)',    grad: 'linear-gradient(135deg, #0891b2, #0e7490)', trend: null },
    { title: 'Partidos jugados', value: dashStats.partidos_jugados, icon: Calendar,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   grad: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', trend: null },
    { title: 'Próximos torneos', value: dashStats.torneos_proximos, icon: TrendingUp, color: '#d97706', bg: 'rgba(217,119,6,0.12)',    grad: 'linear-gradient(135deg, #d97706, #b45309)', trend: null },
  ];

  const recentActivity = [
    { type: 'match',      text: 'Partido finalizado: Deportivo Estrella 2 - 1 FC Águilas', time: '2 horas' },
    { type: 'team',       text: 'Nuevo equipo registrado: Tigres Unidos',                  time: '5 horas' },
    { type: 'tournament', text: 'Torneo creado: Copa de Verano',                           time: '1 día'   },
  ];

  const activityIcon: Record<string, typeof Calendar> = { match: Calendar, team: Users, tournament: Trophy };
  const activityColor: Record<string, string> = { match: '#8b5cf6', team: '#0891b2', tournament: '#22c55e' };

  const activeTorneos  = torneos.filter(t => t.status === 'active');
  const upcomingTorneos = torneos.filter(t => t.status === 'upcoming');
  const visibleTorneos = [...activeTorneos, ...upcomingTorneos];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5" style={{ fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          .dash-stat:hover { transform: translateY(-2px); }
          .dash-stat { transition: transform 0.2s ease; }
          .torneo-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
          .torneo-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        `}</style>

        {/* ─── HERO ───────────────────────────────────────────── */}
        <div className="p-5 sm:p-8" style={{ borderRadius: 20, position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #052e16 0%, #14532d 45%, #166534 75%, #15803d 100%)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', transform: 'translate(30%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '30%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', transform: 'translateY(50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 900 180" preserveAspectRatio="xMidYMid slice">
              <circle cx="450" cy="90" r="60" fill="none" stroke="white" strokeWidth="2"/>
              <line x1="450" y1="0" x2="450" y2="180" stroke="white" strokeWidth="2"/>
              <rect x="10" y="10" width="880" height="160" rx="6" fill="none" stroke="white" strokeWidth="2"/>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="dash-stat" style={{ padding: '22px', borderRadius: 18, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 4px 14px ${s.bg}` }}>
                  <Icon size={18} color="#fff" />
                </div>
                {loading
                  ? <div style={{ width: 48, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
                  : <p style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>{s.value}</p>
                }
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.title}</p>
              </div>
            );
          })}
        </div>

        {/* ─── COMMUNITY + ACTIVITY ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">

          {/* Tu Comunidad */}
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>Comunidad local</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.3 }}>
                  {loading ? '—' : (community?.municipalityName ?? 'Tu municipio')}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { icon: Trophy,    label: 'Torneos',   value: community?.torneos,   color: '#2563eb', bg: 'rgba(37,99,235,0.1)'  },
                { icon: Users,     label: 'Equipos',   value: community?.equipos,   color: '#0891b2', bg: 'rgba(8,145,178,0.1)'  },
                { icon: Zap,       label: 'Jugadores', value: community?.jugadores, color: '#22c55e', bg: 'rgba(22,163,74,0.1)'  },
              ].map(s => {
                const SIcon = s.icon;
                return (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <SIcon size={14} color={s.color} />
                    </div>
                    {loading
                      ? <div style={{ width: 32, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', margin: '0 auto 4px', animation: 'pulse 1.5s ease infinite' }} />
                      : <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>{s.value ?? 0}</div>
                    }
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ margin: '0 22px 22px', padding: '18px', borderRadius: 14, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>¿Listo para organizar?</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif" }}>Crea un torneo para tu comunidad</div>
              </div>
              <Link to="/tournaments" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', flexShrink: 0 }}>
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
                const Icon = activityIcon[item.type];
                const color = activityColor[item.type];
                const rgb = color === '#22c55e' ? '22,163,74' : color === '#8b5cf6' ? '139,92,246' : '8,145,178';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: i < recentActivity.length - 1 ? 14 : 0, marginBottom: i < recentActivity.length - 1 ? 14 : 0, borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

        {/* ─── TORNEOS (reales desde Supabase) ────────────────── */}
        {!loading && visibleTorneos.length > 0 && (
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Gestión</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5 }}>
                  Mis torneos
                  <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', color: '#22c55e', verticalAlign: 'middle' }}>{visibleTorneos.length}</span>
                </h2>
              </div>
              <Link to="/tournaments" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#22c55e', textDecoration: 'none', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {visibleTorneos.map((torneo, i) => {
                const cfg = STATUS_CONFIG[torneo.status] ?? STATUS_CONFIG.upcoming;
                const [fromColor, toColor] = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                return (
                  <Link
                    key={torneo.id}
                    to={`/tournaments/${torneo.id}`}
                    className="torneo-card"
                    style={{ borderRadius: 18, overflow: 'hidden', textDecoration: 'none', display: 'block', background: `linear-gradient(135deg, ${fromColor}, ${toColor})`, position: 'relative' }}
                  >
                    {/* Deco circles */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: 10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <div style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: cfg.bg, border: `1px solid rgba(255,255,255,0.1)` }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, animation: torneo.status === 'active' ? 'pulse 2s ease infinite' : 'none' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: torneo.status === 'active' ? '#fff' : cfg.color, letterSpacing: 0.5 }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)' }}>
                          <Trophy size={10} color="rgba(255,255,255,0.9)" />
                          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{torneo.type === 'cup' ? 'Copa' : 'Liga'}</span>
                        </div>
                      </div>

                      {/* Nombre */}
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 12 }}>{torneo.name}</h3>

                      {/* Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {[
                          formatDate(torneo.start_date),
                          torneo.level,
                          torneo.gender === 'male' ? 'Masculino' : 'Femenino',
                        ].map(pill => (
                          <span key={pill} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', fontFamily: "'Barlow', sans-serif" }}>{pill}</span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{torneo.season} · {torneo.period}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.15)' }}>
                          <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>Ver torneo</span>
                          <ArrowRight size={11} color="#fff" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
