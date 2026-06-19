import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { sriLankaEvents, eventCategories, type EventCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Main Events & Holidays — Serendib" },
      {
        name: "description",
        content:
          "Discover Sri Lanka's main events, festivals and public holidays — Vesak, Poson, Poya days, Christmas, Hajj, Independence Day, Sinhala & Tamil New Year and more.",
      },
      { property: "og:title", content: "Main Events & Holidays — Serendib" },
      {
        property: "og:description",
        content:
          "All the religious, cultural and national events happening across Sri Lanka throughout the year.",
      },
    ],
  }),
  component: Events,
});

function Events() {
  const [active, setActive] = useState<EventCategory | "All">("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? sriLankaEvents
        : sriLankaEvents.filter((e) => e.category === active),
    [active],
  );

  return (
    <AppShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <CalendarDays className="h-4 w-4" />
          Main Events
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">
          Events & Holidays
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Religious, cultural & national celebrations across Sri Lanka.
        </p>
      </header>

      {/* Category filter */}
      <section className="mt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          {eventCategories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Events list */}
      <section className="mt-5 space-y-3 px-5">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </p>
        {filtered.map((event) => (
          <article
            key={event.id}
            className="flex gap-3 rounded-3xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl">
              {event.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-bold leading-tight text-foreground">
                  {event.name}
                </h2>
                {event.publicHoliday && (
                  <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    Public holiday
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-primary">
                {event.date} · {event.category}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
