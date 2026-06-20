import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
}

/**
 * Geocode a free-text address into coordinates using the Google Maps
 * Geocoding API through the Lovable connector gateway.
 */
export const geocodeAddress = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || !("address" in data)) {
      throw new Error("Invalid input");
    }
    const address = String((data as { address: unknown }).address ?? "").trim();
    if (!address) throw new Error("Address is required");
    return { address: address.slice(0, 200) };
  })
  .handler(async ({ data }): Promise<GeocodeResult> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      throw new Error("Maps connector is not configured");
    }

    // Bias results to Sri Lanka for better accuracy on local place names.
    const url =
      `${GATEWAY_URL}/maps/api/geocode/json` +
      `?address=${encodeURIComponent(data.address)}` +
      `&region=lk&components=country:LK`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Geocoding failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      status: string;
      results?: Array<{
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    const first = json.results?.[0];
    if (json.status !== "OK" || !first) {
      throw new Error(`No location found for "${data.address}"`);
    }

    return {
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
      formatted: first.formatted_address,
    };
  });
