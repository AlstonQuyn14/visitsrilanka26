import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HomeHeader } from "@/components/home/HomeHeader";
import { WeatherCard } from "@/components/home/WeatherCard";
import { QuickActions } from "@/components/home/QuickActions";
import { SectionHeader } from "@/components/SectionHeader";
import { DestinationCard } from "@/components/DestinationCard";
import { destinations, activities } from "@/lib/data";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visit Sri Lanka — Explore Sri Lanka" },
      {
        name: "description",
        content:
          "Your all-in-one Sri Lanka travel companion: discover destinations, check local weather, book rides, find guides and stay safe.",
      },
      { property: "og:title", content: "Visit Sri Lanka — Explore Sri Lanka" },
      {
        property: "og:description",
        content:
          "Discover destinations, book transport, find verified guides and plan your Sri Lanka trip.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = destinations.filter((d) => d.popular);
  const recommended = destinations.slice(2, 6);

  const activityTabs = useMemo(
    () => ["All", ...Array.from(new Set(activities.map((a) => a.category)))],
    [],
  );
  const [activeTab, setActiveTab] = useState("All");
  const filteredActivities =
    activeTab === "All"
      ? activities
      : activities.filter((a) => a.category === activeTab);


  return (
    <AppShell>
      <h1 className="sr-only">Visit Sri Lanka — Explore Sri Lanka</h1>
      <HomeHeader />

      <section className="mt-6">
        <QuickActions />
      </section>

      <section className="mt-6">
        <WeatherCard />
      </section>

      <section className="mt-7 space-y-4">
        <SectionHeader title="Popular destinations" action="See all" to="/explore" />
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-1">
          {popular.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </section>

      <section className="mt-7 space-y-4">
        <SectionHeader title="Recommended for you" action="See all" to="/explore" />
        <div className="space-y-3 px-5">
          {recommended.map((d) => (
            <DestinationCard key={d.id} destination={d} variant="compact" />
          ))}
        </div>
      </section>
      <section className="mt-7 space-y-4">
        <SectionHeader title="Extracurricular" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          {activityTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div class="grid grid-cols-2 gap-3 px-5">
          {filteredActivities.map((a) => (
            <article
              key={a.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            >
              <div className="relative h-28 w-full">
                <img
                  src={a.image}
                  alt={a.name}
                  loading="lazy"
                  width={640}
                  height={512}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                  {a.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <h3 className="text-sm font-bold leading-tight text-foreground">
                  {a.name}
                </h3>
                <p className="text-xs text-muted-foreground">{a.tagline}</p>
                <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] font-medium text-accent">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{a.region}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

      </section>
    </AppShell>
  );
}
