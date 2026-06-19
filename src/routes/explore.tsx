import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, SlidersHorizontal, Languages } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DestinationCard } from "@/components/DestinationCard";
import { Icon } from "@/components/Icon";
import { destinations, placeCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Places — Serendib" },
      {
        name: "description",
        content:
          "Browse Sri Lanka's beaches, historical sites, temples, nature reserves, hotels and dining on the Serendib Places Explorer.",
      },
      { property: "og:title", content: "Explore Places — Serendib" },
      {
        property: "og:description",
        content:
          "Browse beaches, historical sites, temples, nature reserves, hotels and dining across Sri Lanka.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [active, setActive] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = destinations.filter((d) => {
    const matchCat = active === "All" || d.category === active;
    const matchQuery =
      query.trim() === "" ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.region.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <AppShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium text-accent">Places Explorer</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">
          Discover Sri Lanka
        </h1>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search places & regions…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            aria-label="Filters"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Map preview + Translator */}
      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        <Link
          to="/map"
          className="relative block h-32 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-chart-3/10 to-accent/15"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 30%, var(--color-primary) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, var(--color-accent) 0 2px, transparent 3px), radial-gradient(circle at 50% 80%, var(--color-chart-3) 0 2px, transparent 3px)",
              backgroundSize: "100% 100%",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <MapPin className="h-4 w-4 text-accent" />
              Live 3D map
            </p>
            <span className="w-fit rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              Open map
            </span>
          </div>
        </Link>

        <Link
          to="/translate"
          className="relative block h-32 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-accent/15 via-chart-4/10 to-primary/15"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Languages className="h-4 w-4 text-primary" />
              Translator
            </p>
            <span className="w-fit rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-accent shadow-sm">
              Open translator
            </span>
          </div>
        </Link>
      </section>


      {/* Categories */}
      <section className="mt-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          {placeCategories.map((cat) => {
            const isActive = active === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActive(cat.label)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground",
                )}
              >
                <Icon name={cat.icon} className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section className="mt-5 px-5">
        <p className="mb-3 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "place" : "places"} found
        </p>
        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-border py-12 text-center">
            <p className="text-sm font-medium text-foreground">No places found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} variant="compact" />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
