import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  MessageSquareText,
  Trash2,
  Loader2,
  Globe,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { agentList, agents, type AgentId } from "@/lib/ai-agents";
import {
  listThreads,
  createThread,
  deleteThread,
  type ThreadRow,
} from "@/lib/planner-db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planner/")({
  head: () => ({
    meta: [
      { title: "AI Travel Assistant — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Plan a custom Sri Lanka trip with budget, stays, food and activities, or ask anything about Sri Lankan history and culture — in 15+ languages.",
      },
    ],
  }),
  component: PlannerHub,
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function PlannerHub() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<AgentId | null>(null);

  const refresh = useCallback(async () => {
    try {
      setThreads(await listThreads());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const startChat = useCallback(
    async (agent: AgentId) => {
      setCreating(agent);
      try {
        const thread = await createThread(agent);
        navigate({
          to: "/planner/$threadId",
          params: { threadId: thread.id },
        });
      } catch {
        setCreating(null);
      }
    },
    [navigate],
  );

  const remove = useCallback(
    async (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      try {
        await deleteThread(id);
      } catch {
        void refresh();
      }
    },
    [refresh],
  );

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight text-foreground">
            AI Travel Assistant
          </h1>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Globe className="h-3 w-3" /> Speaks 15+ languages
          </p>
        </div>
      </header>

      <div className="space-y-6 px-4 py-5">
        <section className="space-y-3">
          {agentList.map((agent) => (
            <button
              key={agent.id}
              onClick={() => startChat(agent.id)}
              disabled={creating !== null}
              className={cn(
                "group flex w-full items-center gap-3 rounded-3xl bg-gradient-to-br p-4 text-left text-primary-foreground shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70",
                agent.gradient,
              )}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl">
                {agent.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{agent.label}</span>
                <span className="block text-xs text-primary-foreground/85">
                  {agent.tagline}
                </span>
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/25">
                {creating === agent.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </span>
            </button>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your chats
          </h2>

          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/30 px-4 py-8 text-center">
              <MessageSquareText className="mx-auto h-7 w-7 text-muted-foreground/70" />
              <p className="mt-2 text-sm text-muted-foreground">
                No chats yet. Start a Tour Planner or Q&A above.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3"
                >
                  <Link
                    to="/planner/$threadId"
                    params={{ threadId: thread.id }}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-xl">
                      {agents[thread.agent]?.emoji ?? "💬"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {thread.title}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {agents[thread.agent]?.label} · {timeAgo(thread.updated_at)}
                      </span>
                    </span>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(thread.id)}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
