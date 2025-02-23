"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { ArrowLeft, Calendar, MapPin, Share2, Users } from "lucide-react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/loading";
import { useAuth } from "@/hooks/use-auth";
export default function GameView() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  if (!params.id) {
    router.replace("/");
  }

  const { game, isLoading, joinGame, leaveGame, shareGame } = useGame(
    parseInt(params.id as string),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!game) {
    return redirect("/");
  }

  return (
    <main className="pt-16 pb-20">
      <div className="flex items-center justify-between h-14">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" className="gap-2" onClick={shareGame}>
          <Share2 className="h-4 w-4" />
          Invite Players
        </Button>
      </div>
      <Card className="mt-6">
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Area 93</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>{game.players_required} players needed</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Players ({game.users.length})
            </h3>
            <div className="space-y-1">
              {game.users.map(({ user_id, status, user }) => (
                <div
                  key={user_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {game.users.some((gameUser) => gameUser.user_id === user?.id) ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => leaveGame()}
            >
              Leave Game
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={() => joinGame()}
            >
              Join Game
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
