import { createClient } from "@/utils/supabase/client";
import { QueryData } from "@supabase/supabase-js";

export async function getGame(gameId: number) {
  const supabase = createClient();

  const query = supabase
    .from("games")
    .select(
      "*, users:user_games!game_id (user_id, status, user:users!user_id (first_name, last_name))",
    )
    .eq("id", gameId)
    .single();

  type GameWithPlayers = QueryData<typeof query>;

  const { data, error } = await query;

  if (error) throw error;

  return data as GameWithPlayers;
}
