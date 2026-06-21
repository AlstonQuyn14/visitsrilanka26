import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  buildSystemPrompt,
  isAgentId,
  languageNameForCode,
} from "@/lib/ai-agents";

type ChatRequestBody = {
  messages?: unknown;
  agent?: unknown;
  language?: unknown;
};

async function getUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error) return null;
  return (data?.claims?.sub as string | undefined) ?? null;
}

async function hasActiveSubscription(
  userId: string,
  environment: "sandbox" | "live",
): Promise<boolean> {
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  const { data, error } = await supabaseAdmin.rpc("has_active_subscription", {
    user_uuid: userId,
    check_env: environment,
  });
  if (error) {
    console.error("Subscription check failed:", error.message);
    return false;
  }
  return data === true;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getUserId(request);
        if (!userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json()) as ChatRequestBody;

        const environment =
          (body as any).environment === "live" ? "live" : "sandbox";
        const subscribed = await hasActiveSubscription(userId, environment);
        if (!subscribed) {
          return new Response(
            "An active AI Travel Assistant Pro subscription is required.",
            { status: 402 },
          );
        }

        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("AI is not configured", { status: 500 });
        }

        const agentId =
          typeof body.agent === "string" && isAgentId(body.agent)
            ? body.agent
            : "planner";
        const languageCode =
          typeof body.language === "string" ? body.language : "en";
        const languageName = languageNameForCode(languageCode);
        const system = buildSystemPrompt(agentId, languageName);

        const { createLovableAiGatewayProvider } = await import(
          "@/lib/ai-gateway.server"
        );
        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
