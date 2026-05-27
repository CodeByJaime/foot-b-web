import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./dialog";
import { useData } from "../../contexts/DataContext";
import type { Match } from "../../data/mockData";

export default function CreateMatchModal() {
  const { createMatch, tournaments, teams } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tournamentId: "",
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "15:00",
    venue: "",
    status: "scheduled" as Match["status"],
    referee: "",
    homeScore: null as number | null,
    awayScore: null as number | null,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tournamentId || !form.homeTeamId || !form.awayTeamId || !form.date || !form.venue) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    if (form.homeTeamId === form.awayTeamId) {
      toast.error("El equipo local y visitante no pueden ser el mismo");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        homeScore: form.status === "finished" ? form.homeScore : null,
        awayScore: form.status === "finished" ? form.awayScore : null,
      };
      await createMatch(payload);
      toast.success("Partido programado exitosamente");
      setOpen(false);
      setForm({ tournamentId: "", homeTeamId: "", awayTeamId: "", date: "", time: "15:00", venue: "", status: "scheduled", referee: "", homeScore: null, awayScore: null });
    } catch {
      toast.error("Error al crear el partido");
    } finally {
      setSaving(false);
    }
  };

  const homeTeam = teams.find((t) => t.id === form.homeTeamId);
  const awayTeam = teams.find((t) => t.id === form.awayTeamId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Programar partido
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Partido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          {(homeTeam || awayTeam) && (
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
              <div className="text-center">
                <div className="text-4xl mb-1">{homeTeam?.logo || "?"}</div>
                <p className="text-xs font-medium">{homeTeam?.name || "Local"}</p>
              </div>
              <div className="text-xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-4xl mb-1">{awayTeam?.logo || "?"}</div>
                <p className="text-xs font-medium">{awayTeam?.name || "Visitante"}</p>
              </div>
            </div>
          )}

          {/* Tournament */}
          <div>
            <label className="block text-sm font-medium mb-1">Torneo *</label>
            <select
              value={form.tournamentId}
              onChange={(e) => set("tournamentId", e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un torneo</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Equipo local *</label>
              <select
                value={form.homeTeamId}
                onChange={(e) => set("homeTeamId", e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Seleccionar</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Equipo visitante *</label>
              <select
                value={form.awayTeamId}
                onChange={(e) => set("awayTeamId", e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Seleccionar</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium mb-1">Estadio / Cancha *</label>
            <input
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="Estadio Municipal"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Referee */}
          <div>
            <label className="block text-sm font-medium mb-1">Árbitro</label>
            <input
              value={form.referee}
              onChange={(e) => set("referee", e.target.value)}
              placeholder="Nombre del árbitro"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <div className="flex gap-2">
              {([
                { value: "scheduled", label: "Programado" },
                { value: "live", label: "En vivo" },
                { value: "finished", label: "Finalizado" },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("status", s.value)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.status === s.value ? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Score (only for finished/live) */}
          {(form.status === "finished" || form.status === "live") && (
            <div>
              <label className="block text-sm font-medium mb-2">Resultado</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1 text-center">
                    {homeTeam?.name || "Local"}
                  </label>
                  <input
                    type="number"
                    value={form.homeScore ?? ""}
                    onChange={(e) => set("homeScore", e.target.value === "" ? null : Number(e.target.value))}
                    min={0}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1 text-center">
                    {awayTeam?.name || "Visitante"}
                  </label>
                  <input
                    type="number"
                    value={form.awayScore ?? ""}
                    onChange={(e) => set("awayScore", e.target.value === "" ? null : Number(e.target.value))}
                    min={0}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

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
              {saving ? "Guardando..." : "Programar partido"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
