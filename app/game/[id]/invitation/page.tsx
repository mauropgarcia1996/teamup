"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function GameInvitation() {
  const params = useParams();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();
  // @ts-ignore
  const { game, loading, error, respondToInvitation, leaveGame } = useGame(
    // @ts-ignore
    params.id,
  );

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id ?? null);
    }
    getUser();
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Error fetching game:", error);
      router.push("/");
    }
  }, [error]);

  // @ts-ignore
  const isPlayerInGame = game?.players?.some(
    // @ts-ignore
    (player) =>
      player.user_id === currentUserId && player.status === "confirmed",
  );

  const handleLeave = async () => {
    if (!currentUserId) {
      toast.error("Login required", {
        description: "Please log in to leave games",
      });
      return;
    }

    try {
      await leaveGame();
      toast.success("Left game", {
        description: "You've successfully left the game",
      });
      router.push("/");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleResponse = async (status: "confirmed" | "rejected") => {
    if (!currentUserId) {
      toast.error("Login required", {
        description: "Please log in to respond to invitations",
      });
      return;
    }

    try {
      await respondToInvitation(status);
      if (status === "confirmed") {
        toast.success("Joined game", {
          description: "You've successfully joined the game",
        });
      } else {
        toast.success("Declined invitation", {
          description: "You've declined the invitation",
        });
      }
      router.push(status === "confirmed" ? `/game/${params.id}` : "/");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  if (loading) {
    return (
      <main className="pt-16 pb-20">
        <p className="text-center text-muted-foreground">
          Loading invitation...
        </p>
      </main>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <main className="pt-16 pb-20">
      <div className="text-center space-y-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="absolute top-4 left-5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          You&apos;ve been invited to join a game!
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
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
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm justify-center">
              <MapPin className="h-4 w-4" />
              {/* <span>{game.location}</span> */}
            </div>
            <div className="flex items-center gap-2 text-sm justify-center">
              <Users className="h-4 w-4" />
              <span>{game.players_required} players needed</span>
            </div>

            {isPlayerInGame ? (
              <div className="text-center pt-2">
                <p className="text-sm font-medium text-green-600 dark:text-green-500">
                  You're already part of this game!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You can view the game details or leave if you can't make it.
                </p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex gap-2">
            {isPlayerInGame ? (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/game/${params.id}`)}
                >
                  View Game
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLeave}
                >
                  Leave Game
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleResponse("rejected")}
                >
                  Decline
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleResponse("confirmed")}
                >
                  Accept
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
