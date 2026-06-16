import { Star, MapPin } from "lucide-react";
import type { Destination } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DestinationCard({
  destination,
  variant = "feature",
}: {
  destination: Destination;
  variant?: "feature" | "compact";
}) {
  if (variant === "compact") {
    return (
      <article className="group flex gap-3 rounded-2xl border border-border/60 bg-card p-2.5 shadow-sm">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          width={800}
          height={1024}
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="text-xs font-medium text-accent">
            {destination.category}
          </span>
          <h3 className="truncate text-sm font-bold text-foreground">
            {destination.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{destination.region}</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-foreground">
            <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4" />
            {destination.rating}
            <span className="font-normal text-muted-foreground">
              ({destination.reviews.toLocaleString()})
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative h-64 w-60 shrink-0 overflow-hidden rounded-3xl shadow-md",
      )}
    >
      <img
        src={destination.image}
        alt={destination.name}
        loading="lazy"
        width={800}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
        {destination.category}
      </span>
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-bold text-foreground backdrop-blur">
        <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4" />
        {destination.rating}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
        <h3 className="text-lg font-bold leading-tight">{destination.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
          <MapPin className="h-3.5 w-3.5" />
          {destination.region}
        </p>
      </div>
    </article>
  );
}
