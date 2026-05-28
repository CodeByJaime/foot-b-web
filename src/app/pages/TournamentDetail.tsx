import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Calendar, Users, Trophy, BarChart3, GitBranch,
  ArrowLeft, MapPin, Tag, Clock,
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

interface TorneoMatch {
  id: string;
  home_score: number | null;
  away_score: number | null;
  date: string | null;
  status: string;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [torneo, setTorneo]   = useState<Torneo | null>(null);
  const [teams, setTeams]     = useState<TorneoTeam[]>([]);
  const [matches, setMatches] = useState<TorneoMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);

      const [torneoRes, teamsRes, matchesRes] = await Promise.all([
        supabase.from('TORNEO').select('*').eq('id', id).single(),
        supabase.from('TORNEO_TEAMS').select('*, TEAM(id, name, logo)').eq('torneo_id', id),
        supabase.from('MATCH')
          .select('id, home_score, away_score, date, status, home_team:TEAM!MATCH_home_team_id_fkey(name), away_team:TEAM!MATCH_away_team_id_fkey(name)')
          .eq('torneo_id', id)
          .order('date', { ascending: false })
          .limit(5),
      ]);

      if (torneoRes.error || !torneoRes.data) {
        setNotFound(true);
      } else {
        setTorneo(torneoRes.data as Torneo);
        setTeams((teamsRes.data ?? []) as TorneoTeam[]);
        setMatches((matchesRes.data ?? []) as unknown as TorneoMatch[]);
      }

      setLoading(false);
    };

    fetchAll();
  }, [id]);

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

  const cfg    = STATUS_CONFIG[torneo.status] ?? STATUS_CONFIG.upcoming;
  const [from, to] = CARD_GRADIENTS[0];
  const confirmedTeams = teams.filter(t => t.status === 'confirmed');
  const finishedMatches = matches.filter(m => m.status === 'finished');

  return (
    <DashboardLayout>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

        {/* ─── BACK BUTTON ──────────────────────────────────── */}
        <div>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <ArrowLeft size={16} /> Torneos
          </Link>
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

          <div style={{ padding: '32px 28px', position: 'relative', zIndex: 1 }}>
            {/* Status + type badges */}
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

            {/* Name */}
            <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1.1, marginBottom: 20 }}>
              {torneo.name}
            </h1>

            {/* Meta grid */}
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

        {/* ─── STAT CARDS ───────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { icon: Users,    label: 'Equipos confirmados', value: confirmedTeams.length, color: '#0891b2', grad: 'linear-gradient(135deg, #0891b2, #0e7490)' },
            { icon: Calendar, label: 'Partidos jugados',    value: finishedMatches.length, color: '#8b5cf6', grad: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
            { icon: Clock,    label: 'Partidos pendientes', value: matches.filter(m => m.status === 'scheduled').length, color: '#d97706', grad: 'linear-gradient(135deg, #d97706, #b45309)' },
          ].map((s, i) => {
            const SIcon = s.icon;
            return (
              <div key={i} style={{ padding: '20px', borderRadius: 18, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <SIcon size={17} color="#fff" />
                </div>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* ─── QUICK LINKS ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { to: `/standings/${id}`, icon: BarChart3, label: 'Tabla de posiciones', sub: 'Ver clasificación', color: '#22c55e', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.2)' },
            { to: `/brackets/${id}`,  icon: GitBranch, label: 'Llaves',              sub: 'Ver eliminatorias', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
            { to: `/matches`,         icon: Calendar,  label: 'Partidos',             sub: 'Ver calendario',   color: '#0891b2', bg: 'rgba(8,145,178,0.1)',  border: 'rgba(8,145,178,0.2)'  },
            { to: `/teams`,           icon: Users,     label: 'Equipos',              sub: 'Gestionar equipos', color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.2)'  },
          ].map(l => {
            const LIcon = l.icon;
            return (
              <Link key={l.to} to={l.to} style={{ display: 'block', padding: '18px', borderRadius: 16, background: '#0d1117', border: `1px solid rgba(255,255,255,0.06)`, textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = l.border; e.currentTarget.style.background = l.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#0d1117'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: l.bg, border: `1px solid ${l.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <LIcon size={17} color={l.color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{l.label}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif" }}>{l.sub}</p>
              </Link>
            );
          })}
        </div>

        {/* ─── TEAMS + MATCHES ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

          {/* Equipos */}
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Inscritos</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5, marginBottom: 18 }}>
              Equipos
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(22,163,74,0.1)', color: '#22c55e', verticalAlign: 'middle' }}>{confirmedTeams.length}</span>
            </h2>

            {confirmedTeams.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>No hay equipos confirmados aún</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {confirmedTeams.map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.2)', width: 20 }}>{i + 1}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][0]}, ${CARD_GRADIENTS[i % CARD_GRADIENTS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {t.TEAM?.name?.[0] ?? '?'}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{t.TEAM?.name ?? 'Equipo'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimos partidos */}
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Resultados</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5, marginBottom: 18 }}>Últimos partidos</h2>

            {finishedMatches.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>No hay resultados aún</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {finishedMatches.slice(0, 4).map(m => (
                  <div key={m.id} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow', sans-serif", marginBottom: 8 }}>
                      {safeDate(m.date, { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(m.home_team as any)?.name ?? '—'}
                      </span>
                      <div style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', fontSize: 15, fontWeight: 900, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                        {m.home_score ?? '?'} — {m.away_score ?? '?'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(m.away_team as any)?.name ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/matches" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#22c55e', textDecoration: 'none', fontWeight: 700, marginTop: 16, letterSpacing: 0.5 }}>
              Ver todos los partidos →
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
