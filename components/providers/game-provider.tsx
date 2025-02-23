import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Game, GameWithPlayers, GameContextType } from "@/types/game";
import { useAuth } from "./auth-provider";

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    async function loadGames() {
      try {
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("*")
          .order("date", { ascending: true });

        if (gamesError) throw gamesError;

        const gamesWithPlayers = await Promise.all(
          gamesData.map(async (game) => {
            const { data: playersData, error: playersError } = await supabase
              .from("user_games")
              .select(
                `
                user_id,
                status,
                users (
                  first_name,
                  last_name
                )
              `,
              )
              .eq("game_id", game.id);

            if (playersError) throw playersError;

            return {
              ...game,
              players: playersData.map((player) => ({
                user_id: player.user_id,
                status: player.status,
                first_name: player.users?.first_name ?? null,
                last_name: player.users?.last_name ?? null,
              })),
            };
          }),
        );

        setGames(gamesWithPlayers);
        setLoading(false);
      } catch (error) {
        console.error("Error loading games:", error);
        setError(error as Error);
        setLoading(false);
      }
    }

    loadGames();

    // Subscribe to changes
    const gamesSub = supabase
      .channel("games")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        loadGames,
      )
      .subscribe();

    return () => {
      gamesSub.unsubscribe();
    };
  }, [user]);

  const createGame = async (game: Omit<Game, "id" | "created_at">) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("games")
      .insert(game)
      .select()
      .single();

    if (error) throw error;

    // Auto-join created game
    await joinGame(data.id);
  };

  const joinGame = async (gameId: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("user_games").insert({
      game_id: gameId,
      user_id: user.id,
      status: "confirmed",
    });

    if (error) throw error;
  };

  const leaveGame = async (gameId: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("user_games")
      .delete()
      .eq("game_id", gameId)
      .eq("user_id", user.id);

    if (error) throw error;
  };

  return (
    <GameContext.Provider
      value={{
        games,
        loading,
        error,
        createGame,
        joinGame,
        leaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
