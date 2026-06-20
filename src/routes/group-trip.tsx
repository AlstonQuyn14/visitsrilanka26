import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  Wallet,
  IdCard,
  Trash2,
  PiggyBank,
  Check,
  Plane,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/group-trip")({
  head: () => ({
    meta: [
      { title: "Group Trip — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Plan a group trip in Sri Lanka. Add members, set a shared budget and split it equally across travellers with Visit Sri Lanka.",
      },
      { property: "og:title", content: "Group Trip — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Add members, set your trip budget and split costs equally across your travel group.",
      },
    ],
  }),
  component: GroupTrip,
});

interface Member {
  id: string;
  name: string;
  passport: string;
}

let counter = 0;
const newMember = (): Member => ({
  id: `m-${Date.now()}-${counter++}`,
  name: "",
  passport: "",
});

function GroupTrip() {
  const [members, setMembers] = useState<Member[]>([newMember(), newMember()]);
  const [budget, setBudget] = useState<string>("");

  const budgetValue = Number(budget) || 0;
  const completeMembers = members.filter(
    (m) => m.name.trim() && m.passport.trim(),
  );
  const shareCount = completeMembers.length;
  const perPerson = shareCount > 0 ? budgetValue / shareCount : 0;

  const canSummarise = budgetValue > 0 && shareCount >= 2;

  const formatLKR = (n: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(n);

  const updateMember = (id: string, patch: Partial<Member>) =>
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );

  const addMember = () => setMembers((prev) => [...prev, newMember()]);
  const removeMember = (id: string) =>
    setMembers((prev) =>
      prev.length > 1 ? prev.filter((m) => m.id !== id) : prev,
    );

  const [shared, setShared] = useState(false);
  const shareWithGroup = () => {
    void recordNotification(
      "group",
      "Trip budget shared with your group",
      `${formatLKR(perPerson)} each · ${shareCount} travellers · ${formatLKR(budgetValue)} total`,
    );
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-accent px-5 pb-8 pt-12 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          <Users className="h-4 w-4" />
          Group Travel
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
          Plan your group trip
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Add travellers, set a budget and split costs equally.
        </p>
      </header>

      <div className="-mt-4 space-y-5 rounded-t-3xl bg-background px-5 pt-6">
        {/* Budget */}
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Total trip budget
              </h2>
              <p className="text-xs text-muted-foreground">
                The whole group's spending money
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="budget" className="sr-only">
              Budget in LKR
            </Label>
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3">
              <span className="text-sm font-semibold text-muted-foreground">
                LKR
              </span>
              <Input
                id="budget"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="border-0 px-1 text-lg font-semibold shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </section>

        {/* Members */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Members
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {members.length}
              </span>
            </h2>
          </div>

          {members.map((member, index) => {
            const complete = member.name.trim() && member.passport.trim();
            return (
              <div
                key={member.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                        complete
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {complete ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Traveller {index + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    disabled={members.length <= 1}
                    aria-label={`Remove traveller ${index + 1}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`name-${member.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Full name
                    </Label>
                    <Input
                      id={`name-${member.id}`}
                      placeholder="e.g. Amara Perera"
                      value={member.name}
                      maxLength={80}
                      onChange={(e) =>
                        updateMember(member.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`passport-${member.id}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <IdCard className="h-3.5 w-3.5" />
                      Passport / ID number
                    </Label>
                    <Input
                      id={`passport-${member.id}`}
                      placeholder="e.g. N1234567"
                      value={member.passport}
                      maxLength={30}
                      autoCapitalize="characters"
                      onChange={(e) =>
                        updateMember(member.id, {
                          passport: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addMember}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <UserPlus className="h-4 w-4" />
            Add another member
          </button>
        </section>

        {/* Split summary */}
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <PiggyBank className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              Budget split
            </h2>
          </div>

          {canSummarise ? (
            <>
              <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  Each traveller pays
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">
                  {formatLKR(perPerson)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatLKR(budgetValue)} split across {shareCount} travellers
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {completeMembers.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {m.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="truncate">
                        <p className="truncate text-sm font-medium text-foreground">
                          {m.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {m.passport}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {formatLKR(perPerson)}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={shareWithGroup}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  shared
                    ? "bg-chart-3/15 text-chart-3"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {shared ? (
                  <>
                    <Check className="h-4 w-4" />
                    Shared with group
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Share split with group
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-xl bg-secondary/50 px-4 py-6 text-center">
              <Plane className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Enter a budget and add at least 2 members with their name and
                passport / ID to see the equal split.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
