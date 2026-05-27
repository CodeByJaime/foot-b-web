import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./dialog";
import { useData } from "../../contexts/DataContext";
import type { Tournament } from "../../data/mockData";

const EMOJI_OPTIONS = ["🏆", "⚽", "🥅", "🎽", "🌟", "🔥", "⚡", "🦁", "🦅", "🐯"];

export default function CreateTournamentModal() {
  const { createTournament, teams } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    format: "league" as Tournament["format"],
    startDate: "",
    endDate: "",
    teams: 8,
    status: "upcoming" as Tournament["status"],
    logo: "🏆",
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      await createTournament(form);
      toast.success(`Torneo "${form.name}" creado exitosamente`);
      setOpen(false);
      setForm({ name: "", format: "league", startDate: "", endDate: "", teams: 8, status: "upcoming", logo: "🏆" });
    } catch {
      toast.error("Error al crear el torneo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Crear torneo
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Torneo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Ícono</label>
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
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Liga Primavera 2026"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium mb-1">Formato</label>
            <select
              value={form.format}
              onChange={(e) => set("format", e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="league">Liga (todos contra todos)</option>
              <option value="cup">Copa (eliminación directa)</option>
              <option value="groups-knockout">Grupos + Eliminación</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha inicio *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha fin *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Teams count */}
          <div>
            <label className="block text-sm font-medium mb-1">Número de equipos</label>
            <select
              value={form.teams}
              onChange={(e) => set("teams", Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[4, 6, 8, 10, 12, 14, 16, 20, 24, 32].map((n) => (
                <option key={n} value={n}>{n} equipos</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <div className="flex gap-2">
              {(["upcoming", "ongoing", "finished"] as const).map((s) => {
                const labels = { upcoming: "Próximo", ongoing: "En curso", finished: "Finalizado" };
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.status === s ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    {labels[s]}
                  </button>
                );
              })}
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
              {saving ? "Guardando..." : "Crear torneo"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
