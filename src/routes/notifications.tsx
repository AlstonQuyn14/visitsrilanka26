import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  LogIn,
  MapPin,
  Users,
  ShieldCheck,
  Loader2,
  CheckCheck,
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

type Category = "login" | "tracking" | "group";
type Tab = "All" | Category;

interface NotificationRow {
  id: string;
  category: Category;
  title: string;
  detail: string | null;
  is_read: boolean;
  created_at: string;
}

const categoryMeta: Record<
  Category,
  { icon: typeof LogIn; tone: string }
> = {
  login: { icon: LogIn, tone: "bg-primary/10 text-primary" },
  tracking: { icon: MapPin, tone: "bg-accent/10 text-accent" },
  group: { icon: Users, tone: "bg-chart-4/15 text-chart-4" },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
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
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    let on = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!on) return;
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("notifications")
        .select("id, category, title, detail, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!on) return;
      setRows((data as NotificationRow[]) ?? []);
      setLoading(false);

      // Live updates via realtime
      const channel = supabase
        .channel("notifications-feed")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setRows((prev) => [payload.new as NotificationRow, ...prev]);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as NotificationRow;
            setRows((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            );
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const cleanup = load();
    return () => {
      on = false;
      void cleanup.then((fn) => fn?.());
    };
  }, []);

  const filtered = useMemo(
    () => (active === "All" ? rows : rows.filter((r) => r.category === active)),
    [active, rows],
  );

  const unread = rows.filter((r) => !r.is_read);

  async function markAllRead() {
    if (unread.length === 0) return;
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in(
        "id",
        unread.map((r) => r.id),
      );
  }

  const tabs: { label: Tab; icon: typeof Bell }[] = [
    { label: "All", icon: Bell },
    { label: "login", icon: LogIn },
    { label: "tracking", icon: MapPin },
    { label: "group", icon: Users },
  ];

  const tabLabel: Record<Tab, string> = {
    All: "All",
    login: "Login",
    tracking: "Tracking",
    group: "Group",
  };

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
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
              Notifications
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Live
              </span>
            </p>
            <h1 className="mt-0.5 text-2xl font-bold text-foreground">
              What's happening
            </h1>
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <CheckCheck className="h-4 w-4" />
              Mark read
            </button>
          )}
        </div>
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
                {tabLabel[t.label]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 space-y-3 px-5">
        {loading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !signedIn ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-border py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              Sign in to see your notifications
            </p>
            <Link
              to="/auth"
              className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-border py-12 text-center">
            <Bell className="h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign-ins, live tracking and group trip updates will appear here.
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const meta = categoryMeta[n.category];
            const Icon = meta.icon;
            return (
              <article
                key={n.id}
                className={cn(
                  "flex gap-3 rounded-2xl border p-3.5 shadow-sm transition-colors",
                  n.is_read
                    ? "border-border/60 bg-card"
                    : "border-primary/30 bg-primary/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                    meta.tone,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {n.title}
                    </h3>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {relativeTime(n.created_at)}
                    </span>
                  </div>
                  {n.detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.detail}
                    </p>
                  )}
                </div>
                {!n.is_read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
              </article>
            );
          })
        )}
        {!loading && signedIn && filtered.length > 0 && (
          <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Updates stream in live as they happen
          </p>
        )}
      </section>
    </AppShell>
  );
}
