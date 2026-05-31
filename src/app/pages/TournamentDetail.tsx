import { useParams, useNavigate } from 'react-router-dom';
import LlavesTab from '../components/LlavesTab';
import PartidosTab from '../components/PartidosTab';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Calendar, Users, Trophy,
  ArrowLeft, MapPin, Tag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Torneo {
  id: string;
  name: string;
  type: 'cup' | 'league' | string;
  start_date: string | null;
  status: 'upcoming' | 'active' | 'finished' | string;
  season: string | null;
  period: string | null;
  level: string | null;
  gender: string | null;
  ubication_id: string | null;
}

interface TorneoTeam {
  id: string;
  team_id: string;
  status: string;
  TEAM: { id: string; name: string; logo: string | null } | null;
}

interface TorneoStanding {
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  TEAM: { name: string } | null;
}

interface TopScorer {
  id: string;
  name: string;
  lastname: string | null;
  goals: number;
  assists: number;
  position: string | null;
  team_id: string;
  TEAM: { name: string } | null;
}

type TabId = 'participantes' | 'tabla' | 'llaves' | 'partidos' | 'goleadores';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  upcoming: { label: 'Inscripciones', color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  dot: '#3b82f6' },
  active:   { label: 'En curso',      color: '#22c55e', bg: 'rgba(22,163,74,0.12)',  dot: '#22c55e' },
  finished: { label: 'Finalizado',    color: '#64748b', bg: 'rgba(100,116,139,0.1)', dot: '#94a3b8' },
};

const TYPE_LABEL: Record<string, string> = { cup: 'Copa', league: 'Liga' };
const GENDER_LABEL: Record<string, string> = { male: 'Masculino', female: 'Femenino', mixed: 'Mixto' };

function safeDate(raw: string | null | undefined, opts: Intl.DateTimeFormatOptions): string {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES', opts);
}

const CARD_GRADIENTS = [
  ['#1e1b4b', '#4338ca'],
  ['#164e63', '#0e7490'],
  ['#14532d', '#15803d'],
  ['#7c2d12', '#c2410c'],
];

const POSITION_LABEL: Record<string, string> = {
  GK: 'POR', DEF: 'DEF', MID: 'MED', FWD: 'DEL',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [torneo, setTorneo]       = useState<Torneo | null>(null);
  const [teams, setTeams]             = useState<TorneoTeam[]>([]);
  const [standings, setStandings]     = useState<TorneoStanding[]>([]);
  const [scorers, setScorers]         = useState<TopScorer[]>([]);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [activeTab, setActiveTab]     = useState<TabId>('participantes');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving]       = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);

      const [torneoRes, teamsRes, standingsRes] = await Promise.all([
        supabase.from('TORNEO').select('*').eq('id', id).single(),
        supabase.from('TORNEO_TEAMS').select('*, TEAM(id, name, logo)').eq('torneo_id', id),
        supabase.from('TORNEO_STANDING')
          .select('team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, TEAM(name)')
          .eq('torneo_id', id)
          .is('stage_id', null)
          .order('points', { ascending: false }),
      ]);

      if (torneoRes.error || !torneoRes.data) {
        setNotFound(true);
      } else {
        setTorneo(torneoRes.data as Torneo);
        setTeams((teamsRes.data ?? []) as TorneoTeam[]);
        setStandings((standingsRes.data ?? []) as unknown as TorneoStanding[]);
      }

      setLoading(false);
    };

    fetchAll();
  }, [id]);

  useEffect(() => {
    const confirmed = teams.filter(t => t.status === 'confirmed');
    if (confirmed.length === 0) return;
    const ids = confirmed.map(t => t.team_id);
    supabase
      .from('GUEST_PLAYER')
      .select('id, name, lastname, goals, assists, position, team_id, TEAM(name)')
      .in('team_id', ids)
      .eq('is_active', true)
      .order('goals', { ascending: false })
      .limit(10)
      .then(({ data }) => setScorers((data ?? []) as unknown as TopScorer[]));
  }, [teams]);

  const handleRemoveTeam = async (torneoTeamId: string) => {
    setRemoving(true);
    const { error } = await supabase.from('TORNEO_TEAMS').delete().eq('id', torneoTeamId);
    if (!error) setTeams(prev => prev.filter(t => t.id !== torneoTeamId));
    setPendingRemove(null);
    setRemoving(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(34,197,94,0.15)', borderTopColor: '#22c55e', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>Cargando torneo...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Not found ──
  if (notFound || !torneo) {
    return (
      <DashboardLayout>
        <div style={{ padding: 24, fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 900 }}>Torneo no encontrado</h1>
        </div>
      </DashboardLayout>
    );
  }

  const cfg          = STATUS_CONFIG[torneo.status] ?? STATUS_CONFIG.upcoming;
  const [from, to]   = CARD_GRADIENTS[0];
  const confirmedTeams = teams.filter(t => t.status === 'confirmed');

  const TABS: { id: TabId; label: string }[] = torneo.type === 'league'
    ? [
        { id: 'participantes', label: 'Participantes' },
        { id: 'tabla',         label: 'Tabla' },
        { id: 'partidos',      label: 'Partidos' },
        { id: 'goleadores',    label: 'Goleadores' },
      ]
    : [
        { id: 'participantes', label: 'Participantes' },
        { id: 'llaves',        label: 'Llaves' },
        { id: 'partidos',      label: 'Partidos' },
        { id: 'goleadores',    label: 'Goleadores' },
      ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5" style={{ fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
          .standing-row:hover { background: rgba(255,255,255,0.04) !important; }
          .tabs-bar::-webkit-scrollbar { display: none; }
          .tabs-bar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* ─── BACK BUTTON ──────────────────────────────────── */}
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', transition: 'color 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        {/* ─── HERO ─────────────────────────────────────────── */}
        <div style={{ borderRadius: 20, overflow: 'hidden', background: `linear-gradient(135deg, ${from}, ${to})`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 900 280" preserveAspectRatio="xMidYMid slice">
              <circle cx="450" cy="140" r="90" fill="none" stroke="white" strokeWidth="2"/>
              <line x1="450" y1="0" x2="450" y2="280" stroke="white" strokeWidth="2"/>
              <rect x="10" y="10" width="880" height="260" rx="6" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>

          <div className="p-5 sm:p-8" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: cfg.bg, border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, animation: torneo.status === 'active' ? 'pulse-dot 2s ease infinite' : 'none' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: torneo.status === 'active' ? '#fff' : cfg.color, letterSpacing: 0.5 }}>{cfg.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.12)' }}>
                <Trophy size={11} color="rgba(255,255,255,0.9)" />
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{TYPE_LABEL[torneo.type] ?? torneo.type}</span>
              </div>
            </div>

            <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1.1, marginBottom: 20 }}>
              {torneo.name}
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { icon: Calendar, label: 'Inicio',    value: safeDate(torneo.start_date, { day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: Tag,      label: 'Temporada', value: [torneo.season, torneo.period].filter(Boolean).join(' · ') || '—' },
                { icon: MapPin,   label: 'Nivel',     value: torneo.level ?? '—' },
                { icon: Users,    label: 'Género',    value: GENDER_LABEL[torneo.gender ?? ''] ?? torneo.gender ?? '—' },
              ].map(m => {
                const MIcon = m.icon;
                return (
                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <MIcon size={12} color="rgba(255,255,255,0.6)" />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{m.label}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: "'Barlow', sans-serif" }}>{m.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── TABS ─────────────────────────────────────────── */}
        <div>
          {/* Tab bar */}
          <div className="tabs-bar" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: 0, overflowX: 'auto' }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '12px 20px', whiteSpace: 'nowrap',
                    fontSize: 14, fontWeight: 800, letterSpacing: 0.5,
                    fontFamily: 'inherit',
                    color: active ? '#f1f5f9' : 'rgba(255,255,255,0.35)',
                    borderBottom: active ? '2px solid #22c55e' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'color 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ paddingTop: 20 }}>

            {/* ── Participantes ── */}
            {activeTab === 'participantes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    {teams.length} inscrito{teams.length !== 1 ? 's' : ''} · {confirmedTeams.length} confirmado{confirmedTeams.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {teams.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>No hay equipos inscritos aún</p>
                ) : teams.map((t, i) => {
                  const isConfirmed = t.status === 'confirmed';
                  const isPending   = pendingRemove === t.id;

                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: isPending ? 'rgba(239,68,68,0.06)' : '#0d1117', border: `1px solid ${isPending ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s, background 0.2s' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.2)', width: 24, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][0]}, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {t.TEAM?.name?.[0] ?? '?'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.TEAM?.name ?? 'Equipo'}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: isConfirmed ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: isConfirmed ? '#22c55e' : '#d97706', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                          {isConfirmed ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </div>

                      {/* Actions */}
                      {isPending ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>¿Eliminar?</span>
                          <button
                            onClick={() => handleRemoveTeam(t.id)}
                            disabled={removing}
                            style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 12, fontWeight: 800, cursor: removing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: removing ? 0.5 : 1 }}
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setPendingRemove(null)}
                            disabled={removing}
                            style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPendingRemove(t.id)}
                          title="Eliminar del torneo"
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s, background 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'none'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Tabla (liga) ── */}
            {activeTab === 'tabla' && (
              <div style={{ borderRadius: 16, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                {standings.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: "'Barlow', sans-serif", padding: '20px 16px' }}>
                    La tabla de posiciones estará disponible cuando comiencen los partidos
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          {['Pos', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Pts'].map((h, i) => (
                            <th key={h} style={{ padding: i < 2 ? '10px 14px' : '10px 12px', textAlign: i < 2 ? 'left' : 'center', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s, i) => {
                          const pos = i + 1;
                          const posColor = pos === 1 ? '#22c55e' : pos <= 2 ? '#0891b2' : pos >= standings.length ? '#ef4444' : 'rgba(255,255,255,0.25)';
                          return (
                            <tr key={s.team_id} className="standing-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                              <td style={{ padding: '11px 14px', textAlign: 'left' }}>
                                <span style={{ fontSize: 13, fontWeight: 900, color: posColor }}>{pos}</span>
                              </td>
                              <td style={{ padding: '11px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][0]}, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                                    {s.TEAM?.name?.[0] ?? '?'}
                                  </div>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{s.TEAM?.name ?? '—'}</span>
                                </div>
                              </td>
                              {[s.played, s.won, s.drawn, s.lost, s.goals_for, s.goals_against].map((v, ci) => (
                                <td key={ci} style={{ padding: '11px 12px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{v}</td>
                              ))}
                              <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: s.goal_difference > 0 ? '#22c55e' : s.goal_difference < 0 ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
                                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                              </td>
                              <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', background: 'rgba(34,197,94,0.12)', borderRadius: 7, padding: '3px 10px', display: 'inline-block' }}>{s.points}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Llaves (copa) ── */}
            {activeTab === 'llaves' && (
              <LlavesTab
                tournamentId={id!}
                teams={confirmedTeams.map(t => ({ id: t.team_id, name: t.TEAM?.name ?? '' }))}
              />
            )}

            {/* ── Partidos ── */}
            {activeTab === 'partidos' && (
              <PartidosTab
                tournamentId={id!}
                teamCount={confirmedTeams.length}
              />
            )}

            {/* ── Goleadores ── */}
            {activeTab === 'goleadores' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scorers.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>No hay estadísticas de jugadores aún</p>
                ) : scorers.map((p, i) => {
                  const fullName = [p.name, p.lastname].filter(Boolean).join(' ');
                  const isTop = i === 0;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: isTop ? 'rgba(251,191,36,0.06)' : '#0d1117', border: `1px solid ${isTop ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: isTop ? '#fbbf24' : 'rgba(255,255,255,0.2)', width: 24, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: isTop ? 'linear-gradient(135deg, #b45309, #d97706)' : `linear-gradient(135deg, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][0]}, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {fullName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", marginTop: 1 }}>
                          {p.TEAM?.name ?? '—'}{p.position ? ` · ${POSITION_LABEL[p.position] ?? p.position}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 18, fontWeight: 900, color: isTop ? '#fbbf24' : '#f1f5f9', lineHeight: 1 }}>{p.goals}</p>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow', sans-serif", textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>Goles</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>{p.assists}</p>
                          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow', sans-serif", textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>Asist</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
