import { supabase } from "./supabase";
import type { Tournament, Team, Player, Match, Standing } from "../data/mockData";

// ── row mappers (DB snake_case → TS camelCase) ────────────────────────────────

function toTournament(r: Record<string, unknown>): Tournament {
  const startDate = r.start_date
    ? (r.start_date as string).split("T")[0]
    : "";
  const endDate = r.end_date
    ? (r.end_date as string).split("T")[0]
    : "";
  return {
    id: r.id as string,
    name: r.name as string,
    format: ((r.type as string) ?? "league") as Tournament["format"],
    startDate,
    endDate,
    teams: (r.teams_count as number) ?? 0,
    status: ((r.status as string) ?? "upcoming") as Tournament["status"],
    logo: r.logo as string | undefined,
  };
}

function toTeam(r: Record<string, unknown>): Team {
  // TEAM_STATS is embedded via PostgREST join
  const stats = (r.TEAM_STATS as Record<string, number> | null) ?? {};
  const founded = r.founded
    ? new Date(r.founded as string).getFullYear()
    : new Date().getFullYear();
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    logo: (r.logo as string) ?? "⚽",
    foundedYear: founded,
    coach: (r.coach as string) ?? "",
    players: 0,
    wins: (stats.won as number) ?? 0,
    draws: (stats.drawn as number) ?? 0,
    losses: (stats.lost as number) ?? 0,
    createdBy: r.created_by as string | undefined,
  };
}

function toPlayer(r: Record<string, unknown>): Player {
  const name = [r.name, r.lastname].filter(Boolean).join(" ");
  return {
    id: r.id as string,
    name,
    number: (r.number as number) ?? 0,
    position: ((r.position as string) ?? "MID") as Player["position"],
    teamId: r.team_id as string,
    goals: (r.goals as number) ?? 0,
    assists: (r.assists as number) ?? 0,
    yellowCards: (r.yellow_cards as number) ?? 0,
    redCards: (r.red_cards as number) ?? 0,
    photo: r.photo as string | undefined,
  };
}

function toMatch(r: Record<string, unknown>): Match {
  let date = "";
  let time = "";
  if (r.date) {
    const dt = new Date(r.date as string);
    date = dt.toISOString().split("T")[0];
    time = dt.toTimeString().substring(0, 5);
  }
  return {
    id: r.id as string,
    tournamentId: r.torneo_id as string,
    homeTeamId: r.home_team_id as string,
    awayTeamId: r.away_team_id as string,
    homeScore: (r.home_score as number | null) ?? null,
    awayScore: (r.away_score as number | null) ?? null,
    date,
    time,
    venue: (r.place as string) ?? "",
    status: ((r.status as string) ?? "scheduled") as Match["status"],
    referee: r.referee as string | undefined,
  };
}

function toStanding(r: Record<string, unknown>): Standing {
  return {
    teamId: r.team_id as string,
    played: (r.played as number) ?? 0,
    won: (r.won as number) ?? 0,
    drawn: (r.drawn as number) ?? 0,
    lost: (r.lost as number) ?? 0,
    goalsFor: (r.goals_for as number) ?? 0,
    goalsAgainst: (r.goals_against as number) ?? 0,
    goalDifference: (r.goal_difference as number) ?? 0,
    points: (r.points as number) ?? 0,
  };
}

function raise(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

// ── tournaments → TORNEO ──────────────────────────────────────────────────────

export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("TORNEO")
    .select("*")
    .order("created_at");
  raise(error);
  return (data ?? []).map(toTournament);
}

export async function createTournament(d: Omit<Tournament, "id">): Promise<Tournament> {
  const { data, error } = await supabase
    .from("TORNEO")
    .insert({
      name: d.name,
      type: d.format,
      start_date: d.startDate,
      end_date: d.endDate || null,
      teams_count: d.teams,
      status: d.status,
      logo: d.logo ?? null,
    })
    .select()
    .single();
  raise(error);
  return toTournament(data!);
}

export async function updateTournament(id: string, d: Partial<Tournament>): Promise<Tournament> {
  const patch: Record<string, unknown> = {};
  if (d.name !== undefined)      patch.name        = d.name;
  if (d.format !== undefined)    patch.type        = d.format;
  if (d.startDate !== undefined) patch.start_date  = d.startDate;
  if (d.endDate !== undefined)   patch.end_date    = d.endDate;
  if (d.teams !== undefined)     patch.teams_count = d.teams;
  if (d.status !== undefined)    patch.status      = d.status;
  if (d.logo !== undefined)      patch.logo        = d.logo;
  const { data, error } = await supabase
    .from("TORNEO").update(patch).eq("id", id).select().single();
  raise(error);
  return toTournament(data!);
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase.from("TORNEO").delete().eq("id", id);
  raise(error);
}

// ── teams → TEAM + TEAM_STATS ─────────────────────────────────────────────────

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("TEAM")
    .select("*, TEAM_STATS(won, drawn, lost, played, goals_for, goals_against)")
    .order("created_at");
  raise(error);
  return (data ?? []).map(toTeam);
}

export async function createTeam(d: Omit<Team, "id">): Promise<Team> {
  const { data: team, error: teamErr } = await supabase
    .from("TEAM")
    .insert({
      name: d.name,
      logo: d.logo,
      founded: d.foundedYear ? `${d.foundedYear}-01-01T00:00:00Z` : null,
      coach: d.coach,
      created_by: d.createdBy ?? null,
    })
    .select()
    .single();
  raise(teamErr);

  const played = d.wins + d.draws + d.losses;
  await supabase.from("TEAM_STATS").insert({
    team_id: team!.id,
    played,
    won: d.wins,
    drawn: d.draws,
    lost: d.losses,
  });

  return toTeam({
    ...team!,
    TEAM_STATS: { won: d.wins, drawn: d.draws, lost: d.losses, played },
  });
}

export async function updateTeam(id: string, d: Partial<Team>): Promise<Team> {
  const teamPatch: Record<string, unknown> = {};
  if (d.name !== undefined)        teamPatch.name    = d.name;
  if (d.logo !== undefined)        teamPatch.logo    = d.logo;
  if (d.foundedYear !== undefined) teamPatch.founded = `${d.foundedYear}-01-01T00:00:00Z`;
  if (d.coach !== undefined)       teamPatch.coach   = d.coach;

  const statsPatch: Record<string, unknown> = {};
  if (d.wins !== undefined)   statsPatch.won   = d.wins;
  if (d.draws !== undefined)  statsPatch.drawn = d.draws;
  if (d.losses !== undefined) statsPatch.lost  = d.losses;

  if (Object.keys(teamPatch).length > 0) {
    const { error } = await supabase.from("TEAM").update(teamPatch).eq("id", id);
    raise(error);
  }
  if (Object.keys(statsPatch).length > 0) {
    const { error } = await supabase.from("TEAM_STATS").update(statsPatch).eq("team_id", id);
    raise(error);
  }

  const { data, error } = await supabase
    .from("TEAM")
    .select("*, TEAM_STATS(won, drawn, lost, played, goals_for, goals_against)")
    .eq("id", id)
    .single();
  raise(error);
  return toTeam(data!);
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase.from("TEAM").delete().eq("id", id);
  raise(error);
}

// ── players → GUEST_PLAYER ────────────────────────────────────────────────────

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("GUEST_PLAYER")
    .select("*")
    .eq("is_active", true)
    .order("created_at");
  raise(error);
  return (data ?? []).map(toPlayer);
}

export async function createPlayer(d: Omit<Player, "id">): Promise<Player> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para agregar jugadores");

  const { data, error } = await supabase
    .from("GUEST_PLAYER")
    .insert({
      name: d.name,
      team_id: d.teamId,
      added_by: user.id,
      number: d.number,
      position: d.position,
      goals: d.goals,
      assists: d.assists,
      yellow_cards: d.yellowCards,
      red_cards: d.redCards,
      photo: d.photo ?? null,
      is_active: true,
    })
    .select()
    .single();
  raise(error);
  return toPlayer(data!);
}

export async function updatePlayer(id: string, d: Partial<Player>): Promise<Player> {
  const patch: Record<string, unknown> = {};
  if (d.name !== undefined)        patch.name         = d.name;
  if (d.number !== undefined)      patch.number       = d.number;
  if (d.position !== undefined)    patch.position     = d.position;
  if (d.teamId !== undefined)      patch.team_id      = d.teamId;
  if (d.goals !== undefined)       patch.goals        = d.goals;
  if (d.assists !== undefined)     patch.assists      = d.assists;
  if (d.yellowCards !== undefined) patch.yellow_cards = d.yellowCards;
  if (d.redCards !== undefined)    patch.red_cards    = d.redCards;
  const { data, error } = await supabase
    .from("GUEST_PLAYER").update(patch).eq("id", id).select().single();
  raise(error);
  return toPlayer(data!);
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase
    .from("GUEST_PLAYER").update({ is_active: false }).eq("id", id);
  raise(error);
}

// ── matches → MATCH ───────────────────────────────────────────────────────────

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("MATCH")
    .select("id, torneo_id, home_team_id, away_team_id, home_score, away_score, date, status, place, referee")
    .not("home_team_id", "is", null)
    .not("away_team_id", "is", null)
    .order("date");
  raise(error);
  return (data ?? []).map(toMatch);
}

export async function createMatch(d: Omit<Match, "id">): Promise<Match> {
  const { data: { user } } = await supabase.auth.getUser();
  const dateTime = new Date(`${d.date}T${d.time}:00`).toISOString();

  const { data, error } = await supabase
    .from("MATCH")
    .insert({
      torneo_id: d.tournamentId,
      home_team_id: d.homeTeamId,
      away_team_id: d.awayTeamId,
      home_score: d.homeScore ?? null,
      away_score: d.awayScore ?? null,
      date: dateTime,
      place: d.venue,
      status: d.status,
      referee: d.referee ?? null,
      created_by: user?.id ?? null,
    })
    .select("id, torneo_id, home_team_id, away_team_id, home_score, away_score, date, status, place, referee")
    .single();
  raise(error);
  return toMatch(data!);
}

export async function updateMatch(id: string, d: Partial<Match>): Promise<Match> {
  const patch: Record<string, unknown> = {};
  if (d.tournamentId !== undefined) patch.torneo_id    = d.tournamentId;
  if (d.homeTeamId !== undefined)   patch.home_team_id = d.homeTeamId;
  if (d.awayTeamId !== undefined)   patch.away_team_id = d.awayTeamId;
  if (d.homeScore !== undefined)    patch.home_score   = d.homeScore;
  if (d.awayScore !== undefined)    patch.away_score   = d.awayScore;
  if (d.venue !== undefined)        patch.place        = d.venue;
  if (d.status !== undefined)       patch.status       = d.status;
  if (d.referee !== undefined)      patch.referee      = d.referee;
  if (d.date !== undefined || d.time !== undefined) {
    const { data: ex } = await supabase.from("MATCH").select("date").eq("id", id).single();
    const exDt = ex?.date ? new Date(ex.date) : new Date();
    const baseDate = d.date ?? exDt.toISOString().split("T")[0];
    const baseTime = d.time ?? exDt.toTimeString().substring(0, 5);
    patch.date = new Date(`${baseDate}T${baseTime}:00`).toISOString();
  }
  const { data, error } = await supabase
    .from("MATCH")
    .update(patch).eq("id", id)
    .select("id, torneo_id, home_team_id, away_team_id, home_score, away_score, date, status, place, referee")
    .single();
  raise(error);
  return toMatch(data!);
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase.from("MATCH").delete().eq("id", id);
  raise(error);
}

// ── standings → TORNEO_STANDING ───────────────────────────────────────────────

export async function getStandings(tournamentId: string): Promise<Standing[]> {
  const { data, error } = await supabase
    .from("TORNEO_STANDING")
    .select("team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points")
    .eq("torneo_id", tournamentId)
    .is("stage_id", null)
    .order("points", { ascending: false });
  raise(error);
  return (data ?? []).map(toStanding);
}

export async function updateStandings(tournamentId: string, rows: Standing[]): Promise<Standing[]> {
  await supabase
    .from("TORNEO_STANDING")
    .delete()
    .eq("torneo_id", tournamentId)
    .is("stage_id", null);

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("TORNEO_STANDING")
    .insert(
      rows.map((r) => ({
        torneo_id:       tournamentId,
        stage_id:        null,
        team_id:         r.teamId,
        played:          r.played,
        won:             r.won,
        drawn:           r.drawn,
        lost:            r.lost,
        goals_for:       r.goalsFor,
        goals_against:   r.goalsAgainst,
        goal_difference: r.goalDifference,
        points:          r.points,
      }))
    )
    .select("team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points");
  raise(error);
  return (data ?? []).map(toStanding);
}
