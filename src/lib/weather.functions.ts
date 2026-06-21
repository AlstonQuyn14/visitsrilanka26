import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export interface LiveWeather {
  location: string;
  tempC: number;
  condition: string;
  high: number;
  low: number;
  icon: string;
}

function conditionToIcon(type: string): string {
  const t = type.toUpperCase();
  if (t.includes("THUNDER")) return "CloudLightning";
  if (t.includes("RAIN") || t.includes("SHOWER")) return "CloudRain";
  if (t.includes("SNOW")) return "CloudSnow";
  if (t.includes("CLOUD") || t.includes("OVERCAST")) return "Cloud";
  if (t.includes("FOG") || t.includes("MIST") || t.includes("HAZE")) return "CloudFog";
  if (t.includes("WIND")) return "Wind";
  return "Sun";
}

/**
 * Fetch real-time weather for a coordinate using Google's Weather API and
 * resolve a friendly place name via reverse geocoding, through the Lovable
 * Google Maps connector gateway.
 */
export const getLiveWeather = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    const d = data as { lat?: unknown; lng?: unknown };
    const lat = Number(d.lat);
    const lng = Number(d.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Valid lat/lng are required");
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Coordinates out of range");
    }
    return { lat, lng };
  })
  .handler(async ({ data }): Promise<LiveWeather> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      throw new Error("Weather connector is not configured");
    }
    const headers = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
    };

    const coord = `location.latitude=${data.lat}&location.longitude=${data.lng}`;

    const [currentRes, forecastRes, geoRes] = await Promise.all([
      fetch(`${GATEWAY_URL}/weather/v1/currentConditions:lookup?${coord}`, { headers }),
      fetch(`${GATEWAY_URL}/weather/v1/forecast/days:lookup?${coord}&days=1`, { headers }),
      fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?latlng=${data.lat},${data.lng}&result_type=locality|administrative_area_level_1|country`,
        { headers },
      ),
    ]);

    if (!currentRes.ok) {
      const body = await currentRes.text();
      throw new Error(`Weather lookup failed (${currentRes.status}): ${body.slice(0, 200)}`);
    }

    const current = (await currentRes.json()) as {
      temperature?: { degrees?: number };
      weatherCondition?: { description?: { text?: string }; type?: string };
    };

    let high = NaN;
    let low = NaN;
    if (forecastRes.ok) {
      const forecast = (await forecastRes.json()) as {
        forecastDays?: Array<{
          maxTemperature?: { degrees?: number };
          minTemperature?: { degrees?: number };
        }>;
      };
      const day = forecast.forecastDays?.[0];
      high = Number(day?.maxTemperature?.degrees);
      low = Number(day?.minTemperature?.degrees);
    }

    let location = "Your location";
    if (geoRes.ok) {
      const geo = (await geoRes.json()) as {
        results?: Array<{
          address_components: Array<{ long_name: string; types: string[] }>;
        }>;
      };
      const components = geo.results?.[0]?.address_components ?? [];
      const locality = components.find((c) => c.types.includes("locality"))?.long_name;
      const area = components.find((c) =>
        c.types.includes("administrative_area_level_1"),
      )?.long_name;
      const country = components.find((c) => c.types.includes("country"))?.long_name;
      location = [locality ?? area, country].filter(Boolean).join(", ") || location;
    }

    const tempC = Math.round(Number(current.temperature?.degrees));
    const conditionType = current.weatherCondition?.type ?? "";

    return {
      location,
      tempC: Number.isFinite(tempC) ? tempC : 0,
      condition: current.weatherCondition?.description?.text ?? "—",
      high: Number.isFinite(high) ? Math.round(high) : tempC,
      low: Number.isFinite(low) ? Math.round(low) : tempC,
      icon: conditionToIcon(conditionType),
    };
  });
