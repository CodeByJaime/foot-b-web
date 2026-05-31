import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Users, Search, Trophy, X, Shield, UserPlus, Trash2, ChevronUp, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: string;
  name: string | null;
  code: string | null;
  logo: string | null;
  shield_url: string | null;
  gender: string | null;
  founded: string | null;
  ubication_id: string | null;
  is_artificial: boolean;
}

interface Torneo {
  id: string;
  name: string;
}

interface GuestPlayer {
  id: string;
  name: string;
  lastname: string | null;
  dominant_leg: string | null;
  gender: string | null;
  birth_year: number | null;
  is_active: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_COLORS = [
  ['#1e1b4b', '#4338ca'],
  ['#164e63', '#0e7490'],
  ['#14532d', '#15803d'],
  ['#7c2d12', '#c2410c'],
  ['#4a044e', '#a21caf'],
  ['#1e3a5f', '#2563eb'],
];

const GENDER_LABEL: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  mixed: 'Mixto',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Teams() {
  const { user } = useAuth();

  const [profileId, setProfileId]     = useState<string | null>(null);
  const [ubicationId, setUbicationId] = useState<string | null>(null);

  const [myTeams, setMyTeams]         = useState<Team[]>([]);
  const [regionTeams, setRegionTeams] = useState<Team[]>([]);
  const [myTorneos, setMyTorneos]     = useState<Torneo[]>([]);
  const [loading, setLoading]         = useState(true);

  const [tab, setTab]       = useState<'mine' | 'region'>('mine');
  const [search, setSearch] = useState('');

  // ── Create modal ──
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [teamName, setTeamName]     = useState('');
  const [teamGender, setTeamGender] = useState<string>('mixed');

  // ── Add to torneo modal ──
  const [addTarget, setAddTarget]               = useState<Team | null>(null);
  const [selectedTorneoId, setSelectedTorneoId] = useState<string>('');
  const [adding, setAdding]                     = useState(false);
  const [enrolledTorneos, setEnrolledTorneos]   = useState<string[]>([]);
  const [removingTorneoId, setRemovingTorneoId] = useState<string | null>(null);

  // ── Bulk enroll modal ──
  const [showBulk, setShowBulk]             = useState(false);
  const [bulkTorneoId, setBulkTorneoId]     = useState('');
  const [bulkSelected, setBulkSelected]     = useState<Set<string>>(new Set());
  const [bulkEnrolled, setBulkEnrolled]     = useState<Set<string>>(new Set());
  const [bulkEnrolling, setBulkEnrolling]   = useState(false);
  const [loadingBulkStatus, setLoadingBulkStatus] = useState(false);

  // ── Logo upload ──
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget]     = useState<Team | null>(null);
  const [uploading, setUploading]           = useState(false);

  // ── Guest players modal ──
  const [playerTarget, setPlayerTarget]     = useState<Team | null>(null);
  const [guestPlayers, setGuestPlayers]     = useState<GuestPlayer[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [addingPlayer, setAddingPlayer]     = useState(false);
  const [playerForm, setPlayerForm] = useState({
    name: '', lastname: '', dominant_leg: '', gender: '', birth_year: '',
  });

  // 1. Fetch profile
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('PROFILE')
      .select('id, ubication_id')
      .eq('auth_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.id)           setProfileId(data.id);
        if (data?.ubication_id) setUbicationId(data.ubication_id);
      });
  }, [user?.id]);

  // 2. Fetch teams + tournaments
  useEffect(() => {
    if (!profileId || !ubicationId) return;
    const run = async () => {
      setLoading(true);
      try {
        // Artificial teams I own (captain in PROFILE_TEAM + is_artificial)
        const { data: pt } = await supabase
          .from('PROFILE_TEAM')
          .select('TEAM(*)')
          .eq('profile_id', profileId)
          .eq('team_role', 'captain');

        setMyTeams(
          (pt ?? []).map((r: any) => r.TEAM).filter((t: any) => t?.is_artificial === true) as Team[]
        );

        // Real teams in same ubication
        const { data: reg } = await supabase
          .from('TEAM')
          .select('*')
          .eq('ubication_id', ubicationId)
          .eq('is_artificial', false);
        setRegionTeams((reg ?? []) as Team[]);

        // My tournaments (for adding teams)
        const { data: adm } = await supabase
          .from('TORNEO_ADMINS')
          .select('TORNEO(id, name)')
          .eq('profile_id', profileId);
        setMyTorneos((adm ?? []).map((a: any) => a.TORNEO).filter(Boolean) as Torneo[]);

      } finally {
        setLoading(false);
      }
    };
    run();
  }, [profileId, ubicationId]);

  // 3. Load guest players when a team is selected
  useEffect(() => {
    if (!playerTarget) { setGuestPlayers([]); return; }
    setLoadingPlayers(true);
    supabase
      .from('GUEST_PLAYER')
      .select('*')
      .eq('team_id', playerTarget.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setGuestPlayers((data ?? []) as GuestPlayer[]);
        setLoadingPlayers(false);
      });
  }, [playerTarget]);

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!playerTarget || !profileId || !playerForm.name.trim()) return;
    setAddingPlayer(true);
    try {
      const { data: player, error } = await supabase
        .from('GUEST_PLAYER')
        .insert([{
          team_id:      playerTarget.id,
          added_by:     profileId,
          name:         playerForm.name.trim(),
          lastname:     playerForm.lastname.trim() || null,
          dominant_leg: playerForm.dominant_leg || null,
          gender:       playerForm.gender || null,
          birth_year:   playerForm.birth_year ? Number(playerForm.birth_year) : null,
        }])
        .select()
        .single();
      if (error) throw error;
      toast.success(`${playerForm.name} añadido al equipo`);
      setGuestPlayers(prev => [...prev, player as GuestPlayer]);
      setPlayerForm({ name: '', lastname: '', dominant_leg: '', gender: '', birth_year: '' });
      setShowPlayerForm(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Error al añadir jugador');
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const { error } = await supabase
      .from('GUEST_PLAYER')
      .update({ is_active: false })
      .eq('id', playerId);
    if (!error) setGuestPlayers(prev => prev.filter(p => p.id !== playerId));
    else toast.error('Error al eliminar jugador');
  };

  const openPlayersModal = (team: Team) => {
    setPlayerTarget(team);
    setShowPlayerForm(false);
    setPlayerForm({ name: '', lastname: '', dominant_leg: '', gender: '', birth_year: '' });
  };

  useEffect(() => {
    if (!bulkTorneoId || !showBulk) return;
    setLoadingBulkStatus(true);
    supabase.from('TORNEO_TEAMS').select('team_id').eq('torneo_id', bulkTorneoId)
      .then(({ data }) => {
        const enrolled = new Set((data ?? []).map((r: any) => r.team_id as string));
        setBulkEnrolled(enrolled);
        setBulkSelected(new Set(myTeams.filter(t => !enrolled.has(t.id)).map(t => t.id)));
        setLoadingBulkStatus(false);
      });
  }, [bulkTorneoId, showBulk, myTeams]);

  const openBulkModal = () => {
    setBulkTorneoId('');
    setBulkSelected(new Set());
    setBulkEnrolled(new Set());
    setShowBulk(true);
  };

  const handleBulkEnroll = async () => {
    if (!bulkTorneoId || bulkSelected.size === 0 || bulkEnrolling) return;
    setBulkEnrolling(true);
    try {
      const rows = [...bulkSelected].map(teamId => ({
        team_id: teamId,
        torneo_id: bulkTorneoId,
        status: 'confirmed',
      }));
      const { error } = await supabase.from('TORNEO_TEAMS').insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} equipo${rows.length !== 1 ? 's' : ''} inscritos`);
      setBulkEnrolled(prev => new Set([...prev, ...bulkSelected]));
      setBulkSelected(new Set());
    } catch (err: any) {
      toast.error(err.message ?? 'Error al inscribir equipos');
    } finally {
      setBulkEnrolling(false);
    }
  };

  const handleLogoClick = (team: Team) => {
    setUploadTarget(team);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    setUploading(true);
    try {
      // Remove existing files for this team
      const { data: existing } = await supabase.storage.from('crests').list(uploadTarget.id);
      if (existing && existing.length > 0) {
        await supabase.storage.from('crests').remove(existing.map(f => `${uploadTarget.id}/${f.name}`));
      }

      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${uploadTarget.id}/shield_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('crests')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('crests').getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('TEAM').update({ shield_url: publicUrl }).eq('id', uploadTarget.id);
      if (updateError) throw updateError;

      setMyTeams(prev => prev.map(t => t.id === uploadTarget.id ? { ...t, shield_url: publicUrl } : t));
      toast.success('Logo actualizado');
    } catch (err: any) {
      toast.error(err.message ?? 'Error al subir el logo');
    } finally {
      setUploading(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profileId || !ubicationId || !teamName.trim()) return;
    setCreating(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: team, error } = await supabase
        .from('TEAM')
        .insert([{
          name: teamName.trim(),
          ubication_id: ubicationId,
          gender: teamGender,
          code,
          founded: new Date().toISOString(),
          is_artificial: true,
        }])
        .select()
        .single();
      if (error) throw error;

      await supabase.from('PROFILE_TEAM').insert([{
        team_id: team.id,
        profile_id: profileId,
        team_role: 'captain',
        status: true,
      }]);

      toast.success(`Equipo "${teamName}" creado`);
      setMyTeams(prev => [team as Team, ...prev]);
      setShowCreate(false);
      setTeamName('');
    } catch (err: any) {
      toast.error(err.message ?? 'Error al crear el equipo');
    } finally {
      setCreating(false);
    }
  };

  const handleAddToTorneo = async () => {
    if (!addTarget || !selectedTorneoId) return;
    setAdding(true);
    try {
      if (addTarget.is_artificial) {
        // Direct insert — we fully control artificial teams
        const { error } = await supabase.from('TORNEO_TEAMS').insert([{
          team_id: addTarget.id,
          torneo_id: selectedTorneoId,
          status: 'confirmed',
        }]);
        if (error) throw error;
      } else {
        // Use RPC for real teams (validates by code, respects team logic)
        const { error } = await supabase.rpc('register_team_to_tournament', {
          p_torneo_id: selectedTorneoId,
          p_code_team: addTarget.code,
        });
        if (error) throw error;
      }
      toast.success(`${addTarget.name} añadido al torneo`);
      setEnrolledTorneos(prev => [...prev, selectedTorneoId]);
      setSelectedTorneoId('');
    } catch (err: any) {
      toast.error(err.message ?? 'Error al añadir al torneo');
    } finally {
      setAdding(false);
    }
  };

  const openAddModal = (team: Team) => {
    setAddTarget(team);
    setSelectedTorneoId('');
    setEnrolledTorneos([]);
    supabase
      .from('TORNEO_TEAMS')
      .select('torneo_id')
      .eq('team_id', team.id)
      .then(({ data }) => setEnrolledTorneos((data ?? []).map((r: any) => r.torneo_id)));
  };

  const handleRemoveFromTorneo = async (torneoId: string) => {
    if (!addTarget) return;
    setRemovingTorneoId(torneoId);
    const { error } = await supabase
      .from('TORNEO_TEAMS')
      .delete()
      .eq('team_id', addTarget.id)
      .eq('torneo_id', torneoId);
    if (!error) {
      setEnrolledTorneos(prev => prev.filter(id => id !== torneoId));
      toast.success('Equipo eliminado del torneo');
    } else {
      toast.error('Error al eliminar del torneo');
    }
    setRemovingTorneoId(null);
  };

  const list = (tab === 'mine' ? myTeams : regionTeams)
    .filter(t => (t.name ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`
          @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
          @keyframes fadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
          @keyframes spin   { to{transform:rotate(360deg)} }
          .t-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .t-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.4) !important; }
          .logo-wrap:hover .logo-overlay { opacity: 1 !important; }
        `}</style>

        {/* Hidden file input for logo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* ─── HEADER ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Gestión</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>Equipos</h1>
          </div>
          {tab === 'mine' && (
            <div style={{ display: 'flex', gap: 8 }}>
              {myTeams.length > 0 && myTorneos.length > 0 && (
                <button
                  onClick={openBulkModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(139,92,246,0.35)', cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  <Trophy size={15} /> Inscribir al torneo
                </button>
              )}
              <button
                onClick={() => setShowCreate(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Plus size={16} /> Crear equipo
              </button>
            </div>
          )}
        </div>

        {/* ─── TABS ───────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
          {([
            { key: 'mine',   label: 'Mis equipos', count: myTeams.length },
            { key: 'region', label: 'Región',       count: regionTeams.length },
          ] as const).map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '9px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif",
                background: active ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent',
                color:      active ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow:  active ? '0 2px 10px rgba(22,163,74,0.25)' : 'none',
                transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {t.label}
                {!loading && t.count > 0 && (
                  <span style={{ fontSize: 11, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '1px 7px' }}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── SEARCH ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 360 }}>
          <Search size={15} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar equipos..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif" }}
          />
        </div>

        {/* ─── SECTION LABEL ──────────────────────────────── */}
        {!loading && (
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase' }}>
            {tab === 'mine'
              ? `Equipos artificiales que administras · ${myTeams.length}`
              : `Equipos reales de tu zona · ${regionTeams.length}`}
          </div>
        )}

        {/* ─── CONTENT ────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ borderRadius: 18, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 14, borderRadius: 6, width: '60%', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
                    <div style={{ height: 11, borderRadius: 6, width: '40%', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                  </div>
                </div>
                <div style={{ height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
              </div>
            ))}
          </div>

        ) : list.length === 0 ? (
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px dashed rgba(255,255,255,0.1)', padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="rgba(255,255,255,0.18)" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', marginBottom: 6 }}>
                {tab === 'mine' ? 'Aún no tienes equipos' : 'Sin equipos en la región'}
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif" }}>
                {tab === 'mine'
                  ? 'Crea equipos artificiales para usar en tus torneos'
                  : 'No hay equipos reales registrados en tu zona aún'}
              </p>
            </div>
          </div>

        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {list.map((team, i) => {
              const [fromC, toC] = TEAM_COLORS[i % TEAM_COLORS.length];
              const initial = (team.name ?? '?')[0].toUpperCase();
              return (
                <div key={team.id} className="t-card" style={{ borderRadius: 18, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden' }}>

                  {/* Artificial badge */}
                  {team.is_artificial && (
                    <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', color: '#f59e0b', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      Artificial
                    </div>
                  )}

                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Logo with upload overlay (mine tab only) */}
                    <div
                      className={tab === 'mine' ? 'logo-wrap' : ''}
                      onClick={() => tab === 'mine' && !uploading && handleLogoClick(team)}
                      style={{ position: 'relative', width: 52, height: 52, borderRadius: 14, flexShrink: 0, cursor: tab === 'mine' ? 'pointer' : 'default', overflow: 'hidden' }}
                    >
                      {team.shield_url ? (
                        <img src={team.shield_url} alt={team.name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', borderRadius: 14, background: `linear-gradient(135deg, ${fromC}, ${toC})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff' }}>
                          {uploading && uploadTarget?.id === team.id ? (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                          ) : initial}
                        </div>
                      )}
                      {/* Hover overlay */}
                      {tab === 'mine' && (
                        <div
                          className="logo-overlay"
                          style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploading && uploadTarget?.id === team.id ? 1 : 0, transition: 'opacity 0.18s' }}
                        >
                          {uploading && uploadTarget?.id === team.id
                            ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                            : <Camera size={18} color="#fff" />}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: team.is_artificial ? 60 : 0 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.3, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {team.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {team.gender && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                            {GENDER_LABEL[team.gender] ?? team.gender}
                          </span>
                        )}
                        {team.code && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 6 }}>
                            #{team.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Founded */}
                  {team.founded && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif" }}>
                      Fundado: {new Date(team.founded).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                    {tab === 'mine' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => openPlayersModal(team)}
                          style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.07)', cursor: 'pointer', color: '#a78bfa', fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.18s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.14)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.07)')}
                        >
                          <Users size={13} /> Jugadores
                        </button>
                        <button
                          onClick={() => openAddModal(team)}
                          style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(22,163,74,0.25)', background: 'rgba(22,163,74,0.07)', cursor: 'pointer', color: '#22c55e', fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.18s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(22,163,74,0.14)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(22,163,74,0.07)')}
                        >
                          <Trophy size={13} /> Torneo
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAddModal(team)}
                        style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.07)', cursor: 'pointer', color: '#60a5fa', fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.18s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,0.14)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,99,235,0.07)')}
                      >
                        <Shield size={13} /> Registrar en torneo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CREATE TEAM MODAL ──────────────────────────── */}
        {showCreate && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <div style={{ width: '100%', maxWidth: 420, background: '#0d1117', borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease', overflow: 'hidden' }}>

              <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Nuevo</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5 }}>Crear equipo</h2>
                </div>
                <button onClick={() => setShowCreate(false)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam}>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Nombre *</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      placeholder="Ej: Leones del Norte"
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#22c55e')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Género</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Femenino' }, { value: 'mixed', label: 'Mixto' }] as const).map(opt => (
                        <button key={opt.value} type="button" onClick={() => setTeamGender(opt.value)}
                          style={{ flex: 1, padding: 9, borderRadius: 10, cursor: 'pointer', background: teamGender === opt.value ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.03)', border: teamGender === opt.value ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.08)', color: teamGender === opt.value ? '#22c55e' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Artificial notice */}
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b', flexShrink: 0 }}>!</span>
                    <p style={{ fontSize: 12, color: 'rgba(245,158,11,0.75)', fontFamily: "'Barlow', sans-serif", lineHeight: 1.5, margin: 0 }}>
                      Este equipo será <strong>artificial</strong> — invisible en la app móvil para usuarios reales.
                    </p>
                  </div>

                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowCreate(false)}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={creating}
                    style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', cursor: creating ? 'not-allowed' : 'pointer', background: creating ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #15803d)', color: creating ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: creating ? 'none' : '0 4px 14px rgba(22,163,74,0.25)' }}>
                    {creating ? 'Creando...' : 'Crear equipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD TO TORNEO MODAL ────────────────────────── */}
        {addTarget && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setAddTarget(null); }}
          >
            <div style={{ width: '100%', maxWidth: 400, background: '#0d1117', borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease', overflow: 'hidden' }}>

              <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
                    {addTarget.is_artificial ? 'Añadir a torneo' : 'Registrar en torneo'}
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.3, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {addTarget.name}
                  </h2>
                </div>
                <button onClick={() => setAddTarget(null)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {myTorneos.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", textAlign: 'center', padding: '20px 0' }}>
                    No tienes torneos. Crea uno primero en la sección Torneos.
                  </p>
                ) : (
                  <>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                      Selecciona el torneo
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {myTorneos.map(t => {
                        const enrolled = enrolledTorneos.includes(t.id);
                        const removing = removingTorneoId === t.id;
                        return enrolled ? (
                          <div key={t.id} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Trophy size={14} color="rgba(255,255,255,0.25)" />
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow Condensed', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 0.5, background: 'rgba(22,163,74,0.12)', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>YA INSCRITO</span>
                            <button
                              onClick={() => handleRemoveFromTorneo(t.id)}
                              disabled={removing}
                              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: removing ? 'rgba(255,255,255,0.3)' : '#f87171', cursor: removing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', flexShrink: 0, transition: 'all 0.15s ease' }}
                              onMouseEnter={e => { if (!removing) e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                            >
                              {removing ? '...' : 'Quitar'}
                            </button>
                          </div>
                        ) : (
                          <button key={t.id} type="button" onClick={() => setSelectedTorneoId(t.id)}
                            style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: selectedTorneoId === t.id ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.03)', border: selectedTorneoId === t.id ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.08)', color: selectedTorneoId === t.id ? '#22c55e' : '#f1f5f9', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s ease' }}>
                            <Trophy size={14} color={selectedTorneoId === t.id ? '#22c55e' : 'rgba(255,255,255,0.25)'} />
                            {t.name}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setAddTarget(null)}
                        style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                        Cerrar
                      </button>
                      <button onClick={handleAddToTorneo} disabled={adding || !selectedTorneoId}
                        style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', cursor: (adding || !selectedTorneoId) ? 'not-allowed' : 'pointer', background: (adding || !selectedTorneoId) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #15803d)', color: (adding || !selectedTorneoId) ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: (adding || !selectedTorneoId) ? 'none' : '0 4px 14px rgba(22,163,74,0.25)' }}>
                        {adding ? 'Añadiendo...' : addTarget.is_artificial ? 'Añadir' : 'Registrar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── GUEST PLAYERS MODAL ────────────────────────── */}
        {playerTarget && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setPlayerTarget(null); }}
          >
            <div style={{ width: '100%', maxWidth: 480, background: '#0d1117', borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>

              {/* Header */}
              <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(139,92,246,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Jugadores artificiales</div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.3, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {playerTarget.name}
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setShowPlayerForm(v => !v)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: showPlayerForm ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {showPlayerForm ? <ChevronUp size={14} /> : <UserPlus size={14} />}
                    {showPlayerForm ? 'Cerrar' : 'Añadir'}
                  </button>
                  <button onClick={() => setPlayerTarget(null)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Add player form (collapsible) */}
              {showPlayerForm && (
                <form onSubmit={handleAddPlayer} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.05)', flexShrink: 0 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Nombre *</label>
                      <input
                        type="text"
                        value={playerForm.name}
                        onChange={e => setPlayerForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Juan"
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Apellido</label>
                      <input
                        type="text"
                        value={playerForm.lastname}
                        onChange={e => setPlayerForm(p => ({ ...p, lastname: e.target.value }))}
                        placeholder="Pérez"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {/* Pierna */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Pierna</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {([{ v: 'right', l: 'Der.' }, { v: 'left', l: 'Izq.' }] as const).map(o => (
                          <button key={o.v} type="button" onClick={() => setPlayerForm(p => ({ ...p, dominant_leg: p.dominant_leg === o.v ? '' : o.v }))}
                            style={{ flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', background: playerForm.dominant_leg === o.v ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)', border: playerForm.dominant_leg === o.v ? '1.5px solid #7c3aed' : '1.5px solid rgba(255,255,255,0.08)', color: playerForm.dominant_leg === o.v ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>
                            {o.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Género */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Género</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {([{ v: 'male', l: 'M' }, { v: 'female', l: 'F' }] as const).map(o => (
                          <button key={o.v} type="button" onClick={() => setPlayerForm(p => ({ ...p, gender: p.gender === o.v ? '' : o.v }))}
                            style={{ flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', background: playerForm.gender === o.v ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)', border: playerForm.gender === o.v ? '1.5px solid #7c3aed' : '1.5px solid rgba(255,255,255,0.08)', color: playerForm.gender === o.v ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>
                            {o.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Año */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Año nac.</label>
                      <input
                        type="number"
                        value={playerForm.birth_year}
                        onChange={e => setPlayerForm(p => ({ ...p, birth_year: e.target.value }))}
                        placeholder="1995"
                        min={1950} max={2015}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={addingPlayer}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: addingPlayer ? 'not-allowed' : 'pointer', background: addingPlayer ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: addingPlayer ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 13, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: addingPlayer ? 'none' : '0 3px 12px rgba(124,58,237,0.3)' }}>
                    {addingPlayer ? 'Guardando...' : 'Guardar jugador'}
                  </button>
                </form>
              )}

              {/* Player list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loadingPlayers ? (
                  <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                    ))}
                  </div>
                ) : guestPlayers.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} color="rgba(139,92,246,0.5)" />
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif" }}>
                      Este equipo no tiene jugadores aún
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                      {guestPlayers.length} {guestPlayers.length === 1 ? 'jugador' : 'jugadores'}
                    </div>
                    {guestPlayers.map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {/* Number */}
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.2)', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>

                        {/* Avatar */}
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${TEAM_COLORS[i % TEAM_COLORS.length][0]}, ${TEAM_COLORS[i % TEAM_COLORS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                          {p.name[0].toUpperCase()}
                        </div>

                        {/* Name + meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name} {p.lastname ?? ''}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                            {p.dominant_leg && (
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                                {p.dominant_leg === 'right' ? 'Der.' : 'Izq.'}
                              </span>
                            )}
                            {p.gender && (
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                                {p.gender === 'male' ? 'M' : 'F'}
                              </span>
                            )}
                            {p.birth_year && (
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                                {p.birth_year}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemovePlayer(p.id)}
                          style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(239,68,68,0.6)', flexShrink: 0, transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}
                          title="Eliminar jugador"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── BULK ENROLL MODAL ──────────────────────────── */}
        {showBulk && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowBulk(false); }}
          >
            <div style={{ width: '100%', maxWidth: 460, background: '#0d1117', borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>

              {/* Header */}
              <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(139,92,246,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Inscripción masiva</div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.3 }}>Inscribir equipos al torneo</h2>
                </div>
                <button onClick={() => setShowBulk(false)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Torneo selector */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Torneo destino</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {myTorneos.map(t => (
                    <button key={t.id} type="button" onClick={() => setBulkTorneoId(t.id)}
                      style={{ padding: '11px 14px', borderRadius: 12, cursor: 'pointer', background: bulkTorneoId === t.id ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)', border: bulkTorneoId === t.id ? '1.5px solid #7c3aed' : '1.5px solid rgba(255,255,255,0.08)', color: bulkTorneoId === t.id ? '#a78bfa' : '#f1f5f9', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s ease' }}>
                      <Trophy size={14} color={bulkTorneoId === t.id ? '#a78bfa' : 'rgba(255,255,255,0.25)'} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team checklist */}
              {bulkTorneoId && (
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {loadingBulkStatus ? (
                    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px 24px' }}>
                      {/* Select all / none controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                          {myTeams.length} equipo{myTeams.length !== 1 ? 's' : ''} · {bulkSelected.size} seleccionado{bulkSelected.size !== 1 ? 's' : ''}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setBulkSelected(new Set(myTeams.filter(t => !bulkEnrolled.has(t.id)).map(t => t.id)))}
                            style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}
                          >
                            Todos
                          </button>
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>·</span>
                          <button
                            onClick={() => setBulkSelected(new Set())}
                            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}
                          >
                            Ninguno
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {myTeams.map((team, i) => {
                          const [fromC, toC] = TEAM_COLORS[i % TEAM_COLORS.length];
                          const enrolled  = bulkEnrolled.has(team.id);
                          const selected  = bulkSelected.has(team.id);
                          return (
                            <div
                              key={team.id}
                              onClick={() => {
                                if (enrolled) return;
                                setBulkSelected(prev => {
                                  const next = new Set(prev);
                                  next.has(team.id) ? next.delete(team.id) : next.add(team.id);
                                  return next;
                                });
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, cursor: enrolled ? 'default' : 'pointer', background: selected ? 'rgba(139,92,246,0.08)' : enrolled ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(139,92,246,0.3)' : enrolled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.15s', opacity: enrolled ? 0.7 : 1 }}
                            >
                              {/* Checkbox */}
                              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected ? '#7c3aed' : enrolled ? '#22c55e' : 'rgba(255,255,255,0.2)'}`, background: selected ? '#7c3aed' : enrolled ? 'rgba(34,197,94,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                {(selected || enrolled) && (
                                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                    <path d="M1 4.5L4 7.5L10 1" stroke={enrolled ? '#22c55e' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>

                              {/* Avatar */}
                              {team.shield_url ? (
                                <img src={team.shield_url} alt="" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${fromC}, ${toC})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                                  {(team.name ?? '?')[0].toUpperCase()}
                                </div>
                              )}

                              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>

                              {enrolled && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: 0.5, background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                                  YA INSCRITO
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer actions */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, flexShrink: 0 }}>
                <button onClick={() => setShowBulk(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                  Cerrar
                </button>
                <button
                  onClick={handleBulkEnroll}
                  disabled={bulkSelected.size === 0 || bulkEnrolling || !bulkTorneoId}
                  style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', cursor: (bulkSelected.size === 0 || bulkEnrolling || !bulkTorneoId) ? 'not-allowed' : 'pointer', background: (bulkSelected.size === 0 || !bulkTorneoId) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: (bulkSelected.size === 0 || !bulkTorneoId) ? 'rgba(255,255,255,0.25)' : '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, opacity: bulkEnrolling ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: (bulkSelected.size === 0 || !bulkTorneoId) ? 'none' : '0 4px 14px rgba(124,58,237,0.3)', transition: 'all 0.2s' }}>
                  {bulkEnrolling && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />}
                  {bulkEnrolling ? 'Inscribiendo...' : bulkSelected.size > 0 ? `Inscribir ${bulkSelected.size} equipo${bulkSelected.size !== 1 ? 's' : ''}` : 'Selecciona equipos'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
