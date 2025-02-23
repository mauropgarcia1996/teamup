import {
  Client,
  PlaceAutocompleteResponse,
} from "@googlemaps/google-maps-services-js";
import { NextResponse } from "next/server";

const client = new Client({});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.GOOGLE_PLACES_API_KEY!,
        components: ["country:ar"],
        types: ["establishment", "geocode"],
      },
    });

    console.log("Google Places response:", response.data);

    const predictions = response.data.predictions.map((prediction) => ({
      place_id: prediction.place_id,
      description: prediction.description,
    }));

    console.log("Formatted predictions:", predictions);

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}
