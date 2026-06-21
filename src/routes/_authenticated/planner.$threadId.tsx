import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFileRoute,
  useParams,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, Loader2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { AppShell } from "@/components/layout/AppShell";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { agents, type AgentId } from "@/lib/ai-agents";
import { languages, getStoredLanguage, setStoredLanguage } from "@/lib/languages";
import {
  getThread,
  loadMessages,
  saveMessage,
  renameThread,
  touchThread,
  titleFromText,
} from "@/lib/planner-db";

export const Route = createFileRoute("/_authenticated/planner/$threadId")({
  component: PlannerThread,
});

function PlannerThread() {
  const { threadId } = useParams({ from: "/_authenticated/planner/$threadId" });
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentId | null>(null);
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    setAgent(null);
    setInitial(null);
    setMissing(false);
    (async () => {
      try {
        const thread = await getThread(threadId);
        if (!active) return;
        if (!thread) {
          setMissing(true);
          return;
        }
        const msgs = await loadMessages(threadId);
        if (!active) return;
        setAgent(thread.agent);
        setInitial(msgs);
      } catch {
        if (active) setMissing(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [threadId]);

  if (missing) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            This chat couldn't be found.
          </p>
          <Link
            to="/planner"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to assistant
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!agent || !initial) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <ChatView
      key={threadId}
      threadId={threadId}
      agent={agent}
      initialMessages={initial}
      onBack={() => navigate({ to: "/planner" })}
    />
  );
}

function ChatView({
  threadId,
  agent,
  initialMessages,
  onBack,
}: {
  threadId: string;
  agent: AgentId;
  initialMessages: UIMessage[];
  onBack: () => void;
}) {
  const config = agents[agent];
  const [language, setLanguage] = useState<string>(() => getStoredLanguage());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const savedIds = useRef<Set<string>>(
    new Set(initialMessages.map((m) => m.id)),
  );
  const titleSet = useRef<boolean>(initialMessages.some((m) => m.role === "user"));

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      const text = err?.message ?? "";
      if (text.includes("429"))
        setErrorMsg("Too many requests — please wait a moment and try again.");
      else if (text.includes("402"))
        setErrorMsg(
          "Your AI Travel Assistant Pro subscription is required to chat. Subscribe from the AI Assistant home screen to continue.",
        );
      else setErrorMsg("Something went wrong. Please try again.");
    },
  });

  const busy = status === "submitted" || status === "streaming";

  // Persist messages to the database (user instantly, assistant once complete).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const m of messages) {
        if (savedIds.current.has(m.id)) continue;
        if (m.role === "assistant" && status !== "ready") continue;
        const text = m.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();
        if (!text) continue;
        savedIds.current.add(m.id);
        try {
          await saveMessage(threadId, m);
          if (cancelled) return;
          if (m.role === "user" && !titleSet.current) {
            titleSet.current = true;
            await renameThread(threadId, titleFromText(text));
          } else {
            await touchThread(threadId);
          }
        } catch {
          savedIds.current.delete(m.id);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, status, threadId]);

  const send = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || busy) return;
      setErrorMsg(null);
      void sendMessage(
        { text: value },
        { body: { agent, language, environment: getPaddleEnvironment() } },
      );
    },
    [busy, sendMessage, agent, language],
  );

  const onSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text) send(message.text);
    },
    [send],
  );

  const onLanguageChange = useCallback((code: string) => {
    setLanguage(code);
    setStoredLanguage(code);
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen w-full bg-secondary/40">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-sm">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/90 px-3 py-2.5 backdrop-blur-xl">
          <button
            onClick={onBack}
            className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-xl">
            {config.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-foreground">
              {config.label}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              {config.tagline}
            </p>
          </div>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-9 w-auto gap-1 rounded-full border-border/60 px-2.5 text-xs">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {languages.find((l) => l.code === language)?.flag ?? "🌐"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.name} · {l.native}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        {/* Conversation */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {isEmpty ? (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div
                className={`mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br ${config.gradient} text-3xl text-primary-foreground shadow-lg`}
              >
                {config.emoji}
              </div>
              <p className="mx-auto mt-4 max-w-xs text-center text-sm text-muted-foreground">
                {config.greeting}
              </p>
              <div className="mt-6 space-y-2">
                {config.starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-2xl border border-border/60 bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Conversation className="flex-1">
              <ConversationContent className="gap-5">
                {messages.map((m) => {
                  const text = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  return (
                    <Message key={m.id} from={m.role}>
                      <MessageContent>
                        {m.role === "assistant" ? (
                          <MessageResponse>{text}</MessageResponse>
                        ) : (
                          <span className="whitespace-pre-wrap">{text}</span>
                        )}
                      </MessageContent>
                    </Message>
                  );
                })}
                {status === "submitted" && (
                  <Message from="assistant">
                    <MessageContent>
                      <Shimmer>Thinking…</Shimmer>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          {errorMsg && (
            <div className="mx-4 mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-border/60 bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
            <PromptInput onSubmit={onSubmit}>
              <PromptInputTextarea
                autoFocus
                placeholder={
                  agent === "planner"
                    ? "Describe your trip…"
                    : "Ask anything about Sri Lanka…"
                }
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status} disabled={busy} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </main>
      </div>
    </div>
  );
}
