import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  LogIn,
  MapPin,
  Users,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Stay updated with your login history, live vehicle tracking alerts and group trip activity on Visit Sri Lanka.",
      },
      { property: "og:title", content: "Notifications — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Your login history, tracking system alerts and group trip notifications in one place.",
      },
    ],
  }),
  component: Notifications,
});

type Tab = "All" | "Login" | "Tracking" | "Group";

interface Note {
  id: string;
  tab: Exclude<Tab, "All">;
  icon: typeof LogIn;
  title: string;
  detail: string;
  time: string;
  tone: "primary" | "accent" | "nature" | "sun";
}

const toneClasses: Record<Note["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  nature: "bg-chart-3/10 text-chart-3",
  sun: "bg-chart-4/15 text-chart-4",
};

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function Notifications() {
  const [active, setActive] = useState<Tab>("All");
  const [lastLogin, setLastLogin] = useState<string>("Recently");

  useEffect(() => {
    let on = true;
    supabase.auth.getUser().then(({ data }) => {
      const at = data.user?.last_sign_in_at;
      if (on && at) setLastLogin(relativeTime(new Date(at)));
    });
    return () => {
      on = false;
    };
  }, []);

  const notes = useMemo<Note[]>(
    () => [
      {
        id: "login-current",
        tab: "Login",
        icon: LogIn,
        title: "New sign-in on this device",
        detail: "Chrome · Colombo, Sri Lanka",
        time: lastLogin,
        tone: "primary",
      },
      {
        id: "login-device",
        tab: "Login",
        icon: Smartphone,
        title: "Login from iPhone",
        detail: "Safari · Galle · Approved by you",
        time: "Yesterday",
        tone: "primary",
      },
      {
        id: "login-secure",
        tab: "Login",
        icon: ShieldCheck,
        title: "Password verified",
        detail: "Your account security check passed",
        time: "2 days ago",
        tone: "nature",
      },
      {
        id: "track-live",
        tab: "Tracking",
        icon: MapPin,
        title: "Live vehicle tracking started",
        detail: "Tuk Tuk · Ella → Nine Arch Bridge · ETA 18 min",
        time: "5 min ago",
        tone: "accent",
      },
      {
        id: "track-arrived",
        tab: "Tracking",
        icon: MapPin,
        title: "You're almost there",
        detail: "200 m from your destination",
        time: "12 min ago",
        tone: "accent",
      },
      {
        id: "track-share",
        tab: "Tracking",
        icon: ShieldCheck,
        title: "Trip shared with emergency contact",
        detail: "Live location link sent successfully",
        time: "20 min ago",
        tone: "nature",
      },
      {
        id: "group-join",
        tab: "Group",
        icon: Users,
        title: "Aisha joined your group trip",
        detail: "South Coast Adventure · 4 members now",
        time: "1 hr ago",
        tone: "sun",
      },
      {
        id: "group-expense",
        tab: "Group",
        icon: Users,
        title: "New shared expense added",
        detail: "Dinner in Galle · LKR 8,400 split 4 ways",
        time: "3 hr ago",
        tone: "sun",
      },
      {
        id: "group-location",
        tab: "Group",
        icon: MapPin,
        title: "Sahan shared live location",
        detail: "Group members can now see the map",
        time: "Yesterday",
        tone: "accent",
      },
    ],
    [lastLogin],
  );

  const tabs: { label: Tab; icon: typeof Bell }[] = [
    { label: "All", icon: Bell },
    { label: "Login", icon: LogIn },
    { label: "Tracking", icon: MapPin },
    { label: "Group", icon: Users },
  ];

  const filtered =
    active === "All" ? notes : notes.filter((n) => n.tab === active);

  return (
    <AppShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Home
        </Link>
        <p className="text-xs font-medium text-accent">Notifications</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">
          What's happening
        </h1>
      </header>

      <section className="mt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          {tabs.map((t) => {
            const isActive = active === t.label;
            return (
              <button
                key={t.label}
                onClick={() => setActive(t.label)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 space-y-3 px-5">
        {filtered.map((n) => (
          <article
            key={n.id}
            className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm"
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                toneClasses[n.tone],
              )}
            >
              <n.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{n.title}</h3>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {n.time}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
