import { useState, useEffect, useCallback, type ElementType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalendarRange, Trophy, RefreshCw, ArrowLeftRight, Layers,
  Users, ChevronRight, AlertTriangle, X, ExternalLink,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Torneo   { id: string; name: string; status: string; }
interface Team     { id: string; name: string; }
interface Group    { id: string; name: string; stage_id: string; }
interface GroupRow {
  group_id: string; team_id: string | null;
  played: number; won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number; points: number;
}

interface StageMatch {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  match_round: number;
  group_id: string | null;
  status: string;
  home_score?: number | null;
  away_score?: number | null;
}

interface Stage {
  id: string;
  name: string;
  type: string;
  stage_order: number;
  status: string;
  matches: StageMatch[];
}

type FixtureFormat = 'liga-ida' | 'liga-ida-vuelta' | 'liga-copa' | 'copa';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateRoundRobin(teams: Team[]): { home: Team; away: Team }[][] {
  const list = [...teams];
  if (list.length % 2 !== 0) list.push({ id: '__bye__', name: 'Bye' });
  const numRounds = list.length - 1;
  const half = list.length / 2;
  const rounds: { home: Team; away: Team }[][] = [];
  for (let r = 0; r < numRounds; r++) {
    const round: { home: Team; away: Team }[] = [];
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];
      if (home.id !== '__bye__' && away.id !== '__bye__') round.push({ home, away });
    }
    rounds.push(round);
    list.splice(1, 0, list.pop()!);
  }
  return rounds;
}

function generateKnockoutRounds(teams: Team[]): { home: Team | null; away: Team | null }[][] {
  let size = 1;
  while (size < teams.length) size *= 2;
  const seeded: (Team | null)[] = [...teams];
  while (seeded.length < size) seeded.push(null);
  const rounds: { home: Team | null; away: Team | null }[][] = [];
  const r1: { home: Team | null; away: Team | null }[] = [];
  for (let i = 0; i < size; i += 2) r1.push({ home: seeded[i], away: seeded[i + 1] });
  rounds.push(r1);
  let next = size / 4;
  while (next >= 1) {
    rounds.push(Array.from({ length: next }, () => ({ home: null, away: null })));
    next = Math.floor(next / 2);
  }
  return rounds;
}

function knockoutRoundLabel(totalRounds: number, roundIndex: number): string {
  const fromEnd = totalRounds - roundIndex;
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinal';
  if (fromEnd === 3) return 'Cuartos de final';
  if (fromEnd === 4) return 'Octavos de final';
  return `Ronda ${roundIndex + 1}`;
}

// ─── Format options ───────────────────────────────────────────────────────────

const FORMATS: {
  id: FixtureFormat; Icon: ElementType;
  title: string; sub: string; desc: string; color: string; rgb: string;
}[] = [
  { id: 'liga-ida',       Icon: RefreshCw,     title: 'Liga — Solo ida',      sub: 'Todos contra todos',    desc: 'Cada equipo juega una vez contra todos los demás. El campeón acumula más puntos.',                            color: '#3b82f6', rgb: '59,130,246'  },
  { id: 'liga-ida-vuelta',Icon: ArrowLeftRight, title: 'Liga — Ida y vuelta',  sub: 'Todos contra todos × 2',desc: 'Cada equipo se enfrenta dos veces: una de local y una de visitante.',                                       color: '#8b5cf6', rgb: '139,92,246' },
  { id: 'liga-copa',      Icon: Layers,         title: 'Liga + Eliminación',   sub: 'Grupos y llaves',       desc: 'Fase de todos contra todos, seguida de ronda eliminatoria con los mejor clasificados.',                     color: '#f59e0b', rgb: '245,158,11' },
  { id: 'copa',           Icon: Trophy,         title: 'Eliminación directa',  sub: 'Copa / Llaves',         desc: 'El que pierde queda eliminado. Llaves desde el inicio hasta la gran final.',                               color: '#22c55e', rgb: '34,197,94'  },
];

function getPreviewStats(format: FixtureFormat, n: number) {
  if (format === 'liga-ida') { const rounds = n % 2 === 0 ? n - 1 : n; return { matches: Math.floor(n / 2) * rounds, rounds }; }
  if (format === 'liga-ida-vuelta') { const r = n % 2 === 0 ? n - 1 : n; return { matches: Math.floor(n / 2) * r * 2, rounds: r * 2 }; }
  if (format === 'copa') { let size = 1; while (size < n) size *= 2; return { matches: size - 1, rounds: Math.log2(size) }; }
  const r1 = n % 2 === 0 ? n - 1 : n; const m1 = Math.floor(n / 2) * r1;
  let topN = Math.min(n, 4); let kSize = 1; while (kSize < topN) kSize *= 2;
  return { matches: m1 + kSize - 1, rounds: r1 + Math.log2(kSize) };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchCard({ match, teamMap }: { match: StageMatch; teamMap: Record<string, Team> }) {
  const home = teamMap[match.home_team_id ?? ''];
  const away = teamMap[match.away_team_id ?? ''];
  const hasScore = match.home_score != null && match.away_score != null;
  const pending  = match.status === 'pending' && !home && !away;
  const isDone   = match.status === 'finished';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: home ? '#fff' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: 0.3, margin: 0, textAlign: 'right', lineHeight: 1.2 }}>
        {home?.name ?? '—'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, flexShrink: 0 }}>
        {hasScore ? (
          <span style={{ fontSize: 16, fontWeight: 900, color: isDone ? 'rgba(255,255,255,0.6)' : '#22c55e', letterSpacing: 2 }}>
            {match.home_score} — {match.away_score}
          </span>
        ) : pending ? (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: "'Barlow', sans-serif", letterSpacing: 1, textTransform: 'uppercase' }}>TBD</span>
        ) : (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>vs</span>
        )}
      </div>
      <p style={{ fontSize: 14, fontWeight: 800, color: away ? '#fff' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: 0.3, margin: 0, textAlign: 'left', lineHeight: 1.2 }}>
        {away?.name ?? '—'}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Cronograma() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const validId = tournamentId && UUID_RE.test(tournamentId) ? tournamentId : null;

  const [profileId, setProfileId] = useState<string | null>(null);
  const [torneos,   setTorneos]   = useState<Torneo[]>([]);
  const [torneo,    setTorneo]    = useState<Torneo | null>(null);
  const [teams,     setTeams]     = useState<Team[]>([]);
  const [stages,    setStages]    = useState<Stage[]>([]);
  const [groups,    setGroups]    = useState<Group[]>([]);
  const [groupRows, setGroupRows] = useState<GroupRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [format,    setFormat]    = useState<FixtureFormat>('liga-ida');
  const [generating,setGenerating]= useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── active knockout round per stage ──────────────────────────────────────
  const [koRound, setKoRound] = useState<Record<string, number>>({});

  const fontStack = "'Barlow Condensed', system-ui, sans-serif";

  useEffect(() => {
    if (!user) return;
    supabase.from('PROFILE').select('id').eq('auth_id', user.id).single()
      .then(({ data }) => setProfileId(data?.id ?? null));
  }, [user]);

  useEffect(() => {
    if (!profileId || validId) return;
    supabase.from('TORNEO_ADMINS').select('torneo_id').eq('profile_id', profileId)
      .then(async ({ data: adm }) => {
        if (!adm?.length) { setTorneos([]); setLoading(false); return; }
        const ids = adm.map((a: any) => a.torneo_id);
        const { data } = await supabase.from('TORNEO').select('id, name, status').in('id', ids).order('created_at', { ascending: false });
        setTorneos((data ?? []) as Torneo[]);
        setLoading(false);
      });
  }, [profileId, validId]);

  const loadTournament = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { data: t, error: te } = await supabase.from('TORNEO').select('id, name, status').eq('id', id).single();
    if (te || !t) { setError('Torneo no encontrado'); setLoading(false); return; }
    setTorneo(t as Torneo);

    const { data: tt } = await supabase.from('TORNEO_TEAMS').select('TEAM(id, name)').eq('torneo_id', id);
    setTeams(((tt ?? []).map((r: any) => r.TEAM).filter(Boolean)) as Team[]);

    const { data: stg } = await supabase.from('TORNEO_STAGE').select('*').eq('torneo_id', id).order('stage_order');

    if (stg && stg.length > 0) {
      const stageIds = stg.map((s: any) => s.id);

      const [{ data: matchData }, { data: groupData }] = await Promise.all([
        supabase.from('MATCH').select('id,stage_id,home_team_id,away_team_id,match_round,group_id,status,home_score,away_score').in('stage_id', stageIds).order('match_round'),
        supabase.from('TORNEO_GROUP').select('id, name, stage_id').in('stage_id', stageIds).order('name'),
      ]);

      const grpArr = (groupData ?? []) as Group[];
      setGroups(grpArr);

      if (grpArr.length > 0) {
        const groupIds = grpArr.map(g => g.id);
        const { data: grpTeams } = await supabase
          .from('TORNEO_GROUP_TEAMS')
          .select('group_id, team_id, played, won, drawn, lost, goals_for, goals_against, points')
          .in('group_id', groupIds)
          .order('points', { ascending: false });
        setGroupRows((grpTeams ?? []) as GroupRow[]);
      } else {
        setGroupRows([]);
      }

      const stagesWithMatches = stg.map((s: any) => ({
        ...s,
        matches: (matchData ?? []).filter((m: any) => m.stage_id === s.id),
      }));
      setStages(stagesWithMatches);

      // Init knockout round selection — always start at round 1
      const init: Record<string, number> = {};
      stagesWithMatches.forEach((s: Stage) => {
        if (s.type === 'knockout') init[s.id] = 1;
      });
      setKoRound(init);
    } else {
      setStages([]);
      setGroups([]);
      setGroupRows([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (validId) loadTournament(validId);
  }, [validId, loadTournament]);

  const handleGenerate = async () => {
    if (!validId || teams.length < 2 || generating) return;
    setGenerating(true);
    setError(null);
    try {
      if (format === 'liga-ida' || format === 'liga-ida-vuelta') {
        const rounds1 = generateRoundRobin(teams);
        const rounds = format === 'liga-ida-vuelta'
          ? [...rounds1, ...rounds1.map(r => r.map(({ home, away }) => ({ home: away, away: home })))]
          : rounds1;
        const { data: stage, error: se } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: validId, name: 'Fase de Liga', type: 'group', stage_order: 1, status: 'active' }).select().single();
        if (se || !stage) throw new Error('Error al crear la fase');
        const rows: any[] = [];
        rounds.forEach((round, ri) => round.forEach(({ home, away }) => rows.push({ torneo_id: validId, stage_id: stage.id, home_team_id: home.id, away_team_id: away.id, match_round: ri + 1, status: 'scheduled' })));
        await supabase.from('MATCH').insert(rows);

      } else if (format === 'copa') {
        const kRounds = generateKnockoutRounds(teams);
        const { data: stage, error: se } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: validId, name: 'Copa', type: 'knockout', stage_order: 1, status: 'active' }).select().single();
        if (se || !stage) throw new Error('Error al crear la fase');
        const rows: any[] = [];
        kRounds.forEach((round, ri) => round.forEach(({ home, away }) => {
          if (ri === 0 && !home && !away) return; // skip bye slots in round 1 only
          rows.push({ torneo_id: validId, stage_id: stage.id, home_team_id: home?.id ?? null, away_team_id: away?.id ?? null, match_round: ri + 1, status: home && away ? 'scheduled' : 'pending' });
        }));
        await supabase.from('MATCH').insert(rows);

      } else {
        const rounds = generateRoundRobin(teams);
        const { data: gStage, error: ge } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: validId, name: 'Fase de Liga', type: 'group', stage_order: 1, status: 'active' }).select().single();
        if (ge || !gStage) throw new Error('Error al crear la fase de liga');
        const groupRows2: any[] = [];
        rounds.forEach((round, ri) => round.forEach(({ home, away }) => groupRows2.push({ torneo_id: validId, stage_id: gStage.id, home_team_id: home.id, away_team_id: away.id, match_round: ri + 1, status: 'scheduled' })));
        await supabase.from('MATCH').insert(groupRows2);

        let topN = Math.min(teams.length, 4); let kSize = 1; while (kSize < topN) kSize *= 2;
        const { data: kStage, error: ke } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: validId, name: 'Fase Eliminatoria', type: 'knockout', stage_order: 2, status: 'pending' }).select().single();
        if (ke || !kStage) throw new Error('Error al crear la fase eliminatoria');
        const koRows: any[] = [];
        let matchesInRound = kSize / 2; let roundNum = 1;
        while (matchesInRound >= 1) {
          for (let i = 0; i < matchesInRound; i++) koRows.push({ torneo_id: validId, stage_id: kStage.id, home_team_id: null, away_team_id: null, match_round: roundNum, status: 'pending' });
          matchesInRound = Math.floor(matchesInRound / 2); roundNum++;
        }
        await supabase.from('MATCH').insert(koRows);
      }
      await loadTournament(validId);
    } catch (e: any) {
      setError(e.message ?? 'Error al generar el fixture');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = async () => {
    if (!validId || resetting) return;
    setResetting(true);
    setShowResetConfirm(false);
    const stageIds = stages.map(s => s.id);
    if (stageIds.length > 0) {
      await supabase.from('MATCH').delete().in('stage_id', stageIds);
      await supabase.from('TORNEO_STAGE').delete().in('id', stageIds);
    }
    setStages([]); setGroups([]); setGroupRows([]);
    setResetting(false);
  };

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const hasFixture = stages.length > 0;

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Tournament selector ───────────────────────────────────────────────────
  if (!validId) {
    return (
      <DashboardLayout>
        <div style={{ padding: '32px 24px', fontFamily: fontStack, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', flexShrink: 0 }}>
              <CalendarRange size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Cronograma</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontFamily: "'Barlow', sans-serif" }}>Selecciona un torneo para gestionar su fixture</p>
            </div>
          </div>
          {torneos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
              <CalendarRange size={40} color="rgba(255,255,255,0.12)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Sin torneos</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>Crea un torneo primero desde la sección Torneos</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {torneos.map(t => (
                <button key={t.id} onClick={() => navigate(`/brackets/${t.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(22,163,74,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(22,163,74,0.2)'; }}
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

  if (error && !torneo) {
    return (
      <DashboardLayout>
        <div style={{ padding: 32, textAlign: 'center', fontFamily: fontStack }}>
          <p style={{ color: '#f87171', fontSize: 16 }}>{error}</p>
          <button onClick={() => navigate('/brackets')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700 }}>Volver</button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getPreviewStats(format, teams.length);

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <style>{`
        @keyframes _spin{to{transform:rotate(360deg)}}
        .rounds-strip::-webkit-scrollbar{display:none}
        .rounds-strip{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      <div style={{ padding: '32px 24px', fontFamily: fontStack, maxWidth: 920, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/brackets')} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>{torneo?.name}</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0', fontFamily: "'Barlow', sans-serif" }}>Cronograma / Fixture</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hasFixture && (
              <button onClick={() => navigate(`/matches/${validId}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', color: '#60a5fa', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: fontStack }}>
                <ExternalLink size={13} /> Gestionar partidos
              </button>
            )}
            {hasFixture && (
              <button onClick={() => setShowResetConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', color: '#f87171', fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: fontStack }}>
                <RefreshCw size={14} /> Regenerar
              </button>
            )}
          </div>
        </div>

        {/* Teams strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", flexShrink: 0 }}>
            <Users size={13} />{teams.length} {teams.length === 1 ? 'equipo' : 'equipos'}
          </span>
          {teams.map(t => (
            <span key={t.id} style={{ padding: '3px 11px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {t.name}
            </span>
          ))}
          {teams.length === 0 && <span style={{ fontSize: 13, color: '#f59e0b', fontFamily: "'Barlow', sans-serif" }}>No hay equipos inscritos</span>}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', marginBottom: 20, color: '#f87171', fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>
            <AlertTriangle size={14} /><span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}><X size={14} /></button>
          </div>
        )}

        {/* ── FIXTURE GENERATOR ── */}
        {!hasFixture && (
          teams.length < 2 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(245,158,11,0.03)', borderRadius: 16, border: '1px dashed rgba(245,158,11,0.18)' }}>
              <AlertTriangle size={36} color="rgba(245,158,11,0.45)" style={{ marginBottom: 14 }} />
              <p style={{ color: '#f59e0b', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Faltan equipos</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>Necesitas al menos 2 equipos inscritos para generar el fixture</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontFamily: "'Barlow', sans-serif" }}>Selecciona el formato</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 12, marginBottom: 24 }}>
                {FORMATS.map(({ id, Icon, title, sub, desc, color, rgb }) => {
                  const sel = format === id;
                  return (
                    <button key={id} onClick={() => setFormat(id)} style={{ textAlign: 'left', padding: '18px 16px', borderRadius: 14, cursor: 'pointer', background: sel ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.03)', border: `1.5px solid ${sel ? color : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.2s', boxShadow: sel ? `0 0 20px rgba(${rgb},0.15)` : 'none', fontFamily: fontStack }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: sel ? `rgba(${rgb},0.15)` : 'rgba(255,255,255,0.06)', border: `1px solid ${sel ? `rgba(${rgb},0.35)` : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Icon size={17} color={sel ? color : 'rgba(255,255,255,0.35)'} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4, color: sel ? '#fff' : 'rgba(255,255,255,0.6)', margin: 0 }}>{title}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: sel ? color : 'rgba(255,255,255,0.22)', margin: '3px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{sub}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', fontFamily: "'Barlow', sans-serif", lineHeight: 1.5, margin: 0 }}>{desc}</p>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 24, padding: '14px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24, flexWrap: 'wrap' }}>
                {[{ label: 'Partidos', value: stats.matches }, { label: 'Jornadas / Rondas', value: stats.rounds }, { label: 'Equipos', value: teams.length }].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 4px', fontFamily: "'Barlow', sans-serif" }}>{label}</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: label === 'Partidos' ? '#22c55e' : '#fff', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={generating} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 20px rgba(22,163,74,0.3)', opacity: generating ? 0.7 : 1, fontFamily: fontStack }}>
                {generating ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: '_spin 0.8s linear infinite', flexShrink: 0 }} /> : <CalendarRange size={18} />}
                {generating ? 'Generando...' : 'Generar Fixture'}
              </button>
            </>
          )
        )}

        {/* ── FIXTURE VIEWER ─────────────────────────────────────────────── */}
        {hasFixture && stages.map((stage) => {
          const isKnockout = stage.type === 'knockout';
          const stageGroups = groups.filter(g => g.stage_id === stage.id);
          const hasGroups   = stageGroups.length > 0;

          // Visibles matches (exclude null-null byes)
          const visibleMatches = stage.matches.filter(m => m.home_team_id || m.away_team_id);

          return (
            <div key={stage.id} style={{ marginBottom: 48 }}>

              {/* ── Stage header ─────────────────────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${isKnockout ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)'}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: isKnockout ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${isKnockout ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isKnockout ? <Trophy size={17} color="#f59e0b" /> : <RefreshCw size={17} color="#22c55e" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{stage.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '2px 0 0', fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>
                    {stage.matches.length} partidos
                    {isKnockout ? '' : hasGroups ? ` · ${stageGroups.length} grupos` : ''}
                  </p>
                </div>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, background: stage.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${stage.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`, color: stage.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontFamily: fontStack }}>
                  {stage.status === 'active' ? 'Activa' : stage.status === 'pending' ? 'Pendiente' : stage.status}
                </span>
              </div>

              {/* ── GROUP STAGE with TORNEO_GROUP ────────────────────────── */}
              {!isKnockout && hasGroups && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {stageGroups.map(group => {
                    const standings = groupRows.filter(r => r.group_id === group.id).sort((a, b) => {
                      if (b.points !== a.points) return b.points - a.points;
                      const gdA = a.goals_for - a.goals_against;
                      const gdB = b.goals_for - b.goals_against;
                      return gdB - gdA;
                    });
                    const grpMatches = visibleMatches.filter(m => m.group_id === group.id);
                    const byRound = grpMatches.reduce<Record<number, StageMatch[]>>((acc, m) => {
                      (acc[m.match_round] = acc[m.match_round] || []).push(m);
                      return acc;
                    }, {});
                    const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

                    return (
                      <div key={group.id}>
                        {/* Group name */}
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 12px', fontFamily: fontStack }}>
                          {group.name}
                        </p>

                        {/* Standings table */}
                        {standings.length > 0 && (
                          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 16 }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 28px 28px 28px 32px 32px 36px', gap: 0, padding: '8px 14px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'Pts'].map((h, i) => (
                                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, textAlign: i > 1 ? 'center' : 'left', fontFamily: "'Barlow', sans-serif" }}>{h}</span>
                              ))}
                            </div>
                            {standings.map((row, idx) => {
                              const teamName = teamMap[row.team_id ?? '']?.name ?? '—';
                              const isTop = idx < 2;
                              return (
                                <div key={row.team_id ?? idx} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 32px 28px 28px 28px 32px 32px 36px', gap: 0, padding: '9px 14px', background: isTop ? 'rgba(34,197,94,0.04)' : 'transparent', borderBottom: idx < standings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: isTop ? '#22c55e' : 'rgba(255,255,255,0.3)', fontFamily: fontStack }}>{idx + 1}</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: fontStack }}>{teamName}</span>
                                  {[row.played, row.won, row.drawn, row.lost, row.goals_for, row.goals_against].map((v, vi) => (
                                    <span key={vi} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontFamily: fontStack, fontWeight: 600 }}>{v}</span>
                                  ))}
                                  <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: fontStack }}>{row.points}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Matches by round */}
                        {rounds.map(round => (
                          <div key={round} style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Barlow', sans-serif" }}>
                              Jornada {round}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {byRound[round].map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── GROUP STAGE without groups (liga-ida, liga-ida-vuelta, liga-copa) ── */}
              {!isKnockout && !hasGroups && (() => {
                const byRound = visibleMatches.reduce<Record<number, StageMatch[]>>((acc, m) => {
                  (acc[m.match_round] = acc[m.match_round] || []).push(m);
                  return acc;
                }, {});
                const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {rounds.map(round => (
                      <div key={round}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Barlow', sans-serif" }}>
                            Jornada {round}
                          </span>
                          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: "'Barlow', sans-serif" }}>{byRound[round].length} {byRound[round].length === 1 ? 'partido' : 'partidos'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {byRound[round].map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── KNOCKOUT STAGE ───────────────────────────────────────── */}
              {isKnockout && (() => {
                // Compute expected bracket size from enrolled teams (same logic as generation)
                let bracketSize = 1;
                while (bracketSize < teams.length) bracketSize *= 2;
                const totalExpectedRounds = Math.max(1, Math.log2(bracketSize));

                // Expected round numbers: [1, 2, 3, ...]  regardless of what's in DB
                const expectedRounds = Array.from({ length: totalExpectedRounds }, (_, i) => i + 1);
                const existingRoundSet = new Set(stage.matches.map(m => m.match_round));

                const activeRound = koRound[stage.id] ?? 1;
                const activeMatches = stage.matches.filter(m => m.match_round === activeRound);

                return (
                  <>
                    {/* Round chips — built from expected bracket structure, not DB state */}
                    <div className="rounds-strip" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 2 }}>
                      {expectedRounds.map((r, ri) => {
                        const label = knockoutRoundLabel(totalExpectedRounds, ri);
                        const active = activeRound === r;
                        const hasMatches = existingRoundSet.has(r);
                        const rMatches = stage.matches.filter(m => m.match_round === r);
                        const allDone  = rMatches.length > 0 && rMatches.every(m => m.status === 'finished');
                        return (
                          <button
                            key={r}
                            onClick={() => hasMatches && setKoRound(prev => ({ ...prev, [stage.id]: r }))}
                            style={{
                              flexShrink: 0, padding: '7px 18px', borderRadius: 99,
                              cursor: hasMatches ? 'pointer' : 'default',
                              fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                              fontFamily: fontStack, transition: 'all 0.15s',
                              background: active ? '#f59e0b' : hasMatches ? 'rgba(255,255,255,0.05)' : 'transparent',
                              border: `1px solid ${active ? '#f59e0b' : hasMatches ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                              color: active ? '#000' : allDone ? 'rgba(255,255,255,0.3)' : hasMatches ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
                              opacity: hasMatches ? 1 : 0.5,
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Matches of selected round */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activeMatches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: "'Barlow', sans-serif", margin: 0 }}>
                            Los equipos se definirán cuando avancen de ronda anterior
                          </p>
                        </div>
                      ) : (
                        activeMatches.map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} />)
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          );
        })}

        {/* ── Reset confirm modal ────────────────────────────────────────── */}
        {showResetConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowResetConfirm(false)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', background: '#0d1117', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 380, width: '100%', zIndex: 1, fontFamily: fontStack }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <AlertTriangle size={22} color="#f87171" />
              </div>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>¿Regenerar fixture?</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif", lineHeight: 1.6, margin: '0 0 24px' }}>Se eliminarán todos los partidos y etapas. Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack }}>Cancelar</button>
                <button onClick={handleReset} disabled={resetting} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', cursor: resetting ? 'not-allowed' : 'pointer', color: '#f87171', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', opacity: resetting ? 0.7 : 1, fontFamily: fontStack }}>
                  {resetting ? 'Eliminando...' : 'Regenerar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
