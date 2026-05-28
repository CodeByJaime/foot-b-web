import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Trophy, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type FilterStatus = 'all' | 'upcoming' | 'active' | 'finished';

interface Torneo {
  id: string;
  name: string;
  type: string;
  start_date: string | null;
  status: 'upcoming' | 'active' | 'finished' | string;
  season: string | null;
  period: string | null;
  level: string | null;
  gender: string | null;
  ubication_id: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  upcoming: { label: 'Inscripciones', color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  dot: '#3b82f6' },
  active:   { label: 'En curso',      color: '#22c55e', bg: 'rgba(22,163,74,0.12)',  dot: '#22c55e' },
  finished: { label: 'Finalizado',    color: '#64748b', bg: 'rgba(100,116,139,0.1)', dot: '#94a3b8' },
};

const CARD_GRADIENTS = [
  ['#1e1b4b', '#4338ca'],
  ['#164e63', '#0e7490'],
  ['#14532d', '#15803d'],
  ['#7c2d12', '#c2410c'],
  ['#4a044e', '#a21caf'],
  ['#1e3a5f', '#2563eb'],
];

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'active',   label: 'En curso' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'finished', label: 'Finalizados' },
];

export default function Tournaments() {
  const { user } = useAuth();
  const [profileId, setProfileId]     = useState<string | null>(null);
  const [ubicationId, setUbicationId] = useState<string | null>(null);
  const [torneos, setTorneos]         = useState<Torneo[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<FilterStatus>('all');
  const [showCreate, setShowCreate]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'league', season: '', period: '', level: '', gender: 'male', start_date: '',
  });

  // Fetch profile
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

  // Fetch own tournaments via TORNEO_ADMINS
  useEffect(() => {
    if (!profileId) return;
    const fetchOwn = async () => {
      setLoading(true);
      const { data: adminData } = await supabase
        .from('TORNEO_ADMINS')
        .select('torneo_id')
        .eq('profile_id', profileId);

      const ids = (adminData ?? []).map((a: any) => a.torneo_id);
      if (ids.length === 0) { setTorneos([]); setLoading(false); return; }

      const { data } = await supabase.from('TORNEO').select('*').in('id', ids);
      setTorneos((data ?? []) as Torneo[]);
      setLoading(false);
    };
    fetchOwn();
  }, [profileId]);

  const visible = filter === 'all' ? torneos : torneos.filter(t => t.status === filter);

  const setField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ubicationId || !profileId) return;
    setCreating(true);
    try {
      const { data: torneo, error } = await supabase
        .from('TORNEO')
        .insert([{ ...form, ubication_id: ubicationId, status: 'upcoming' }])
        .select()
        .single();
      if (error) throw error;
      await supabase.from('TORNEO_ADMINS').insert([{ torneo_id: torneo.id, profile_id: profileId }]);
      toast.success(`Torneo "${form.name}" creado`);
      setTorneos(prev => [torneo as Torneo, ...prev]);
      setShowCreate(false);
      setForm({ name: '', type: 'league', season: '', period: '', level: '', gender: 'male', start_date: '' });
    } catch {
      toast.error('Error al crear el torneo');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Barlow Condensed', 'Impact', system-ui, sans-serif" }}>

        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          @keyframes fadeIn { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
          .t-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .t-card:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.45) !important; }
        `}</style>

        {/* ─── HEADER ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Gestión</div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              Mis Torneos
              {!loading && torneos.length > 0 && (
                <span style={{ fontSize: 16, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', color: '#22c55e', verticalAlign: 'middle' }}>
                  {torneos.length}
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <Plus size={16} /> Crear torneo
          </button>
        </div>

        {/* ─── FILTER CHIPS ───────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif",
                  background: active ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(255,255,255,0.04)',
                  color:      active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border:     active ? '1.5px solid rgba(22,163,74,0.4)' : '1.5px solid rgba(255,255,255,0.08)',
                  boxShadow:  active ? '0 2px 12px rgba(22,163,74,0.2)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ─── CONTENT ────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ height: 130, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 14, borderRadius: 8, width: '70%', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ height: 12, borderRadius: 8, width: '50%', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ borderRadius: 20, background: '#0d1117', border: '1px dashed rgba(255,255,255,0.1)', padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={28} color="#22c55e" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', marginBottom: 6 }}>
                {filter === 'all' ? 'No tienes torneos aún' : 'Sin torneos en esta categoría'}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif" }}>
                {filter === 'all' ? 'Crea tu primer torneo y empieza a organizar' : 'Prueba con otro filtro'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {visible.map((torneo, i) => {
              const cfg = STATUS_CONFIG[torneo.status] ?? STATUS_CONFIG.upcoming;
              const [fromC, toC] = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
              return (
                <Link
                  key={torneo.id}
                  to={`/tournaments/${torneo.id}`}
                  className="t-card"
                  style={{ borderRadius: 20, overflow: 'hidden', textDecoration: 'none', display: 'block', background: `linear-gradient(135deg, ${fromC}, ${toC})`, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -20, left: 10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                  <div style={{ padding: '22px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: cfg.bg, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: torneo.status === 'active' ? '#fff' : cfg.color, letterSpacing: 0.5 }}>{cfg.label}</span>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', fontSize: 11, color: '#fff', fontWeight: 700 }}>
                        {torneo.type === 'cup' ? 'Copa' : 'Liga'}
                      </div>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 14 }}>{torneo.name}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                      {[torneo.season, torneo.period, torneo.level].filter(Boolean).map(pill => (
                        <span key={pill} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', fontFamily: "'Barlow', sans-serif" }}>{pill}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 14 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow', sans-serif" }}>
                        {torneo.start_date ? new Date(torneo.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.15)' }}>
                        <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>Ver</span>
                        <ArrowRight size={11} color="#fff" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Create new card */}
            <button
              onClick={() => setShowCreate(true)}
              style={{ borderRadius: 20, border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 200, transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(22,163,74,0.4)'; e.currentTarget.style.background = 'rgba(22,163,74,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={24} color="#22c55e" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Nuevo torneo</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", marginTop: 4 }}>Crea uno en minutos</div>
              </div>
            </button>
          </div>
        )}

        {/* ─── CREATE MODAL ───────────────────────────────── */}
        {showCreate && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <div style={{ width: '100%', maxWidth: 480, background: '#0d1117', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease', overflow: 'hidden' }}>

              {/* Modal header */}
              <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Nuevo</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5 }}>Crear torneo</h2>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate}>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>

                  {/* Text fields */}
                  {([
                    { field: 'name',       label: 'Nombre del torneo *', placeholder: 'Liga Primavera 2026', required: true,  type: 'text' },
                    { field: 'season',     label: 'Temporada',           placeholder: '2026',               required: false, type: 'text' },
                    { field: 'period',     label: 'Período',             placeholder: 'Primavera',          required: false, type: 'text' },
                    { field: 'level',      label: 'Nivel',               placeholder: 'Aficionado',         required: false, type: 'text' },
                    { field: 'start_date', label: 'Fecha de inicio',     placeholder: '',                   required: false, type: 'date' },
                  ] as const).map(f => (
                    <div key={f.field}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.field]}
                        onChange={e => setField(f.field, e.target.value)}
                        placeholder={f.placeholder}
                        required={f.required}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, fontFamily: "'Barlow', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#22c55e')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                    </div>
                  ))}

                  {/* Tipo */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Tipo</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([{ value: 'league', label: 'Liga' }, { value: 'cup', label: 'Copa' }] as const).map(opt => (
                        <button key={opt.value} type="button" onClick={() => setField('type', opt.value)}
                          style={{ flex: 1, padding: 10, borderRadius: 10, cursor: 'pointer', background: form.type === opt.value ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.03)', border: form.type === opt.value ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.08)', color: form.type === opt.value ? '#22c55e' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Género */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Género</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Femenino' }, { value: 'mixed', label: 'Mixto' }] as const).map(opt => (
                        <button key={opt.value} type="button" onClick={() => setField('gender', opt.value)}
                          style={{ flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', background: form.gender === opt.value ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.03)', border: form.gender === opt.value ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.08)', color: form.gender === opt.value ? '#22c55e' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowCreate(false)}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={creating}
                    style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', cursor: creating ? 'not-allowed' : 'pointer', background: creating ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #15803d)', color: creating ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: creating ? 'none' : '0 4px 16px rgba(22,163,74,0.25)' }}>
                    {creating ? 'Creando...' : 'Crear torneo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
