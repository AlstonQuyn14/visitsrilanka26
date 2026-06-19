import { createFileRoute } from "@tanstack/react-router";

const EXT_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
};

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "Voice input is not configured." }, { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Invalid upload." }, { status: 400 });
        }

        const audio = form.get("file");
        if (!(audio instanceof File) || audio.size < 1024) {
          return Response.json(
            { error: "That recording was empty — please try again." },
            { status: 400 },
          );
        }
        if (audio.size > 20 * 1024 * 1024) {
          return Response.json({ error: "Recording is too long." }, { status: 400 });
        }

        const baseType = audio.type.split(";")[0];
        const ext = EXT_BY_TYPE[baseType] ?? "webm";

        const language = form.get("language");
        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", audio, `recording.${ext}`);
        if (typeof language === "string" && /^[a-z]{2}$/.test(language)) {
          upstream.append("language", language);
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return Response.json(
            { error: "Couldn't transcribe the audio.", detail },
            { status: res.status },
          );
        }

        const data = (await res.json()) as { text?: string };
        return Response.json({ text: (data.text ?? "").trim() });
      },
    },
  },
});
