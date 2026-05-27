import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./dialog";
import { useData } from "../../contexts/DataContext";
import type { Player } from "../../data/mockData";

const POSITIONS: { value: Player["position"]; label: string; color: string }[] = [
  { value: "GK", label: "Portero", color: "bg-chart-3/20 text-chart-3 border-chart-3" },
  { value: "DEF", label: "Defensa", color: "bg-primary/20 text-primary border-primary" },
  { value: "MID", label: "Mediocampo", color: "bg-chart-2/20 text-chart-2 border-chart-2" },
  { value: "FWD", label: "Delantero", color: "bg-destructive/20 text-destructive border-destructive" },
];

export default function CreatePlayerModal() {
  const { createPlayer, teams } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    number: 1,
    position: "FWD" as Player["position"],
    teamId: "",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre del jugador es requerido");
      return;
    }
    if (!form.teamId) {
      toast.error("Selecciona un equipo");
      return;
    }
    setSaving(true);
    try {
      await createPlayer(form);
      toast.success(`Jugador "${form.name}" agregado exitosamente`);
      setOpen(false);
      setForm({ name: "", number: 1, position: "FWD", teamId: "", goals: 0, assists: 0, yellowCards: 0, redCards: 0 });
    } catch {
      toast.error("Error al crear el jugador");
    } finally {
      setSaving(false);
    }
  };

  const selectedTeam = teams.find((t) => t.id === form.teamId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Agregar jugador
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Jugador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
            <div className="bg-primary/20 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
              {form.number}
            </div>
            <div>
              <p className="font-bold text-lg">{form.name || "Nombre del jugador"}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedTeam ? `${selectedTeam.logo} ${selectedTeam.name}` : "Sin equipo"}</span>
                <span>·</span>
                <span>{POSITIONS.find((p) => p.value === form.position)?.label}</span>
              </div>
            </div>
          </div>

          {/* Name + Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre completo *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Juan García"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dorsal</label>
              <input
                type="number"
                value={form.number}
                onChange={(e) => set("number", Number(e.target.value))}
                min={1}
                max={99}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-2">Posición</label>
            <div className="grid grid-cols-4 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => set("position", pos.value)}
                  className={`py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    form.position === pos.value ? pos.color : "border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <div className="font-bold">{pos.value}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{pos.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="block text-sm font-medium mb-1">Equipo *</label>
            <select
              value={form.teamId}
              onChange={(e) => set("teamId", e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.logo} {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div>
            <label className="block text-sm font-medium mb-2">Estadísticas iniciales</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-primary mb-1 text-center">Goles</label>
                <input
                  type="number"
                  value={form.goals}
                  onChange={(e) => set("goals", Number(e.target.value))}
                  min={0}
                  className="w-full px-2 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-chart-2 mb-1 text-center">Asist.</label>
                <input
                  type="number"
                  value={form.assists}
                  onChange={(e) => set("assists", Number(e.target.value))}
                  min={0}
                  className="w-full px-2 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-chart-3 mb-1 text-center">T. Ama.</label>
                <input
                  type="number"
                  value={form.yellowCards}
                  onChange={(e) => set("yellowCards", Number(e.target.value))}
                  min={0}
                  className="w-full px-2 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-destructive mb-1 text-center">T. Roja</label>
                <input
                  type="number"
                  value={form.redCards}
                  onChange={(e) => set("redCards", Number(e.target.value))}
                  min={0}
                  className="w-full px-2 py-2 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
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
              {saving ? "Guardando..." : "Agregar jugador"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
