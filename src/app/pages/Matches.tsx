import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, Calendar, MapPin, User, Trophy,
  RefreshCw, ChevronRight, X, AlertTriangle, Pencil,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Torneo  { id: string; name: string; status: string; }
interface Team    { id: string; name: string; }
interface Stage   { id: string; name: string; type: string; stage_order: number; }
interface Match   {
  id: string;
  stage_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  date: string | null;
  place: string | null;
  referee: string | null;
  status: string | null;
  match_round: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Programado',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)'  },
  live:      { label: 'En vivo',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)'  },
  finished:  { label: 'Finalizado',  color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)' },
  pending:   { label: 'Por definir', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
};

function knockoutLabel(totalRounds: number, roundIndex: number): string {
  const fromEnd = totalRounds - roundIndex;
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinal';
  if (fromEnd === 3) return 'Cuartos';
  if (fromEnd === 4) return 'Octavos';
  return `Ronda ${roundIndex + 1}`;
}

function formatDate(d: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString('es-CO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const { tournamentId } = useParams<{ tournamentId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const validId = tournamentId && UUID_RE.test(tournamentId) ? tournamentId : null;

  const [profileId, setProfileId] = useState<string | null>(null);
  const [torneos, setTorneos]     = useState<Torneo[]>([]);
  const [torneo, setTorneo]       = useState<Torneo | null>(null);
  const [teams, setTeams]         = useState<Team[]>([]);
  const [stages, setStages]       = useState<Stage[]>([]);
  const [matches, setMatches]     = useState<Match[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Navigation state
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<number | null>(null);

  // Edit modal
  const [editMatch,   setEditMatch]   = useState<Match | null>(null);
  const [editStatus,  setEditStatus]  = useState('');
  const [editHome,    setEditHome]    = useState('');
  const [editAway,    setEditAway]    = useState('');
  const [saving,      setSaving]      = useState(false);

  const fontStack = "'Barlow Condensed', system-ui, sans-serif";

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase.from('PROFILE').select('id').eq('auth_id', user.id).single()
      .then(({ data }) => setProfileId(data?.id ?? null));
  }, [user]);

  // ── Load user's torneos (for selector screen) ──────────────────────────────
  useEffect(() => {
    if (!profileId || validId) return;
    supabase.from('TORNEO_ADMINS').select('torneo_id').eq('profile_id', profileId)
      .then(async ({ data: adm }) => {
        if (!adm?.length) { setTorneos([]); setLoading(false); return; }
        const ids = adm.map((a: any) => a.torneo_id);
        const { data } = await supabase
          .from('TORNEO').select('id, name, status').in('id', ids).order('created_at', { ascending: false });
        setTorneos((data ?? []) as Torneo[]);
        setLoading(false);
      });
  }, [profileId, validId]);

  // ── Load tournament data ───────────────────────────────────────────────────
  const loadTournament = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { data: t, error: te } = await supabase
      .from('TORNEO').select('id, name, status').eq('id', id).single();
    if (te || !t) { setError('Torneo no encontrado'); setLoading(false); return; }
    setTorneo(t as Torneo);

    const { data: stgData } = await supabase
      .from('TORNEO_STAGE').select('id, name, type, stage_order')
      .eq('torneo_id', id).order('stage_order');
    const stgArr = (stgData ?? []) as Stage[];
    setStages(stgArr);

    if (!stgArr.length) { setMatches([]); setLoading(false); return; }

    const stageIds = stgArr.map(s => s.id);
    const { data: mData } = await supabase
      .from('MATCH').select('*').in('stage_id', stageIds).order('match_round');
    const mArr = (mData ?? []) as Match[];
    setMatches(mArr);

    // Fetch teams
    const teamIds = new Set<string>();
    mArr.forEach(m => {
      if (m.home_team_id) teamIds.add(m.home_team_id);
      if (m.away_team_id) teamIds.add(m.away_team_id);
    });
    if (teamIds.size > 0) {
      const { data: tData } = await supabase
        .from('TEAM').select('id, name').in('id', [...teamIds]);
      setTeams((tData ?? []) as Team[]);
    }

    // Default selections — pre-select round 1 so matches show immediately
    setActiveStage(stgArr[0]?.id ?? null);
    setActiveRound(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (validId) loadTournament(validId);
  }, [validId, loadTournament]);

  // ── When active stage changes, reset to round 1 ──────────────────────────
  useEffect(() => {
    if (!activeStage) return;
    setActiveRound(1);
  }, [activeStage, matches]);

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const openEdit = (m: Match) => {
    setEditMatch(m);
    setEditStatus(m.status ?? 'scheduled');
    setEditHome(m.home_score?.toString() ?? '');
    setEditAway(m.away_score?.toString() ?? '');
  };

  const handleSave = async () => {
    if (!editMatch || !validId) return;
    setSaving(true);
    const update: any = { status: editStatus };
    if (editStatus === 'finished' || editStatus === 'live') {
      const hs = parseInt(editHome, 10);
      const as_ = parseInt(editAway, 10);
      update.home_score = isNaN(hs)  ? null : hs;
      update.away_score = isNaN(as_) ? null : as_;
    } else {
      update.home_score = null;
      update.away_score = null;
    }
    const { error: e } = await supabase.from('MATCH').update(update).eq('id', editMatch.id);
    if (e) setError(e.message);
    setEditMatch(null);
    await loadTournament(validId);
    setSaving(false);
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  const currentStage = stages.find(s => s.id === activeStage);
  const isKnockout   = currentStage?.type === 'knockout';

  // All matches for the active stage (including pending/TBD ones)
  const allStageMatches = matches.filter(m => m.stage_id === activeStage);
  // Only matches that have at least one team assigned
  const stageMatches    = allStageMatches.filter(m => m.home_team_id || m.away_team_id);

  // Rounds that actually exist in DB (for disabling chips)
  const existingRoundSet = new Set(allStageMatches.map(m => m.match_round));

  // ── Chip rounds ──
  // For knockout: derive expected total rounds from round-1 match count (same
  // logic as bracket generator). Works even for old brackets that only stored
  // round 1 in the DB before the ri===0 fix.
  // For league: just use actual rounds with matches.
  let chipsRounds: number[];
  let totalChipRounds: number;

  if (isKnockout) {
    let bracketSize = 1;
    while (bracketSize < teams.length) bracketSize *= 2;
    totalChipRounds = Math.max(1, Math.log2(bracketSize));
    chipsRounds = Array.from({ length: totalChipRounds }, (_, i) => i + 1);
  } else {
    chipsRounds = [...new Set(stageMatches.map(m => m.match_round).filter(r => r != null))]
      .sort((a, b) => (a ?? 0) - (b ?? 0)) as number[];
    totalChipRounds = chipsRounds.length;
  }

  // Matches to show in selected round
  const roundMatches = isKnockout
    ? allStageMatches.filter(m => m.match_round === activeRound)
    : stageMatches.filter(m => m.match_round === activeRound);

  const showScore = editStatus === 'finished' || editStatus === 'live';

  // ─── Shared input styles ───────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 14, fontFamily: "'Barlow', sans-serif", boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 6, display: 'block',
    fontFamily: "'Barlow', sans-serif",
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(34,197,94,0.15)', borderTopColor: '#22c55e', animation: '_spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: fontStack, letterSpacing: 1, textTransform: 'uppercase' }}>Cargando...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Tournament selector ───────────────────────────────────────────────────
  if (!validId) {
    return (
      <DashboardLayout>
        <div style={{ padding: '32px 24px', fontFamily: fontStack, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', flexShrink: 0 }}>
              <ClipboardList size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Partidos</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontFamily: "'Barlow', sans-serif" }}>Selecciona un torneo para ver y gestionar sus partidos</p>
            </div>
          </div>

          {torneos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
              <ClipboardList size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Sin torneos</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>
                Crea un torneo primero desde la sección Torneos
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {torneos.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/matches/${t.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div>
                    <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{t.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: "'Barlow', sans-serif", margin: '2px 0 0', textTransform: 'capitalize' }}>{t.status}</p>
                  </div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error && !torneo) {
    return (
      <DashboardLayout>
        <div style={{ padding: 32, textAlign: 'center', fontFamily: fontStack }}>
          <p style={{ color: '#f87171', fontSize: 16 }}>{error}</p>
          <button onClick={() => navigate('/matches')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700 }}>
            Volver
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Main view ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <style>{`
        @keyframes _spin{to{transform:rotate(360deg)}}
        @keyframes _pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        .rounds-strip::-webkit-scrollbar{display:none}
        .rounds-strip{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div style={{ padding: '32px 24px', fontFamily: fontStack, maxWidth: 860, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button
            onClick={() => navigate('/matches')}
            style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>{torneo?.name}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0', fontFamily: "'Barlow', sans-serif" }}>
              {matches.filter(m => m.home_team_id || m.away_team_id).length} partidos generados
            </p>
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────────────────── */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', marginBottom: 20, color: '#f87171', fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>
            <AlertTriangle size={14} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}><X size={14} /></button>
          </div>
        )}

        {/* ── No fixture ──────────────────────────────────────────────────── */}
        {stages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
            <ClipboardList size={36} color="rgba(255,255,255,0.1)" style={{ marginBottom: 14 }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sin fixture generado</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'Barlow', sans-serif", marginTop: 6 }}>
              Ve a Cronograma para generar los partidos de este torneo
            </p>
          </div>
        )}

        {stages.length > 0 && (
          <>
            {/* ── Stage tabs (solo si hay más de una fase) ─────────────────── */}
            {stages.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {stages.map(s => {
                  const active = activeStage === s.id;
                  const isKO = s.type === 'knockout';
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStage(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
                        background: active ? (isKO ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)') : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? (isKO ? 'rgba(245,158,11,0.28)' : 'rgba(34,197,94,0.25)') : 'rgba(255,255,255,0.07)'}`,
                        color: active ? (isKO ? '#f59e0b' : '#22c55e') : 'rgba(255,255,255,0.4)',
                        fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                        fontFamily: fontStack, transition: 'all 0.15s',
                      }}
                    >
                      {isKO ? <Trophy size={13} /> : <RefreshCw size={13} />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Round chips (horizontal scroll) ─────────────────────────── */}
            {chipsRounds.length > 0 && (
              <div
                className="rounds-strip"
                style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 2 }}
              >
                {chipsRounds.map((r, ri) => {
                  const label     = isKnockout ? knockoutLabel(totalChipRounds, ri) : `J${r}`;
                  const active    = activeRound === r;
                  const hasMatches = existingRoundSet.has(r);
                  const roundMs   = allStageMatches.filter(m => m.match_round === r);
                  const hasLive   = roundMs.some(m => m.status === 'live');
                  const allDone   = roundMs.length > 0 && roundMs.every(m => m.status === 'finished');

                  return (
                    <button
                      key={r}
                      onClick={() => hasMatches && setActiveRound(r)}
                      style={{
                        flexShrink: 0, padding: '7px 16px', borderRadius: 99,
                        cursor: hasMatches ? 'pointer' : 'default',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                        fontFamily: fontStack, transition: 'all 0.15s', position: 'relative',
                        background: active ? '#22c55e' : hasMatches && hasLive ? 'rgba(34,197,94,0.1)' : hasMatches ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: `1px solid ${active ? '#22c55e' : hasMatches && hasLive ? 'rgba(34,197,94,0.3)' : hasMatches ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                        color: active ? '#000' : allDone ? 'rgba(255,255,255,0.3)' : hasMatches && hasLive ? '#22c55e' : hasMatches ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
                        opacity: hasMatches ? 1 : 0.5,
                      }}
                    >
                      {hasLive && !active && (
                        <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: '_pulse 1.4s ease-in-out infinite' }} />
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Match cards ─────────────────────────────────────────────── */}
            {roundMatches.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'Barlow', sans-serif", margin: 0 }}>
                  {isKnockout && activeRound != null && !existingRoundSet.has(activeRound)
                    ? 'Los equipos se definirán cuando avancen de ronda anterior'
                    : 'Sin partidos en esta ronda'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roundMatches.map(match => {
                const home   = teamMap[match.home_team_id ?? ''];
                const away   = teamMap[match.away_team_id ?? ''];
                const cfg    = STATUS_CFG[match.status ?? ''] ?? STATUS_CFG.pending;
                const isLive = match.status === 'live';
                const isDone = match.status === 'finished';
                const hasScore = match.home_score != null && match.away_score != null;
                const canEdit  = !!home || !!away;
                const dateStr  = formatDate(match.date);

                return (
                  <div
                    key={match.id}
                    onClick={() => canEdit && openEdit(match)}
                    style={{
                      borderRadius: 14,
                      background: isLive ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${isLive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: canEdit ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (canEdit) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isLive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.13)'; el.style.background = isLive ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)'; } }}
                    onMouseLeave={e => { if (canEdit) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isLive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'; el.style.background = isLive ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.025)'; } }}
                  >
                    {/* Teams + score */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '14px 16px 10px' }}>
                      <p style={{ fontSize: 17, fontWeight: 900, color: home ? '#fff' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.4, margin: 0, textAlign: 'right', lineHeight: 1.2 }}>
                        {home?.name ?? '—'}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
                        {hasScore ? (
                          <span style={{ fontSize: 20, fontWeight: 900, color: isDone ? 'rgba(255,255,255,0.65)' : '#22c55e', letterSpacing: 3 }}>
                            {match.home_score} — {match.away_score}
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: "'Barlow', sans-serif" }}>
                            <Pencil size={10} /> resultado
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 900, color: away ? '#fff' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.4, margin: 0, textAlign: 'left', lineHeight: 1.2 }}>
                        {away?.name ?? '—'}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {dateStr && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: "'Barlow', sans-serif" }}>
                            <Calendar size={11} />{dateStr}
                          </span>
                        )}
                        {match.place && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: "'Barlow', sans-serif" }}>
                            <MapPin size={11} />{match.place}
                          </span>
                        )}
                        {match.referee && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: "'Barlow', sans-serif" }}>
                            <User size={11} />{match.referee}
                          </span>
                        )}
                      </div>
                      {/* Status badge */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0 }}>
                        {isLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: '_pulse 1.4s ease-in-out infinite', display: 'inline-block' }} />}
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────────── */}
      {editMatch && (() => {
        const home = teamMap[editMatch.home_team_id ?? ''];
        const away = teamMap[editMatch.away_team_id ?? ''];
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setEditMatch(null)}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
            <div
              style={{ position: 'relative', background: '#0d1117', borderRadius: 20, padding: '26px 22px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 460, width: '100%', zIndex: 1, fontFamily: fontStack, maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0, lineHeight: 1.2 }}>
                  {home?.name ?? '—'} <span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span> {away?.name ?? '—'}
                </p>
                <button onClick={() => setEditMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 18 }}>
                <span style={labelStyle}>Estado</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {(['scheduled', 'live', 'finished', 'pending'] as const).map(s => {
                    const cfg = STATUS_CFG[s];
                    const sel = editStatus === s;
                    return (
                      <button key={s} onClick={() => setEditStatus(s)} style={{ padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fontStack, border: `1px solid ${sel ? cfg.border : 'rgba(255,255,255,0.07)'}`, background: sel ? cfg.bg : 'transparent', color: sel ? cfg.color : 'rgba(255,255,255,0.3)', transition: 'all 0.15s' }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score */}
              {showScore && (
                <div style={{ marginBottom: 18 }}>
                  <span style={labelStyle}>Resultado</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Barlow', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home?.name ?? 'Local'}</p>
                      <input type="number" min={0} value={editHome} onChange={e => setEditHome(e.target.value)} placeholder="0" style={{ ...inputStyle, textAlign: 'center', fontSize: 28, fontWeight: 900, padding: '8px', fontFamily: fontStack }} />
                    </div>
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 900, paddingTop: 24 }}>—</span>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Barlow', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away?.name ?? 'Visita'}</p>
                      <input type="number" min={0} value={editAway} onChange={e => setEditAway(e.target.value)} placeholder="0" style={{ ...inputStyle, textAlign: 'center', fontSize: 28, fontWeight: 900, padding: '8px', fontFamily: fontStack }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditMatch(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack }}>
                  Cancelar
                </button>
                <button
                  onClick={handleSave} disabled={saving}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {saving && <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: '_spin 0.8s linear infinite' }} />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
