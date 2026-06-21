import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { currentWeather } from "@/lib/data";
import { getLiveWeather, type LiveWeather } from "@/lib/weather.functions";
import { Spinner } from "@/components/ui/spinner";

const weatherIcons: Record<string, LucideIcon> = {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
};

type Coords = { lat: number; lng: number };

export function WeatherCard() {
  const fetchWeather = useServerFn(getLiveWeather);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoDenied(true),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["live-weather", coords?.lat, coords?.lng],
    queryFn: () => fetchWeather({ data: coords! }),
    enabled: !!coords,
    staleTime: 10 * 60 * 1000,
  });

  const fallback: LiveWeather = { ...currentWeather };
  const w = data ?? fallback;
  const Icon = weatherIcons[w.icon] ?? Sun;
  const loading = !geoDenied && (isLoading || (!coords && !data));

  return (
    <div className="mx-5 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-lg shadow-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1 text-xs font-medium text-primary-foreground/80">
            {!geoDenied && coords && <MapPin className="h-3 w-3" />}
            {w.location}
          </p>
          <div className="mt-1 flex items-end gap-1">
            {loading ? (
              <Spinner className="mb-2 h-9 w-9 text-primary-foreground" />
            ) : (
              <span className="text-5xl font-bold leading-none">{w.tempC}°</span>
            )}
            <span className="mb-1 text-sm font-medium">{w.condition}</span>
          </div>
          <p className="mt-1 text-xs text-primary-foreground/80">
            H:{w.high}° · L:{w.low}° · Great day to explore
          </p>
        </div>
        <Icon className="h-14 w-14 text-chart-4 drop-shadow" />
      </div>
      <div className="mt-4 flex gap-2">
        <Chip icon={<Droplets className="h-4 w-4" />} label="Humidity 78%" />
        <Chip icon={<Wind className="h-4 w-4" />} label="Wind 12 km/h" />
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
      {icon}
      {label}
    </span>
  );
}
