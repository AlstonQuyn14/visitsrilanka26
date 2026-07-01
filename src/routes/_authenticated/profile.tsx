import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import {
  User,
  LogOut,
  Loader2,
  Pencil,
  Check,
  X,
  Receipt,
  Heart,
  Info,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

type Payment = {
  id: string;
  kind: "order" | "donation";
  title: string;
  subtitle: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProfilePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    display_name: string | null;
    email: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setPaymentsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      setProfile({
        display_name:
          data?.display_name ?? user.user_metadata?.display_name ?? null,
        email: user.email ?? null,
      });
      setLoading(false);

      const [{ data: orders }, { data: donations }] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, order_type, item_name, amount_cents, currency, status, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("donations")
          .select(
            "id, cause_name, amount_cents, currency, status, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const merged: Payment[] = [
        ...(orders ?? []).map((o: any) => ({
          id: o.id,
          kind: "order" as const,
          title: o.item_name ?? "Booking",
          subtitle:
            o.order_type === "transport"
              ? "Ride booking"
              : o.order_type === "hotel"
                ? "Hotel stay"
                : o.order_type === "guide"
                  ? "Tour guide"
                  : o.order_type === "grocery"
                    ? "Grocery order"
                    : "Order",
          amountCents: o.amount_cents ?? 0,
          currency: o.currency ?? "USD",
          status: o.status ?? "completed",
          createdAt: o.created_at,
        })),
        ...(donations ?? []).map((d: any) => ({
          id: d.id,
          kind: "donation" as const,
          title: d.cause_name ?? "Donation",
          subtitle: "Support a cause",
          amountCents: d.amount_cents ?? 0,
          currency: d.currency ?? "USD",
          status: d.status ?? "completed",
          createdAt: d.created_at,
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setPayments(merged);
      setPaymentsLoading(false);
    }
    fetchAll();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function startEdit() {
    setNameInput(profile?.display_name ?? "");
    setSaveError(null);
    setEditing(true);
  }

  async function saveName() {
    if (!userId) return;
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setSaveError("Username can't be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setSaveError("Could not save. Please try again.");
      return;
    }
    setProfile((p) => (p ? { ...p, display_name: trimmed } : p));
    setEditing(false);
  }

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "User";

  return (
    <AppShell>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-foreground truncate">
                  {name}
                </h1>
                {profile?.email && (
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.email}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Username editor */}
        {!loading && (
          <section className="mt-8">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Username
            </h2>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter a username"
                    autoFocus
                    className="w-full rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  {saveError && (
                    <p className="text-xs text-destructive">{saveError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={saveName}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-foreground">
                    {profile?.display_name ?? "Not set"}
                  </span>
                  <button
                    onClick={startEdit}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Payment history */}
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Payment history
          </h2>
          {paymentsLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Loading payments...
              </span>
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center">
              <Receipt className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No payments yet. Your bookings and donations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={`${p.kind}-${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      p.kind === "donation"
                        ? "bg-accent/15 text-accent"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {p.kind === "donation" ? (
                      <Heart className="h-5 w-5" />
                    ) : (
                      <Receipt className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.subtitle} · {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatAmount(p.amountCents, p.currency)}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-medium capitalize",
                        p.status === "completed"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {p.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        <section className="mt-8">
          <Link
            to="/about"
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">About</p>
              <p className="text-xs text-muted-foreground">Learn more about this app</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </section>

        {/* Sign out */}
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
