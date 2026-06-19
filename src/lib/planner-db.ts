import { supabase } from "@/integrations/supabase/client";
import type { UIMessage } from "ai";
import type { AgentId } from "@/lib/ai-agents";

export interface ThreadRow {
  id: string;
  title: string;
  agent: AgentId;
  created_at: string;
  updated_at: string;
}

export async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listThreads(agent?: AgentId): Promise<ThreadRow[]> {
  let query = supabase
    .from("chat_threads")
    .select("id, title, agent, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (agent) query = query.eq("agent", agent);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ThreadRow[];
}

export async function getThread(id: string): Promise<ThreadRow | null> {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, agent, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ThreadRow) ?? null;
}

export async function createThread(
  agent: AgentId,
  title = "New chat",
): Promise<ThreadRow> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ user_id: userId, agent, title })
    .select("id, title, agent, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as ThreadRow;
}

export async function renameThread(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("chat_threads")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function touchThread(id: string): Promise<void> {
  const { error } = await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteThread(id: string): Promise<void> {
  await supabase.from("chat_messages").delete().eq("thread_id", id);
  const { error } = await supabase.from("chat_threads").delete().eq("id", id);
  if (error) throw error;
}

export async function loadMessages(threadId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, message_id, role, parts")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: (row.message_id as string) || (row.id as string),
    role: row.role as UIMessage["role"],
    parts: (row.parts as UIMessage["parts"]) ?? [],
  }));
}

export async function saveMessage(
  threadId: string,
  message: UIMessage,
): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  const { error } = await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    message_id: message.id,
    role: message.role,
    parts: message.parts as unknown as never,
  });
  if (error) throw error;
}

/** Make a short thread title from the first user message. */
export function titleFromText(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 48 ? `${clean.slice(0, 47)}…` : clean || "New chat";
}
