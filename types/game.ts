import type { Database } from "@/database.types";

export type Game = Database["public"]["Tables"]["games"]["Row"];
export type UserGame = Database["public"]["Tables"]["user_games"]["Row"];
export type GameStatus = Database["public"]["Enums"]["game_status"];

export interface Player {
  user_id: string;
  status: GameStatus;
  first_name: string | null;
  last_name: string | null;
}

export interface GameWithPlayers extends Game {
  players: Player[];
}

export interface GameContextType {
  games: GameWithPlayers[];
  loading: boolean;
  error: Error | null;
  createGame: (game: Omit<Game, "id" | "created_at">) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
}
