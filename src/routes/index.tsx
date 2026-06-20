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
    </AppShell>
  );
}
