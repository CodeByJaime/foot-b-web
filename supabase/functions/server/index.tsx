import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

// ── helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

async function getList<T>(key: string): Promise<T[]> {
  return (await kv.get(key)) ?? [];
}

async function saveList<T>(key: string, list: T[]): Promise<void> {
  await kv.set(key, list);
}

// ── seed ─────────────────────────────────────────────────────────────────────

app.post("/seed", async (c) => {
  const existing = await kv.get("footb:tournaments");
  if (existing && existing.length > 0) {
    return c.json({ seeded: false, message: "Data already exists" });
  }

  const tournaments = [
    { id: "1", name: "Liga Amateur Primavera 2026", format: "league", startDate: "2026-03-01", endDate: "2026-05-30", teams: 12, status: "ongoing" },
    { id: "2", name: "Copa de Verano", format: "cup", startDate: "2026-06-01", endDate: "2026-06-30", teams: 16, status: "upcoming" },
    { id: "3", name: "Torneo Regional", format: "groups-knockout", startDate: "2026-01-15", endDate: "2026-02-28", teams: 8, status: "finished" },
  ];

  const teams = [
    { id: "1", name: "Deportivo Estrella", logo: "⭐", foundedYear: 2015, coach: "Carlos Martínez", players: 18, wins: 8, draws: 3, losses: 1 },
    { id: "2", name: "FC Águilas", logo: "🦅", foundedYear: 2018, coach: "Roberto Silva", players: 20, wins: 7, draws: 4, losses: 1 },
    { id: "3", name: "Unidos FC", logo: "⚽", foundedYear: 2020, coach: "Diego López", players: 16, wins: 6, draws: 3, losses: 3 },
    { id: "4", name: "Leones del Sur", logo: "🦁", foundedYear: 2016, coach: "Miguel Ángel Ruiz", players: 19, wins: 5, draws: 5, losses: 2 },
    { id: "5", name: "Atlético Victoria", logo: "🏆", foundedYear: 2019, coach: "Fernando Gómez", players: 17, wins: 4, draws: 4, losses: 4 },
    { id: "6", name: "Tigres Unidos", logo: "🐯", foundedYear: 2017, coach: "Luis Hernández", players: 18, wins: 3, draws: 3, losses: 6 },
  ];

  const players = [
    { id: "1", name: "Alejandro Ramírez", number: 10, position: "FWD", teamId: "1", goals: 15, assists: 7, yellowCards: 2, redCards: 0 },
    { id: "2", name: "Gabriel Torres", number: 9, position: "FWD", teamId: "2", goals: 12, assists: 5, yellowCards: 3, redCards: 0 },
    { id: "3", name: "Martín Suárez", number: 7, position: "MID", teamId: "1", goals: 8, assists: 10, yellowCards: 1, redCards: 0 },
    { id: "4", name: "Lucas Fernández", number: 1, position: "GK", teamId: "1", goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: "5", name: "Diego Vargas", number: 4, position: "DEF", teamId: "2", goals: 2, assists: 3, yellowCards: 5, redCards: 1 },
  ];

  const matches = [
    { id: "1", tournamentId: "1", homeTeamId: "1", awayTeamId: "2", homeScore: 2, awayScore: 1, date: "2026-05-10", time: "15:00", venue: "Estadio Municipal", status: "finished", referee: "Juan Pérez" },
    { id: "2", tournamentId: "1", homeTeamId: "3", awayTeamId: "4", homeScore: null, awayScore: null, date: "2026-05-15", time: "18:00", venue: "Campo Deportivo Central", status: "live", referee: "Ana García" },
    { id: "3", tournamentId: "1", homeTeamId: "5", awayTeamId: "6", homeScore: null, awayScore: null, date: "2026-05-18", time: "16:00", venue: "Polideportivo Norte", status: "scheduled", referee: "Carlos Ramírez" },
  ];

  const standings = [
    { teamId: "1", played: 12, won: 8, drawn: 3, lost: 1, goalsFor: 25, goalsAgainst: 10, goalDifference: 15, points: 27 },
    { teamId: "2", played: 12, won: 7, drawn: 4, lost: 1, goalsFor: 22, goalsAgainst: 12, goalDifference: 10, points: 25 },
    { teamId: "3", played: 12, won: 6, drawn: 3, lost: 3, goalsFor: 18, goalsAgainst: 15, goalDifference: 3, points: 21 },
    { teamId: "4", played: 12, won: 5, drawn: 5, lost: 2, goalsFor: 17, goalsAgainst: 14, goalDifference: 3, points: 20 },
    { teamId: "5", played: 12, won: 4, drawn: 4, lost: 4, goalsFor: 15, goalsAgainst: 16, goalDifference: -1, points: 16 },
    { teamId: "6", played: 12, won: 3, drawn: 3, lost: 6, goalsFor: 12, goalsAgainst: 20, goalDifference: -8, points: 12 },
  ];

  await kv.mset(
    ["footb:tournaments", "footb:teams", "footb:players", "footb:matches", "footb:standings:1"],
    [tournaments, teams, players, matches, standings]
  );

  return c.json({ seeded: true });
});

// ── tournaments ───────────────────────────────────────────────────────────────

app.get("/tournaments", async (c) => {
  const list = await getList("footb:tournaments");
  return c.json(list);
});

app.post("/tournaments", async (c) => {
  const body = await c.req.json();
  const item = { ...body, id: uuid() };
  const list = await getList("footb:tournaments");
  list.push(item);
  await saveList("footb:tournaments", list);
  return c.json(item, 201);
});

app.put("/tournaments/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const list = await getList<any>("footb:tournaments");
  const idx = list.findIndex((t: any) => t.id === id);
  if (idx === -1) return c.json({ error: "Not found" }, 404);
  list[idx] = { ...list[idx], ...body, id };
  await saveList("footb:tournaments", list);
  return c.json(list[idx]);
});

app.delete("/tournaments/:id", async (c) => {
  const id = c.req.param("id");
  const list = await getList<any>("footb:tournaments");
  const filtered = list.filter((t: any) => t.id !== id);
  await saveList("footb:tournaments", filtered);
  return c.json({ deleted: true });
});

// ── teams ─────────────────────────────────────────────────────────────────────

app.get("/teams", async (c) => {
  return c.json(await getList("footb:teams"));
});

app.post("/teams", async (c) => {
  const body = await c.req.json();
  const item = { ...body, id: uuid() };
  const list = await getList("footb:teams");
  list.push(item);
  await saveList("footb:teams", list);
  return c.json(item, 201);
});

app.put("/teams/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const list = await getList<any>("footb:teams");
  const idx = list.findIndex((t: any) => t.id === id);
  if (idx === -1) return c.json({ error: "Not found" }, 404);
  list[idx] = { ...list[idx], ...body, id };
  await saveList("footb:teams", list);
  return c.json(list[idx]);
});

app.delete("/teams/:id", async (c) => {
  const id = c.req.param("id");
  const list = await getList<any>("footb:teams");
  await saveList("footb:teams", list.filter((t: any) => t.id !== id));
  return c.json({ deleted: true });
});

// ── players ───────────────────────────────────────────────────────────────────

app.get("/players", async (c) => {
  return c.json(await getList("footb:players"));
});

app.post("/players", async (c) => {
  const body = await c.req.json();
  const item = { ...body, id: uuid() };
  const list = await getList("footb:players");
  list.push(item);
  await saveList("footb:players", list);
  return c.json(item, 201);
});

app.put("/players/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const list = await getList<any>("footb:players");
  const idx = list.findIndex((p: any) => p.id === id);
  if (idx === -1) return c.json({ error: "Not found" }, 404);
  list[idx] = { ...list[idx], ...body, id };
  await saveList("footb:players", list);
  return c.json(list[idx]);
});

app.delete(" /players/:id", async (c) => {
  const id = c.req.param("id");
  const list = await getList<any>("footb:players");
  await saveList("footb:players", list.filter((p: any) => p.id !== id));
  return c.json({ deleted: true });
});

// ── matches ───────────────────────────────────────────────────────────────────

app.get(" /matches", async (c) => {
  return c.json(await getList("footb:matches"));
});

app.post(" /matches", async (c) => {
  const body = await c.req.json();
  const item = { ...body, id: uuid() };
  const list = await getList("footb:matches");
  list.push(item);
  await saveList("footb:matches", list);
  return c.json(item, 201);
});

app.put("/matches/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const list = await getList<any>("footb:matches");
  const idx = list.findIndex((m: any) => m.id === id);
  if (idx === -1) return c.json({ error: "Not found" }, 404);
  list[idx] = { ...list[idx], ...body, id };
  await saveList("footb:matches", list);
  return c.json(list[idx]);
});

app.delete("/matches/:id", async (c) => {
  const id = c.req.param("id");
  const list = await getList<any>("footb:matches");
  await saveList("footb:matches", list.filter((m: any) => m.id !== id));
  return c.json({ deleted: true });
});

// ── standings ─────────────────────────────────────────────────────────────────

app.get("/standings/:tournamentId", async (c) => {
  const tid = c.req.param("tournamentId");
  return c.json(await getList(`footb:standings:${tid}`));
});

app.put(" /standings/:tournamentId", async (c) => {
  const tid = c.req.param("tournamentId");
  const body = await c.req.json();
  await saveList(`footb:standings:${tid}`, body);
  return c.json(body);
});

Deno.serve(app.fetch);
