"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Place {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface PlaceAutocompleteProps {
  value?: Place;
  onChange: (place: Place | undefined) => void;
}

export function PlaceAutocomplete({ value, onChange }: PlaceAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [predictions, setPredictions] = React.useState<
    Array<{
      place_id: string;
      description: string;
    }>
  >([]);

  const debouncedSearch = useDebounce(inputValue, 300);

  React.useEffect(() => {
    async function searchPlaces() {
      if (!debouncedSearch) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(debouncedSearch)}`,
        );
        const data = await response.json();
        if (data && Array.isArray(data.predictions)) {
          setPredictions(data.predictions);
        }
      } catch (error) {
        console.error("Error searching places:", error);
      } finally {
        setIsLoading(false);
      }
    }

    searchPlaces();
  }, [debouncedSearch]);

  const handleSelect = React.useCallback(
    async (placeId: string, description: string) => {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(placeId)}`,
        );
        const data = await response.json();

        const place: Place = {
          name: data.name,
          address: data.formatted_address,
          location: {
            lat: data.geometry.location.lat,
            lng: data.geometry.location.lng,
          },
        };

        onChange(place);
        setOpen(false);
      } catch (error) {
        console.error("Error fetching place details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value?.name || "Search for a place..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 fixed left-4 right-4 md:relative md:left-0 md:right-0 md:w-full"
        sideOffset={8}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search places..."
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No places found."}
            </CommandEmpty>
            <CommandGroup>
              {predictions.map((prediction) => (
                <CommandItem
                  key={prediction.place_id}
                  value={prediction.place_id}
                  onSelect={(value) =>
                    handleSelect(value, prediction.description)
                  }
                  disabled={isLoadingDetails}
                  className={cn(
                    isLoadingDetails && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {prediction.description}
                  {value?.name === prediction.description ? (
                    isLoadingDetails ? (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="ml-auto h-4 w-4" />
                    )
                  ) : (
                    <Check className="ml-auto h-4 w-4 opacity-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
