import { getGame } from "@/api/game";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGame(gameId: number) {
  const supabase = createClient();

  const {
    data: game,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGame(gameId),
  });

  const joinGame = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Must be logged in to join a game");
    }

    const { error } = await supabase.from("user_games").insert({
      game_id: gameId,
      user_id: session.session.user.id,
      status: "confirmed",
    });

    if (error) throw error;
  };

  const leaveGame = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Must be logged in to leave a game");
    }

    const { error } = await supabase
      .from("user_games")
      .delete()
      .eq("game_id", gameId)
      .eq("user_id", session.session.user.id);

    if (error) throw error;
  };

  const respondToInvitation = async (status: "confirmed" | "rejected") => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Must be logged in to respond to invitation");
    }

    const { error } = await supabase.from("user_games").upsert({
      game_id: gameId,
      user_id: session.session.user.id,
      status,
    });

    if (error) throw error;
  };

  const shareGame = async () => {
    const inviteLink = `${window.location.origin}/game/${gameId}/invitation`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Link copied!", {
        description: "Share this link with players you want to invite",
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link", {
        description: "Please try again",
      });
    }
  };

  return {
    game,
    isLoading,
    isError,
    joinGame,
    leaveGame,
    shareGame,
    respondToInvitation,
  };
}
