import { Sun, Droplets, Wind } from "lucide-react";
import { currentWeather } from "@/lib/data";

export function WeatherCard() {
  const w = currentWeather;
  return (
    <div className="mx-5 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-lg shadow-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-primary-foreground/80">
            {w.location}
          </p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-5xl font-bold leading-none">{w.tempC}°</span>
            <span className="mb-1 text-sm font-medium">{w.condition}</span>
          </div>
          <p className="mt-1 text-xs text-primary-foreground/80">
            H:{w.high}° · L:{w.low}° · Great day to explore
          </p>
        </div>
        <Sun className="h-14 w-14 text-chart-4 drop-shadow" />
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
