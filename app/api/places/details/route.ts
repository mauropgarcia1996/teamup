import { Client } from "@googlemaps/google-maps-services-js";
import { NextResponse } from "next/server";

const client = new Client({});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 },
    );
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_PLACES_API_KEY!,
        fields: ["formatted_address", "geometry", "name"],
      },
    });

    return NextResponse.json(response.data.result);
  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 },
    );
  }
}
