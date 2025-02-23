"use client";

import { PlaceAutocomplete } from "@/components/place-autocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  datetime: z.date({
    required_error: "Please select a date and time",
  }),
  place: z.object({
    name: z.string(),
    address: z.string(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  players_required: z.number().min(1, "Number of players is required"),
});

export default function CreateGame() {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datetime: undefined,
      place: {
        name: "",
        address: "",
        location: {
          lat: 0,
          lng: 0,
        },
      },
      players_required: 2,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const date = new Date(data.datetime);
      date.setMinutes(0, 0, 0);

      const { data: game, error } = await supabase
        .from("games")
        .insert([
          {
            date: date.toISOString(),
            players_required: data.players_required,
            location: {
              name: data.place.name,
              address: data.place.address,
              lat: data.place.location.lat,
              lng: data.place.location.lng,
            },
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success("Game created", {
        description: "Your game has been created successfully",
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  }

  return (
    <main className="pt-16 pb-6">
      <div className="flex items-center py-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-xl font-bold ml-4">Crear partido</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalles del partido</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label>Location</Label>
                    <FormControl>
                      <PlaceAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="datetime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label>Date and Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP 'at' HH:00")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="border-t p-3">
                          <select
                            className="w-full rounded-md border p-2"
                            value={field.value ? field.value.getHours() : ""}
                            onChange={(e) => {
                              const newDate = field.value
                                ? new Date(field.value)
                                : new Date();
                              newDate.setHours(
                                parseInt(e.target.value),
                                0,
                                0,
                                0,
                              );
                              field.onChange(newDate);
                            }}
                          >
                            <option value="">Select time</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}:00
                              </option>
                            ))}
                          </select>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="players_required"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label>Number of Players Needed</Label>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create Game
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
