import { createFileRoute } from "@tanstack/react-router";

type SpeakBody = { text?: unknown; voice?: unknown };

const VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

export const Route = createFileRoute("/api/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "Voice output is not configured." }, { status: 500 });
        }

        let body: SpeakBody;
        try {
          body = (await request.json()) as SpeakBody;
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) {
          return Response.json({ error: "Nothing to speak." }, { status: 400 });
        }
        const voice = typeof body.voice === "string" && VOICES.has(body.voice) ? body.voice : "alloy";

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text.slice(0, 2000),
            voice,
            response_format: "mp3",
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return Response.json(
            { error: "Couldn't generate audio.", detail },
            { status: res.status },
          );
        }

        return new Response(res.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
