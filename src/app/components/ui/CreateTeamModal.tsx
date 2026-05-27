import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./dialog";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";

const EMOJI_OPTIONS = ["⭐", "🦅", "⚽", "🦁", "🏆", "🐯", "🦊", "🐺", "🦋", "🔥", "⚡", "🌟", "🛡️", "⚔️", "🎯"];

export default function CreateTeamModal() {
  const { createTeam } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logo: "⭐",
    coach: "",
    foundedYear: new Date().getFullYear(),
    players: 11,
    wins: 0,
    draws: 0,
    losses: 0,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre del equipo es requerido");
      return;
    }
    setSaving(true);
    try {
      await createTeam({ ...form, createdBy: user?.id });
      toast.success(`Equipo "${form.name}" creado exitosamente`);
      setOpen(false);
      setForm({ name: "", logo: "⭐", coach: "", foundedYear: new Date().getFullYear(), players: 11, wins: 0, draws: 0, losses: 0 });
    } catch {
      toast.error("Error al crear el equipo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Agregar equipo
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Equipo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview + Emoji */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
            <div className="text-6xl">{form.logo}</div>
            <div>
              <p className="font-bold text-lg">{form.name || "Nombre del equipo"}</p>
              <p className="text-sm text-muted-foreground">{form.coach || "Entrenador"}</p>
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Escudo</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("logo", e)}
                  className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                    form.logo === e ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del equipo *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="FC Estrella"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Coach */}
          <div>
            <label className="block text-sm font-medium mb-1">Entrenador</label>
            <input
              value={form.coach}
              onChange={(e) => set("coach", e.target.value)}
              placeholder="Carlos Martínez"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Founded + Players */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Año de fundación</label>
              <input
                type="number"
                value={form.foundedYear}
                onChange={(e) => set("foundedYear", Number(e.target.value))}
                min={1900}
                max={new Date().getFullYear()}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de jugadores</label>
              <input
                type="number"
                value={form.players}
                onChange={(e) => set("players", Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Record */}
          <div>
            <label className="block text-sm font-medium mb-2">Historial (opcional)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-primary mb-1">Victorias</label>
                <input
                  type="number"
                  value={form.wins}
                  onChange={(e) => set("wins", Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-chart-3 mb-1">Empates</label>
                <input
                  type="number"
                  value={form.draws}
                  onChange={(e) => set("draws", Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-destructive mb-1">Derrotas</label>
                <input
                  type="number"
                  value={form.losses}
                  onChange={(e) => set("losses", Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear equipo"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
