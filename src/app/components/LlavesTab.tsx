import { useState, useCallback, useEffect, type ElementType } from 'react';
import {
  CalendarRange, Trophy, RefreshCw, ArrowLeftRight, Layers,
  Users, AlertTriangle, X, Calendar, MapPin, User, LayoutGrid,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  date?: string | null;
  place?: string | null;
  referee?: string | null;
}

interface Stage {
  id: string;
  name: string;
  type: string;
  stage_order: number;
  status: string;
  matches: StageMatch[];
}

type FixtureFormat = 'liga-ida' | 'liga-ida-vuelta' | 'liga-copa' | 'copa' | 'grupos-copa';

interface GruposConfig {
  numGroups: number;
  groupFormat: 'ida' | 'ida-vuelta';
  advancePerGroup: number;
  wildcards: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString('es-CO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return null; }
}

function toInputDate(d: string | null | undefined) {
  if (!d) return '';
  try { return new Date(d).toISOString().slice(0, 16); }
  catch { return ''; }
}

function knockoutRoundLabel(totalRounds: number, roundIndex: number): string {
  const fromEnd = totalRounds - roundIndex;
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinal';
  if (fromEnd === 3) return 'Cuartos de final';
  if (fromEnd === 4) return 'Octavos de final';
  return `Ronda ${roundIndex + 1}`;
}

function getPreviewStats(format: FixtureFormat, n: number, cfg?: GruposConfig) {
  if (format === 'liga-ida') { const rounds = n % 2 === 0 ? n - 1 : n; return { matches: Math.floor(n / 2) * rounds, rounds }; }
  if (format === 'liga-ida-vuelta') { const r = n % 2 === 0 ? n - 1 : n; return { matches: Math.floor(n / 2) * r * 2, rounds: r * 2 }; }
  if (format === 'copa') { let size = 1; while (size < n) size *= 2; return { matches: size - 1, rounds: Math.log2(size) }; }
  if (format === 'grupos-copa' && cfg) {
    const perGroup = Math.ceil(n / cfg.numGroups);
    const r1 = perGroup % 2 === 0 ? perGroup - 1 : perGroup;
    const groupMatches = Math.floor(perGroup / 2) * r1 * cfg.numGroups * (cfg.groupFormat === 'ida-vuelta' ? 2 : 1);
    const advancing = cfg.numGroups * cfg.advancePerGroup + cfg.wildcards;
    let kSize = 1; while (kSize < advancing) kSize *= 2;
    return { matches: groupMatches + kSize - 1, rounds: r1 * (cfg.groupFormat === 'ida-vuelta' ? 2 : 1) + Math.log2(kSize) };
  }
  const r1 = n % 2 === 0 ? n - 1 : n; const m1 = Math.floor(n / 2) * r1;
  let topN = Math.min(n, 4); let kSize = 1; while (kSize < topN) kSize *= 2;
  return { matches: m1 + kSize - 1, rounds: r1 + Math.log2(kSize) };
}

const FORMATS: {
  id: FixtureFormat; Icon: ElementType;
  title: string; sub: string; desc: string; color: string; rgb: string;
}[] = [
  { id: 'grupos-copa',     Icon: LayoutGrid,     title: 'Grupos + Copa',       sub: 'Fase de grupos → llaves', desc: 'Divide los equipos en grupos. Los mejores de cada grupo pasan a eliminación directa.', color: '#f59e0b', rgb: '245,158,11' },
  { id: 'copa',            Icon: Trophy,         title: 'Eliminación directa', sub: 'Copa / Llaves',           desc: 'El que pierde queda eliminado. Llaves hasta la gran final.',                         color: '#22c55e', rgb: '34,197,94'  },
  { id: 'liga-ida',        Icon: RefreshCw,      title: 'Liga — Solo ida',     sub: 'Todos contra todos',      desc: 'Cada equipo juega una vez contra todos los demás.',                                  color: '#3b82f6', rgb: '59,130,246'  },
  { id: 'liga-ida-vuelta', Icon: ArrowLeftRight, title: 'Liga — Ida y vuelta', sub: 'Todos contra todos × 2', desc: 'Cada equipo se enfrenta dos veces: local y visitante.',                              color: '#8b5cf6', rgb: '139,92,246' },
  { id: 'liga-copa',       Icon: Layers,         title: 'Liga + Eliminación',  sub: 'Liga simple + llaves',   desc: 'Todos contra todos (sin grupos), luego eliminatoria con los mejor clasificados.',     color: '#ec4899', rgb: '236,72,153' },
];

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({ match, teamMap, onClick }: {
  match: StageMatch;
  teamMap: Record<string, Team>;
  onClick?: () => void;
}) {
  const home = teamMap[match.home_team_id ?? ''];
  const away = teamMap[match.away_team_id ?? ''];
  const hasScore = match.home_score != null && match.away_score != null;
  const pending  = match.status === 'pending' && !home && !away;
  const isDone   = match.status === 'finished';
  const canEdit  = !!(home || away) && !!onClick;
  const dateStr  = formatDate(match.date);

  return (
    <div
      onClick={() => canEdit && onClick?.()}
      style={{ borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: canEdit ? 'pointer' : 'default', overflow: 'hidden', transition: 'border-color 0.15s' }}
      onMouseEnter={e => { if (canEdit) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.13)'; }}
      onMouseLeave={e => { if (canEdit) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: home ? '#fff' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: 0.3, margin: 0, textAlign: 'right', lineHeight: 1.2 }}>
          {home?.name ?? '—'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, flexShrink: 0 }}>
          {hasScore ? (
            <span style={{ fontSize: 16, fontWeight: 900, color: isDone ? 'rgba(255,255,255,0.6)' : '#22c55e', letterSpacing: 2 }}>
              {match.home_score} — {match.away_score}
            </span>
          ) : pending ? (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: 1, textTransform: 'uppercase' }}>TBD</span>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>vs</span>
          )}
        </div>
        <p style={{ fontSize: 14, fontWeight: 800, color: away ? '#fff' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: 0.3, margin: 0, textAlign: 'left', lineHeight: 1.2 }}>
          {away?.name ?? '—'}
        </p>
      </div>
      {(dateStr || match.place || match.referee) && (
        <div style={{ display: 'flex', gap: 12, padding: '0 14px 8px', flexWrap: 'wrap' }}>
          {dateStr && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              <Calendar size={10} />{dateStr}
            </span>
          )}
          {match.place && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              <MapPin size={10} />{match.place}
            </span>
          )}
          {match.referee && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              <User size={10} />{match.referee}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── LlavesTab ────────────────────────────────────────────────────────────────

interface Props {
  tournamentId: string;
  teams: Team[];
}

export default function LlavesTab({ tournamentId, teams }: Props) {
  const [stages,    setStages]    = useState<Stage[]>([]);
  const [groups,    setGroups]    = useState<Group[]>([]);
  const [groupRows, setGroupRows] = useState<GroupRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [format,    setFormat]    = useState<FixtureFormat>('grupos-copa');
  const [gruposConfig, setGruposConfig] = useState<GruposConfig>({
    numGroups: Math.max(2, Math.ceil(teams.length / 4)),
    groupFormat: 'ida',
    advancePerGroup: 1,
    wildcards: 0,
  });
  const [generating,setGenerating]= useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const [editMatch,   setEditMatch]   = useState<StageMatch | null>(null);
  const [editDate,    setEditDate]    = useState('');
  const [editPlace,   setEditPlace]   = useState('');
  const [editReferee, setEditReferee] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [koRound,     setKoRound]     = useState<Record<string, number>>({});
  const [groupRound,  setGroupRound]  = useState<Record<string, number>>({});

  const fontStack = "'Barlow Condensed', system-ui, sans-serif";

  const loadFixture = useCallback(async () => {
    setLoading(true);
    const { data: stg } = await supabase
      .from('TORNEO_STAGE')
      .select('*')
      .eq('torneo_id', tournamentId)
      .order('stage_order');

    if (stg && stg.length > 0) {
      const stageIds = stg.map((s: any) => s.id);
      const [{ data: matchData }, { data: groupData }] = await Promise.all([
        supabase.from('MATCH').select('id,stage_id,home_team_id,away_team_id,match_round,group_id,status,home_score,away_score,date,place,referee').in('stage_id', stageIds).order('match_round'),
        supabase.from('TORNEO_GROUP').select('id, name, stage_id').in('stage_id', stageIds).order('name'),
      ]);
      const grpArr = (groupData ?? []) as Group[];
      setGroups(grpArr);
      if (grpArr.length > 0) {
        const { data: grpTeams } = await supabase
          .from('TORNEO_GROUP_TEAMS')
          .select('group_id, team_id, played, won, drawn, lost, goals_for, goals_against, points')
          .in('group_id', grpArr.map(g => g.id))
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
      const init: Record<string, number> = {};
      const initGroup: Record<string, number> = {};
      stagesWithMatches.forEach((s: Stage) => {
        if (s.type === 'knockout') init[s.id] = 1;
        if (s.type === 'group')    initGroup[s.id] = 1;
      });
      setKoRound(init);
      setGroupRound(initGroup);
    } else {
      setStages([]); setGroups([]); setGroupRows([]);
    }
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => { loadFixture(); }, [loadFixture]);

  const handleGenerate = async () => {
    if (teams.length < 2 || generating) return;
    setGenerating(true);
    setError(null);
    try {
      if (format === 'grupos-copa') {
        const GROUP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const { numGroups, groupFormat, advancePerGroup, wildcards } = gruposConfig;

        const { data: gStage, error: gse } = await supabase.from('TORNEO_STAGE').insert({
          torneo_id: tournamentId, name: 'Fase de Grupos', type: 'group', stage_order: 1, status: 'active',
        }).select().single();
        if (gse || !gStage) throw new Error('Error al crear la fase de grupos');

        const teamsPerGroup = Math.floor(teams.length / numGroups);
        const extra         = teams.length % numGroups;
        let teamIndex       = 0;

        for (let g = 0; g < numGroups; g++) {
          const size       = teamsPerGroup + (g < extra ? 1 : 0);
          const groupTeams = teams.slice(teamIndex, teamIndex + size);
          teamIndex       += size;

          const { data: group, error: gge } = await supabase.from('TORNEO_GROUP').insert({
            stage_id: gStage.id, name: `Grupo ${GROUP_LETTERS[g]}`,
          }).select().single();
          if (gge || !group) throw new Error(`Error al crear el ${GROUP_LETTERS[g]}`);

          await supabase.from('TORNEO_GROUP_TEAMS').insert(
            groupTeams.map(t => ({ group_id: group.id, team_id: t.id, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0 }))
          );

          const rounds1 = generateRoundRobin(groupTeams);
          const rounds  = groupFormat === 'ida-vuelta'
            ? [...rounds1, ...rounds1.map(r => r.map(({ home, away }) => ({ home: away, away: home })))]
            : rounds1;

          const matchRows: any[] = [];
          rounds.forEach((round, ri) => round.forEach(({ home, away }) => {
            matchRows.push({ torneo_id: tournamentId, stage_id: gStage.id, group_id: group.id, home_team_id: home.id, away_team_id: away.id, match_round: ri + 1, status: 'scheduled' });
          }));
          if (matchRows.length > 0) await supabase.from('MATCH').insert(matchRows);
        }

        const advancing = numGroups * advancePerGroup + wildcards;
        let kSize = 1; while (kSize < advancing) kSize *= 2;

        const { data: kStage, error: kse } = await supabase.from('TORNEO_STAGE').insert({
          torneo_id: tournamentId, name: 'Fase Eliminatoria', type: 'knockout', stage_order: 2, status: 'pending',
        }).select().single();
        if (kse || !kStage) throw new Error('Error al crear la fase eliminatoria');

        const koRows: any[] = [];
        let matchesInRound = kSize / 2; let roundNum = 1;
        while (matchesInRound >= 1) {
          for (let i = 0; i < matchesInRound; i++) koRows.push({ torneo_id: tournamentId, stage_id: kStage.id, home_team_id: null, away_team_id: null, match_round: roundNum, status: 'pending' });
          matchesInRound = Math.floor(matchesInRound / 2); roundNum++;
        }
        await supabase.from('MATCH').insert(koRows);

      } else if (format === 'liga-ida' || format === 'liga-ida-vuelta') {
        const rounds1 = generateRoundRobin(teams);
        const rounds = format === 'liga-ida-vuelta'
          ? [...rounds1, ...rounds1.map(r => r.map(({ home, away }) => ({ home: away, away: home })))]
          : rounds1;
        const { data: stage, error: se } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: tournamentId, name: 'Fase de Liga', type: 'group', stage_order: 1, status: 'active' }).select().single();
        if (se || !stage) throw new Error('Error al crear la fase');
        const rows: any[] = [];
        rounds.forEach((round, ri) => round.forEach(({ home, away }) => rows.push({ torneo_id: tournamentId, stage_id: stage.id, home_team_id: home.id, away_team_id: away.id, match_round: ri + 1, status: 'scheduled' })));
        await supabase.from('MATCH').insert(rows);

      } else if (format === 'copa') {
        const kRounds = generateKnockoutRounds(teams);
        const { data: stage, error: se } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: tournamentId, name: 'Copa', type: 'knockout', stage_order: 1, status: 'active' }).select().single();
        if (se || !stage) throw new Error('Error al crear la fase');
        const rows: any[] = [];
        kRounds.forEach((round, ri) => round.forEach(({ home, away }) => {
          if (ri === 0 && !home && !away) return;
          rows.push({ torneo_id: tournamentId, stage_id: stage.id, home_team_id: home?.id ?? null, away_team_id: away?.id ?? null, match_round: ri + 1, status: home && away ? 'scheduled' : 'pending' });
        }));
        await supabase.from('MATCH').insert(rows);

      } else {
        const rounds = generateRoundRobin(teams);
        const { data: gStage, error: ge } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: tournamentId, name: 'Fase de Liga', type: 'group', stage_order: 1, status: 'active' }).select().single();
        if (ge || !gStage) throw new Error('Error al crear la fase de liga');
        const groupRows2: any[] = [];
        rounds.forEach((round, ri) => round.forEach(({ home, away }) => groupRows2.push({ torneo_id: tournamentId, stage_id: gStage.id, home_team_id: home.id, away_team_id: away.id, match_round: ri + 1, status: 'scheduled' })));
        await supabase.from('MATCH').insert(groupRows2);

        let topN = Math.min(teams.length, 4); let kSize = 1; while (kSize < topN) kSize *= 2;
        const { data: kStage, error: ke } = await supabase.from('TORNEO_STAGE').insert({ torneo_id: tournamentId, name: 'Fase Eliminatoria', type: 'knockout', stage_order: 2, status: 'pending' }).select().single();
        if (ke || !kStage) throw new Error('Error al crear la fase eliminatoria');
        const koRows: any[] = [];
        let matchesInRound = kSize / 2; let roundNum = 1;
        while (matchesInRound >= 1) {
          for (let i = 0; i < matchesInRound; i++) koRows.push({ torneo_id: tournamentId, stage_id: kStage.id, home_team_id: null, away_team_id: null, match_round: roundNum, status: 'pending' });
          matchesInRound = Math.floor(matchesInRound / 2); roundNum++;
        }
        await supabase.from('MATCH').insert(koRows);
      }
      await loadFixture();
    } catch (e: any) {
      setError(e.message ?? 'Error al generar el fixture');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = async () => {
    if (resetting) return;
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

  const openEdit = (m: StageMatch) => {
    const home = teamMap[m.home_team_id ?? ''];
    const away = teamMap[m.away_team_id ?? ''];
    if (!home && !away) return;
    setEditMatch(m);
    setEditDate(toInputDate(m.date));
    setEditPlace(m.place ?? '');
    setEditReferee(m.referee ?? '');
  };

  const handleSaveMatchInfo = async () => {
    if (!editMatch) return;
    setSaving(true);
    const update: any = {
      place:   editPlace.trim() || null,
      referee: editReferee.trim() || null,
      date:    editDate ? new Date(editDate).toISOString() : null,
    };
    const { error: e } = await supabase.from('MATCH').update(update).eq('id', editMatch.id);
    if (e) setError(e.message);
    setEditMatch(null);
    await loadFixture();
    setSaving(false);
  };

  const hasFixture = stages.length > 0;
  const stats = getPreviewStats(format, teams.length, gruposConfig);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
        <style>{`@keyframes _llspin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.15)', borderTopColor: '#22c55e', animation: '_llspin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fontStack }}>
      <style>{`
        @keyframes _llspin{to{transform:rotate(360deg)}}
        .ll-rounds::-webkit-scrollbar{display:none}
        .ll-rounds{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* Error banner */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', marginBottom: 16, color: '#f87171', fontSize: 14 }}>
          <AlertTriangle size={14} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Fixture generator ── */}
      {!hasFixture && (
        teams.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(245,158,11,0.03)', borderRadius: 16, border: '1px dashed rgba(245,158,11,0.18)' }}>
            <AlertTriangle size={32} color="rgba(245,158,11,0.45)" style={{ marginBottom: 12 }} />
            <p style={{ color: '#f59e0b', fontSize: 17, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Faltan equipos confirmados</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 8 }}>Confirma al menos 2 equipos en la pestaña de Participantes</p>
          </div>
        ) : (
          <>
            {/* Equipos strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                <Users size={12} />{teams.length} equipos
              </span>
              {teams.map(t => (
                <span key={t.id} style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {t.name}
                </span>
              ))}
            </div>

            {/* Format selector */}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Selecciona el formato</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10, marginBottom: 20 }}>
              {FORMATS.map(({ id, Icon, title, sub, desc, color, rgb }) => {
                const sel = format === id;
                return (
                  <button key={id} onClick={() => setFormat(id)} style={{ textAlign: 'left', padding: '16px 14px', borderRadius: 14, cursor: 'pointer', background: sel ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.03)', border: `1.5px solid ${sel ? color : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.2s', boxShadow: sel ? `0 0 20px rgba(${rgb},0.15)` : 'none', fontFamily: fontStack }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: sel ? `rgba(${rgb},0.15)` : 'rgba(255,255,255,0.06)', border: `1px solid ${sel ? `rgba(${rgb},0.35)` : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <Icon size={16} color={sel ? color : 'rgba(255,255,255,0.35)'} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4, color: sel ? '#fff' : 'rgba(255,255,255,0.6)', margin: 0 }}>{title}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: sel ? color : 'rgba(255,255,255,0.22)', margin: '3px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{sub}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                  </button>
                );
              })}
            </div>

            {/* ── Grupos config panel ── */}
            {format === 'grupos-copa' && (() => {
              const perGroup  = Math.ceil(teams.length / gruposConfig.numGroups);
              const advancing = gruposConfig.numGroups * gruposConfig.advancePerGroup + gruposConfig.wildcards;
              let kSize = 1; while (kSize < advancing) kSize *= 2;
              const kLabel    = kSize === 2 ? 'Final' : kSize === 4 ? 'Semifinales' : kSize === 8 ? 'Cuartos de final' : kSize === 16 ? 'Octavos de final' : `Ronda de ${kSize}`;
              const rowSt: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' };
              const lblSt: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', margin: 0 };
              const opt = (active: boolean): React.CSSProperties => ({ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: fontStack, border: `1px solid ${active ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: active ? '#f59e0b' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' });
              return (
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }}>Configuración de grupos</p>

                  {/* Number of groups */}
                  <div style={rowSt}>
                    <div>
                      <p style={{ ...lblSt, marginBottom: 4 }}>Número de grupos</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                        {teams.length} equipos → {gruposConfig.numGroups} grupos de ~{perGroup}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <button onClick={() => setGruposConfig(p => ({ ...p, numGroups: Math.max(2, p.numGroups - 1) }))} disabled={gruposConfig.numGroups <= 2}
                        style={{ width: 32, height: 32, borderRadius: 8, cursor: gruposConfig.numGroups <= 2 ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: gruposConfig.numGroups <= 2 ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', minWidth: 28, textAlign: 'center', fontFamily: fontStack }}>{gruposConfig.numGroups}</span>
                      <button onClick={() => setGruposConfig(p => ({ ...p, numGroups: Math.min(Math.floor(teams.length / 2), p.numGroups + 1) }))} disabled={gruposConfig.numGroups >= Math.floor(teams.length / 2)}
                        style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  {/* Group format */}
                  <div style={rowSt}>
                    <p style={lblSt}>Formato de grupo</p>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setGruposConfig(p => ({ ...p, groupFormat: 'ida' }))} style={opt(gruposConfig.groupFormat === 'ida')}>Solo ida</button>
                      <button onClick={() => setGruposConfig(p => ({ ...p, groupFormat: 'ida-vuelta' }))} style={opt(gruposConfig.groupFormat === 'ida-vuelta')}>Ida y vuelta</button>
                    </div>
                  </div>

                  {/* Advance per group */}
                  <div style={rowSt}>
                    <p style={lblSt}>Equipos que avanzan por grupo</p>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => setGruposConfig(p => ({ ...p, advancePerGroup: n }))} style={opt(gruposConfig.advancePerGroup === n)}>{n}</button>
                      ))}
                    </div>
                  </div>

                  {/* Wildcards */}
                  <div style={rowSt}>
                    <div>
                      <p style={{ ...lblSt, marginBottom: 4 }}>Comodines (mejores segundos)</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Equipos extra que completan el bracket</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[0, 1, 2, 3].map(n => (
                        <button key={n} onClick={() => setGruposConfig(p => ({ ...p, wildcards: n }))} style={opt(gruposConfig.wildcards === n)}>{n}</button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ borderTop: '1px solid rgba(245,158,11,0.15)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: fontStack }}>
                      {gruposConfig.numGroups}g × {gruposConfig.advancePerGroup} + {gruposConfig.wildcards} comodin{gruposConfig.wildcards !== 1 ? 'es' : ''} = <strong style={{ color: '#f59e0b' }}>{advancing}</strong> al bracket
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b', fontFamily: fontStack }}>→ {kLabel}</span>
                  </div>
                </div>
              );
            })()}

            {/* Preview stats */}
            <div style={{ display: 'flex', gap: 20, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20, flexWrap: 'wrap' }}>
              {[{ label: 'Partidos', value: stats.matches }, { label: 'Jornadas / Rondas', value: stats.rounds }, { label: 'Equipos', value: teams.length }].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 3px' }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: label === 'Partidos' ? '#22c55e' : '#fff', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            <button onClick={handleGenerate} disabled={generating} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 26px', borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 20px rgba(22,163,74,0.3)', opacity: generating ? 0.7 : 1, fontFamily: fontStack }}>
              {generating
                ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: '_llspin 0.8s linear infinite', flexShrink: 0 }} />
                : <CalendarRange size={16} />}
              {generating ? 'Generando...' : 'Generar Fixture'}
            </button>
          </>
        )
      )}

      {/* ── Fixture viewer ── */}
      {hasFixture && (
        <>
          {/* Reset button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setShowResetConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', color: '#f87171', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: fontStack }}>
              <RefreshCw size={13} /> Regenerar fixture
            </button>
          </div>

          {stages.map(stage => {
            const isKnockout  = stage.type === 'knockout';
            const stageGroups = groups.filter(g => g.stage_id === stage.id);
            const hasGroups   = stageGroups.length > 0;
            const visibleMatches = stage.matches.filter(m => m.home_team_id || m.away_team_id);

            return (
              <div key={stage.id} style={{ marginBottom: 40 }}>
                {/* Stage header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${isKnockout ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)'}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isKnockout ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${isKnockout ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isKnockout ? <Trophy size={16} color="#f59e0b" /> : <RefreshCw size={16} color="#22c55e" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{stage.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '2px 0 0', letterSpacing: 1 }}>{stage.matches.length} partidos</p>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: stage.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${stage.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`, color: stage.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {stage.status === 'active' ? 'Activa' : stage.status === 'pending' ? 'Pendiente' : stage.status}
                  </span>
                </div>

                {/* Group stage with groups — two-column layout */}
                {!isKnockout && hasGroups && (() => {
                  // All unique rounds across every group in this stage
                  const allRounds = [...new Set(
                    visibleMatches.filter(m => m.group_id != null).map(m => m.match_round)
                  )].sort((a, b) => a - b);
                  const activeRound = groupRound[stage.id] ?? allRounds[0] ?? 1;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

                      {/* LEFT — Group standings */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {stageGroups.map(group => {
                          const gStandings = groupRows.filter(r => r.group_id === group.id).sort((a, b) => {
                            if (b.points !== a.points) return b.points - a.points;
                            return (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against);
                          });
                          return (
                            <div key={group.id}>
                              <p style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 8px' }}>{group.name}</p>
                              <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr 26px 24px 24px 24px 26px 26px 30px', gap: 0, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                  {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'Pts'].map((h, i) => (
                                    <span key={h} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, textAlign: i > 1 ? 'center' : 'left' }}>{h}</span>
                                  ))}
                                </div>
                                {gStandings.length === 0 ? (
                                  <div style={{ padding: '10px 10px', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Sin equipos</div>
                                ) : gStandings.map((row, idx) => (
                                  <div key={row.team_id ?? idx} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 26px 24px 24px 24px 26px 26px 30px', gap: 0, padding: '7px 10px', background: idx === 0 ? 'rgba(34,197,94,0.05)' : 'transparent', borderBottom: idx < gStandings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: idx === 0 ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>{idx + 1}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamMap[row.team_id ?? '']?.name ?? '—'}</span>
                                    {[row.played, row.won, row.drawn, row.lost, row.goals_for, row.goals_against].map((v, vi) => (
                                      <span key={vi} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontWeight: 600 }}>{v}</span>
                                    ))}
                                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '1px 0' }}>{row.points}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* RIGHT — Round selector + matches */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Round selector chips */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 }}>Jornada</span>
                          <div className="ll-rounds" style={{ display: 'flex', gap: 5, overflowX: 'auto', flex: 1 }}>
                            {allRounds.map(r => {
                              const active = activeRound === r;
                              return (
                                <button key={r} onClick={() => setGroupRound(prev => ({ ...prev, [stage.id]: r }))}
                                  style={{ flexShrink: 0, padding: '5px 14px', borderRadius: 99, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: fontStack, background: active ? '#22c55e' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? '#22c55e' : 'rgba(255,255,255,0.08)'}`, color: active ? '#000' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}>
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Matches for selected round, grouped by group */}
                        {stageGroups.map(group => {
                          const grpRoundMatches = visibleMatches.filter(m => m.group_id === group.id && m.match_round === activeRound);
                          if (grpRoundMatches.length === 0) return null;
                          return (
                            <div key={group.id}>
                              <p style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 6px' }}>{group.name}</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {grpRoundMatches.map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} onClick={() => openEdit(m)} />)}
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty state */}
                        {stageGroups.every(g => visibleMatches.filter(m => m.group_id === g.id && m.match_round === activeRound).length === 0) && (
                          <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.06)' }}>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>Sin partidos en esta jornada</p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()}

                {/* Group stage without groups */}
                {!isKnockout && !hasGroups && (() => {
                  const byRound = visibleMatches.reduce<Record<number, StageMatch[]>>((acc, m) => {
                    (acc[m.match_round] = acc[m.match_round] || []).push(m);
                    return acc;
                  }, {});
                  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {rounds.map(round => (
                        <div key={round}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 2, textTransform: 'uppercase' }}>Jornada {round}</span>
                            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>{byRound[round].length} {byRound[round].length === 1 ? 'partido' : 'partidos'}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {byRound[round].map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} onClick={() => openEdit(m)} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Knockout stage */}
                {isKnockout && (() => {
                  // Derive bracket size from round-1 match count (accurate for grupos-copa where
                  // knockout teams < total confirmed teams)
                  const round1Count = stage.matches.filter(m => m.match_round === 1).length;
                  let bracketSize = 1;
                  if (round1Count > 0) {
                    while (bracketSize < round1Count * 2) bracketSize *= 2;
                  } else {
                    while (bracketSize < teams.length) bracketSize *= 2;
                  }
                  const totalExpectedRounds = Math.max(1, Math.log2(bracketSize));
                  const expectedRounds = Array.from({ length: totalExpectedRounds }, (_, i) => i + 1);
                  const existingRoundSet = new Set(stage.matches.map(m => m.match_round));
                  const activeRound  = koRound[stage.id] ?? 1;
                  const activeMatches = stage.matches.filter(m => m.match_round === activeRound);

                  return (
                    <>
                      <div className="ll-rounds" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 18, paddingBottom: 2 }}>
                        {expectedRounds.map((r, ri) => {
                          const label     = knockoutRoundLabel(totalExpectedRounds, ri);
                          const active    = activeRound === r;
                          const hasM      = existingRoundSet.has(r);
                          const rMatches  = stage.matches.filter(m => m.match_round === r);
                          const allDone   = rMatches.length > 0 && rMatches.every(m => m.status === 'finished');
                          return (
                            <button key={r} onClick={() => hasM && setKoRound(prev => ({ ...prev, [stage.id]: r }))} style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 99, cursor: hasM ? 'pointer' : 'default', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fontStack, transition: 'all 0.15s', background: active ? '#f59e0b' : hasM ? 'rgba(255,255,255,0.05)' : 'transparent', border: `1px solid ${active ? '#f59e0b' : hasM ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, color: active ? '#000' : allDone ? 'rgba(255,255,255,0.3)' : hasM ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', opacity: hasM ? 1 : 0.5 }}>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeMatches.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>Los equipos se definirán cuando avancen de ronda anterior</p>
                          </div>
                        ) : (
                          activeMatches.map(m => <MatchCard key={m.id} match={m} teamMap={teamMap} onClick={() => openEdit(m)} />)
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            );
          })}
        </>
      )}

      {/* ── Reset confirm modal ── */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowResetConfirm(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0d1117', borderRadius: 20, padding: '26px 22px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360, width: '100%', zIndex: 1, fontFamily: fontStack }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <AlertTriangle size={20} color="#f87171" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>¿Regenerar fixture?</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 22px' }}>Se eliminarán todos los partidos y etapas. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack }}>Cancelar</button>
              <button onClick={handleReset} disabled={resetting} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', cursor: resetting ? 'not-allowed' : 'pointer', color: '#f87171', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', opacity: resetting ? 0.7 : 1, fontFamily: fontStack }}>
                {resetting ? 'Eliminando...' : 'Regenerar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Match info edit modal ── */}
      {editMatch && (() => {
        const home = teamMap[editMatch.home_team_id ?? ''];
        const away = teamMap[editMatch.away_team_id ?? ''];
        const inputStyle: React.CSSProperties = {
          width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', fontSize: 14, boxSizing: 'border-box',
        };
        const labelStyle: React.CSSProperties = {
          fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 6, display: 'block',
        };
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditMatch(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
            <div style={{ position: 'relative', background: '#0d1117', borderRadius: 20, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 400, width: '100%', zIndex: 1, fontFamily: fontStack }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0, lineHeight: 1.2 }}>
                  {home?.name ?? '—'} <span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span> {away?.name ?? '—'}
                </p>
                <button onClick={() => setEditMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4 }}><X size={16} /></button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Fecha y hora</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={12} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, colorScheme: 'dark' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Lugar / Cancha</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={12} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type="text" value={editPlace} onChange={e => setEditPlace(e.target.value)} placeholder="Estadio, cancha..." style={{ ...inputStyle, paddingLeft: 32 }} />
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Árbitro</label>
                <div style={{ position: 'relative' }}>
                  <User size={12} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type="text" value={editReferee} onChange={e => setEditReferee(e.target.value)} placeholder="Nombre del árbitro" style={{ ...inputStyle, paddingLeft: 32 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditMatch(null)} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack }}>Cancelar</button>
                <button onClick={handleSaveMatchInfo} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: '_llspin 0.8s linear infinite' }} />}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
