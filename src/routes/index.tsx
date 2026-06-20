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
      { title: "Serendib — Explore Sri Lanka" },
      {
        name: "description",
        content:
          "Your all-in-one Sri Lanka travel companion: discover destinations, check local weather, book rides, find guides and stay safe.",
      },
      { property: "og:title", content: "Serendib — Explore Sri Lanka" },
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
      <h1 className="sr-only">Serendib — Explore Sri Lanka</h1>
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
        <div className="grid grid-cols-2 gap-3 px-5">
          {filteredActivities.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{a.emoji}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                  {a.category}
                </span>
              </div>
              <h3 className="text-sm font-bold leading-tight text-foreground">
                {a.name}
              </h3>
              <p className="text-xs text-muted-foreground">{a.tagline}</p>
              <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] font-medium text-accent">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{a.region}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
