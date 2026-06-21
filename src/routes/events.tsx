import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Heart, HandHeart, X, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";
import { sriLankaEvents, eventCategories, type EventCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Main Events & Holidays — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Discover Sri Lanka's main events, festivals and public holidays — and donate to religious places, cancer hospitals and causes that help Sri Lanka grow.",
      },
      { property: "og:title", content: "Main Events & Holidays — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "All the religious, cultural and national events happening across Sri Lanka throughout the year — plus donate to good causes.",
      },
    ],
  }),
  component: Events,
});

interface Cause {
  id: string;
  emoji: string;
  name: string;
  description: string;
  accent: string;
}

const causes: Cause[] = [
  {
    id: "religious",
    emoji: "🛕",
    name: "Religious Places",
    description:
      "Help preserve temples, churches, mosques and kovils across the island.",
    accent: "bg-primary/10 text-primary",
  },
  {
    id: "cancer",
    emoji: "🎗️",
    name: "Cancer Hospitals",
    description:
      "Support treatment, equipment and care for cancer patients in Sri Lanka.",
    accent: "bg-accent/15 text-accent",
  },
  {
    id: "growth",
    emoji: "🌱",
    name: "Growth of Sri Lanka",
    description:
      "Fund education, infrastructure and community development projects.",
    accent: "bg-chart-3/15 text-chart-3",
  },
  {
    id: "wildlife",
    emoji: "🐘",
    name: "Wildlife & Nature",
    description:
      "Protect elephants, forests and the country's natural heritage.",
    accent: "bg-chart-4/15 text-chart-4",
  },
  {
    id: "children",
    emoji: "📚",
    name: "Children's Education",
    description:
      "Give books, meals and scholarships to children in need.",
    accent: "bg-chart-5/15 text-chart-5",
  },
  {
    id: "disaster",
    emoji: "🤝",
    name: "Disaster Relief",
    description:
      "Aid families affected by floods, landslides and emergencies.",
    accent: "bg-primary/10 text-primary",
  },
];

const presetAmounts = [1000, 2500, 5000, 10000];

function Events() {
  const [active, setActive] = useState<EventCategory | "All">("All");
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);

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

      {/* Donations */}
      <section className="mt-5 px-5">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/10 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <HandHeart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Support a Cause</h2>
              <p className="text-xs text-muted-foreground">
                Give back to the places & people of Sri Lanka.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {causes.map((cause) => (
              <button
                key={cause.id}
                onClick={() => setSelectedCause(cause)}
                className="flex flex-col items-start gap-1.5 rounded-2xl border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary"
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl text-lg",
                    cause.accent,
                  )}
                >
                  {cause.emoji}
                </span>
                <span className="text-xs font-bold leading-tight text-foreground">
                  {cause.name}
                </span>
                <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {cause.description}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Heart className="h-3 w-3" />
                  Donate
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="mt-6">
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

      {selectedCause && (
        <DonateSheet cause={selectedCause} onClose={() => setSelectedCause(null)} />
      )}
    </AppShell>
  );
}

function DonateSheet({ cause, onClose }: { cause: Cause; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(presetAmounts[1]);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-border/60 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-foreground">Thank you!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your donation of Rs. {finalAmount.toLocaleString()} to {cause.name} makes a difference. 🙏
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pr-8">
              <span
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl text-2xl",
                  cause.accent,
                )}
              >
                {cause.emoji}
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">{cause.name}</h3>
                <p className="text-xs text-muted-foreground">{cause.description}</p>
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold text-foreground">Choose amount (LKR)</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {presetAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                  className={cn(
                    "rounded-2xl border py-2.5 text-sm font-semibold transition-colors",
                    !custom && amount === a
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card text-foreground",
                  )}
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-foreground">Or enter your own</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-3 py-2.5">
                <span className="text-sm font-semibold text-muted-foreground">Rs.</span>
                <input
                  type="number"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <button
              disabled={!finalAmount || finalAmount < 1}
              onClick={() => setDone(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Heart className="h-4 w-4" />
              Donate Rs. {(finalAmount || 0).toLocaleString()}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              100% of your donation supports the chosen cause.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
