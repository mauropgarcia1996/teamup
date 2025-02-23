"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, MapPin, Users, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/database.types";

type Game = Database["public"]["Tables"]["games"]["Row"];

export default function Page() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);
  const now = new Date();
  const upcomingGames = games.filter((game) => new Date(game.date) > now);
  const pastGames = games.filter((game) => new Date(game.date) <= now);

  const GameCard = ({ game }: { game: Game }) => (
    <Link key={game.id} href={`/game/${game.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {new Date(game.date).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Area 93
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {game.players_required} players needed
          </p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div>
      <main className="pt-16 pb-20">
        <section className="py-6 space-y-8">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading games...
            </p>
          ) : games.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No games available
            </p>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Upcoming Games</h2>
                {upcomingGames.length === 0 ? (
                  <p className="text-muted-foreground">
                    No upcoming games available
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {upcomingGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </div>

              {pastGames.length > 0 && (
                <Collapsible>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Past Games</h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle past games</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-4">
                    <div className="grid gap-4">
                      {pastGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          )}
        </section>
      </main>

      <div className="fixed bottom-5 right-5 md:right-1/2 md:translate-x-[208px]">
        <Link href="/game/create">
          <Button size="lg" className="rounded-full shadow-lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear partido
          </Button>
        </Link>
      </div>
    </div>
  );
}
