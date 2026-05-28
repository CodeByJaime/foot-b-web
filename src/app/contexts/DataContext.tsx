import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Tournament, Team, Player, Match, Standing } from "../data/mockData";
import * as api from "../lib/api";

interface DataContextValue {
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  standings: Record<string, Standing[]>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getStandingsForTournament: (tournamentId: string) => Promise<Standing[]>;
  createTournament: (data: Omit<Tournament, "id">) => Promise<Tournament>;
  updateTournament: (id: string, data: Partial<Tournament>) => Promise<Tournament>;
  deleteTournament: (id: string) => Promise<void>;
  createTeam: (data: Omit<Team, "id">) => Promise<Team>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  createPlayer: (data: Omit<Player, "id">) => Promise<Player>;
  updatePlayer: (id: string, data: Partial<Player>) => Promise<Player>;
  deletePlayer: (id: string) => Promise<void>;
  createMatch: (data: Omit<Match, "id">) => Promise<Match>;
  updateMatch: (id: string, data: Partial<Match>) => Promise<Match>;
  deleteMatch: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, te, p, m] = await Promise.all([
        api.getTournaments(),
        api.getTeams(),
        api.getPlayers(),
        api.getMatches(),
      ]);
      setTournaments(t);
      setTeams(te);
      setPlayers(p);
      setMatches(m);

      // Load standings for all tournaments
      const standingsMap: Record<string, Standing[]> = {};
      await Promise.all(
        t.map(async (tournament) => {
          try {
            const s = await api.getStandings(tournament.id);
            if (s.length > 0) standingsMap[tournament.id] = s;
          } catch {
            // ignore missing standings
          }
        })
      );
      setStandings(standingsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getStandingsForTournament = async (tournamentId: string): Promise<Standing[]> => {
    if (standings[tournamentId]) return standings[tournamentId];
    const s = await api.getStandings(tournamentId);
    setStandings((prev) => ({ ...prev, [tournamentId]: s }));
    return s;
  };

  // Tournament mutations
  const createTournament = async (data: Omit<Tournament, "id">) => {
    const item = await api.createTournament(data);
    setTournaments((prev) => [...prev, item]);
    return item;
  };
  const updateTournament = async (id: string, data: Partial<Tournament>) => {
    const item = await api.updateTournament(id, data);
    setTournaments((prev) => prev.map((t) => (t.id === id ? item : t)));
    return item;
  };
  const deleteTournament = async (id: string) => {
    await api.deleteTournament(id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  // Team mutations
  const createTeam = async (data: Omit<Team, "id">) => {
    const item = await api.createTeam(data);
    setTeams((prev) => [...prev, item]);
    return item;
  };
  const updateTeam = async (id: string, data: Partial<Team>) => {
    const item = await api.updateTeam(id, data);
    setTeams((prev) => prev.map((t) => (t.id === id ? item : t)));
    return item;
  };
  const deleteTeam = async (id: string) => {
    await api.deleteTeam(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  // Player mutations
  const createPlayer = async (data: Omit<Player, "id">) => {
    const item = await api.createPlayer(data);
    setPlayers((prev) => [...prev, item]);
    return item;
  };
  const updatePlayer = async (id: string, data: Partial<Player>) => {
    const item = await api.updatePlayer(id, data);
    setPlayers((prev) => prev.map((p) => (p.id === id ? item : p)));
    return item;
  };
  const deletePlayer = async (id: string) => {
    await api.deletePlayer(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Match mutations
  const createMatch = async (data: Omit<Match, "id">) => {
    const item = await api.createMatch(data);
    setMatches((prev) => [...prev, item]);
    return item;
  };
  const updateMatch = async (id: string, data: Partial<Match>) => {
    const item = await api.updateMatch(id, data);
    setMatches((prev) => prev.map((m) => (m.id === id ? item : m)));
    return item;
  };
  const deleteMatch = async (id: string) => {
    await api.deleteMatch(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        tournaments,
        teams,
        players,
        matches,
        standings,
        loading,
        error,
        refreshData: loadAll,
        getStandingsForTournament,
        createTournament,
        updateTournament,
        deleteTournament,
        createTeam,
        updateTeam,
        deleteTeam,
        createPlayer,
        updatePlayer,
        deletePlayer,
        createMatch,
        updateMatch,
        deleteMatch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

const defaultContext: DataContextValue = {
  tournaments: [],
  teams: [],
  players: [],
  matches: [],
  standings: {},
  loading: false,
  error: null,
  refreshData: async () => {},
  getStandingsForTournament: async () => [],
  createTournament: async () => { throw new Error("No provider"); },
  updateTournament: async () => { throw new Error("No provider"); },
  deleteTournament: async () => {},
  createTeam: async () => { throw new Error("No provider"); },
  updateTeam: async () => { throw new Error("No provider"); },
  deleteTeam: async () => {},
  createPlayer: async () => { throw new Error("No provider"); },
  updatePlayer: async () => { throw new Error("No provider"); },
  deletePlayer: async () => {},
  createMatch: async () => { throw new Error("No provider"); },
  updateMatch: async () => { throw new Error("No provider"); },
  deleteMatch: async () => {},
};

export function useData() {
  return useContext(DataContext) ?? defaultContext;
}
