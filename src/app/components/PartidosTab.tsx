import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Calendar, MapPin, User,
  Trophy, RefreshCw, X, AlertTriangle, Pencil,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team  { id: string; name: string; }
interface Stage { id: string; name: string; type: string; stage_order: number; }
interface Match {
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

// ─── PartidosTab ──────────────────────────────────────────────────────────────

interface Props {
  tournamentId: string;
  teamCount: number;
}

export default function PartidosTab({ tournamentId, teamCount }: Props) {
  const [stages,  setStages]  = useState<Stage[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams,   setTeams]   = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<number | null>(null);

  const [editMatch,  setEditMatch]  = useState<Match | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editHome,   setEditHome]   = useState('');
  const [editAway,   setEditAway]   = useState('');
  const [saving,     setSaving]     = useState(false);

  const fontStack = "'Barlow Condensed', system-ui, sans-serif";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: stgData } = await supabase
      .from('TORNEO_STAGE').select('id, name, type, stage_order')
      .eq('torneo_id', tournamentId).order('stage_order');
    const stgArr = (stgData ?? []) as Stage[];
    setStages(stgArr);

    if (!stgArr.length) { setMatches([]); setTeams([]); setLoading(false); return; }

    const stageIds = stgArr.map(s => s.id);
    const { data: mData } = await supabase
      .from('MATCH').select('id,stage_id,home_team_id,away_team_id,home_score,away_score,date,place,referee,status,match_round')
      .in('stage_id', stageIds).order('match_round');
    const mArr = (mData ?? []) as Match[];
    setMatches(mArr);

    const teamIds = new Set<string>();
    mArr.forEach(m => {
      if (m.home_team_id) teamIds.add(m.home_team_id);
      if (m.away_team_id) teamIds.add(m.away_team_id);
    });
    if (teamIds.size > 0) {
      const { data: tData } = await supabase.from('TEAM').select('id, name').in('id', [...teamIds]);
      setTeams((tData ?? []) as Team[]);
    }

    setActiveStage(stgArr[0]?.id ?? null);
    setActiveRound(1);
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!activeStage) return;
    setActiveRound(1);
  }, [activeStage]);

  const openEdit = (m: Match) => {
    setEditMatch(m);
    setEditStatus(m.status ?? 'scheduled');
    setEditHome(m.home_score?.toString() ?? '');
    setEditAway(m.away_score?.toString() ?? '');
  };

  const handleSave = async () => {
    if (!editMatch) return;
    setSaving(true);
    const update: any = { status: editStatus };
    if (editStatus === 'finished' || editStatus === 'live') {
      const hs  = parseInt(editHome, 10);
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
    await load();
    setSaving(false);
  };

  const teamMap      = Object.fromEntries(teams.map(t => [t.id, t]));
  const currentStage = stages.find(s => s.id === activeStage);
  const isKnockout   = currentStage?.type === 'knockout';

  const allStageMatches = matches.filter(m => m.stage_id === activeStage);
  const stageMatches    = allStageMatches.filter(m => m.home_team_id || m.away_team_id);
  const existingRoundSet = new Set(allStageMatches.map(m => m.match_round));

  let chipsRounds: number[];
  let totalChipRounds: number;

  if (isKnockout) {
    const round1Count = allStageMatches.filter(m => m.match_round === 1).length;
    let bracketSize = 1;
    if (round1Count > 0) {
      while (bracketSize < round1Count * 2) bracketSize *= 2;
    } else {
      while (bracketSize < teamCount) bracketSize *= 2;
    }
    totalChipRounds = Math.max(1, Math.log2(bracketSize));
    chipsRounds = Array.from({ length: totalChipRounds }, (_, i) => i + 1);
  } else {
    chipsRounds = [...new Set(stageMatches.map(m => m.match_round).filter(r => r != null))]
      .sort((a, b) => (a ?? 0) - (b ?? 0)) as number[];
    totalChipRounds = chipsRounds.length;
  }

  const roundMatches = isKnockout
    ? allStageMatches.filter(m => m.match_round === activeRound)
    : stageMatches.filter(m => m.match_round === activeRound);

  const showScore = editStatus === 'finished' || editStatus === 'live';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 14, boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 6, display: 'block',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
        <style>{`@keyframes _pspin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.15)', borderTopColor: '#22c55e', animation: '_pspin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fontStack }}>
      <style>{`
        @keyframes _pspin{to{transform:rotate(360deg)}}
        @keyframes _ppulse{0%,100%{opacity:1}50%{opacity:0.4}}
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        .pt-rounds::-webkit-scrollbar{display:none}
        .pt-rounds{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* Error banner */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
          <AlertTriangle size={13} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}><X size={13} /></button>
        </div>
      )}

      {/* No fixture */}
      {stages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
          <ClipboardList size={32} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Sin fixture generado</p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 6 }}>
            Genera el fixture desde la pestaña de Llaves
          </p>
        </div>
      )}

      {stages.length > 0 && (
        <>
          {/* Stage tabs */}
          {stages.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {stages.map(s => {
                const active = activeStage === s.id;
                const isKO   = s.type === 'knockout';
                return (
                  <button key={s.id} onClick={() => setActiveStage(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 11, cursor: 'pointer', background: active ? (isKO ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)') : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? (isKO ? 'rgba(245,158,11,0.28)' : 'rgba(34,197,94,0.25)') : 'rgba(255,255,255,0.07)'}`, color: active ? (isKO ? '#f59e0b' : '#22c55e') : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fontStack, transition: 'all 0.15s' }}>
                    {isKO ? <Trophy size={12} /> : <RefreshCw size={12} />}
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Round chips */}
          {chipsRounds.length > 0 && (
            <div className="pt-rounds" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
              {chipsRounds.map((r, ri) => {
                const label     = isKnockout ? knockoutLabel(totalChipRounds, ri) : `J${r}`;
                const active    = activeRound === r;
                const hasM      = existingRoundSet.has(r);
                const roundMs   = allStageMatches.filter(m => m.match_round === r);
                const hasLive   = roundMs.some(m => m.status === 'live');
                const allDone   = roundMs.length > 0 && roundMs.every(m => m.status === 'finished');
                return (
                  <button key={r} onClick={() => hasM && setActiveRound(r)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 99, cursor: hasM ? 'pointer' : 'default', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fontStack, transition: 'all 0.15s', position: 'relative', background: active ? '#22c55e' : hasM && hasLive ? 'rgba(34,197,94,0.1)' : hasM ? 'rgba(255,255,255,0.05)' : 'transparent', border: `1px solid ${active ? '#22c55e' : hasM && hasLive ? 'rgba(34,197,94,0.3)' : hasM ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, color: active ? '#000' : allDone ? 'rgba(255,255,255,0.3)' : hasM && hasLive ? '#22c55e' : hasM ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', opacity: hasM ? 1 : 0.5 }}>
                    {hasLive && !active && (
                      <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: '_ppulse 1.4s ease-in-out infinite', display: 'inline-block' }} />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* No matches in round */}
          {roundMatches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>
                {isKnockout && activeRound != null && !existingRoundSet.has(activeRound)
                  ? 'Los equipos se definirán cuando avancen de ronda anterior'
                  : 'Sin partidos en esta ronda'}
              </p>
            </div>
          )}

          {/* Match cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roundMatches.map(match => {
              const home    = teamMap[match.home_team_id ?? ''];
              const away    = teamMap[match.away_team_id ?? ''];
              const cfg     = STATUS_CFG[match.status ?? ''] ?? STATUS_CFG.pending;
              const isLive  = match.status === 'live';
              const isDone  = match.status === 'finished';
              const hasScore = match.home_score != null && match.away_score != null;
              const canEdit  = !!home || !!away;
              const dateStr  = formatDate(match.date);

              return (
                <div
                  key={match.id}
                  onClick={() => canEdit && openEdit(match)}
                  style={{ borderRadius: 14, background: isLive ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isLive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`, cursor: canEdit ? 'pointer' : 'default', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (canEdit) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isLive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.13)'; el.style.background = isLive ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)'; } }}
                  onMouseLeave={e => { if (canEdit) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isLive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'; el.style.background = isLive ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.025)'; } }}
                >
                  {/* Teams + score */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '14px 16px 10px' }}>
                    <p style={{ fontSize: 16, fontWeight: 900, color: home ? '#fff' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.4, margin: 0, textAlign: 'right', lineHeight: 1.2 }}>
                      {home?.name ?? '—'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 68 }}>
                      {hasScore ? (
                        <span style={{ fontSize: 19, fontWeight: 900, color: isDone ? 'rgba(255,255,255,0.65)' : '#22c55e', letterSpacing: 3 }}>
                          {match.home_score} — {match.away_score}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
                          <Pencil size={10} /> resultado
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 900, color: away ? '#fff' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 0.4, margin: 0, textAlign: 'left', lineHeight: 1.2 }}>
                      {away?.name ?? '—'}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {dateStr && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
                          <Calendar size={10} />{dateStr}
                        </span>
                      )}
                      {match.place && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
                          <MapPin size={10} />{match.place}
                        </span>
                      )}
                      {match.referee && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
                          <User size={10} />{match.referee}
                        </span>
                      )}
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0 }}>
                      {isLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: '_ppulse 1.4s ease-in-out infinite', display: 'inline-block' }} />}
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Edit modal ── */}
      {editMatch && (() => {
        const home = teamMap[editMatch.home_team_id ?? ''];
        const away = teamMap[editMatch.away_team_id ?? ''];
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditMatch(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
            <div style={{ position: 'relative', background: '#0d1117', borderRadius: 20, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 440, width: '100%', zIndex: 1, fontFamily: fontStack, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0, lineHeight: 1.2 }}>
                  {home?.name ?? '—'} <span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span> {away?.name ?? '—'}
                </p>
                <button onClick={() => setEditMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4 }}><X size={17} /></button>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 16 }}>
                <span style={labelStyle}>Estado</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {(['scheduled', 'live', 'finished', 'pending'] as const).map(s => {
                    const cfg = STATUS_CFG[s];
                    const sel = editStatus === s;
                    return (
                      <button key={s} onClick={() => setEditStatus(s)} style={{ padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fontStack, border: `1px solid ${sel ? cfg.border : 'rgba(255,255,255,0.07)'}`, background: sel ? cfg.bg : 'transparent', color: sel ? cfg.color : 'rgba(255,255,255,0.3)', transition: 'all 0.15s' }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score */}
              {showScore && (
                <div style={{ marginBottom: 16 }}>
                  <span style={labelStyle}>Resultado</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home?.name ?? 'Local'}</p>
                      <input type="number" min={0} value={editHome} onChange={e => setEditHome(e.target.value)} placeholder="0" style={{ ...inputStyle, textAlign: 'center', fontSize: 28, fontWeight: 900, padding: '8px', fontFamily: fontStack }} />
                    </div>
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 900, paddingTop: 24 }}>—</span>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away?.name ?? 'Visita'}</p>
                      <input type="number" min={0} value={editAway} onChange={e => setEditAway(e.target.value)} placeholder="0" style={{ ...inputStyle, textAlign: 'center', fontSize: 28, fontWeight: 900, padding: '8px', fontFamily: fontStack }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditMatch(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', fontFamily: fontStack, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: '_pspin 0.8s linear infinite' }} />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
