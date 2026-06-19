import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TranslateInput = z.object({
  text: z.string().min(1).max(5000),
  source: z.string().min(2).max(8),
  target: z.string().min(2).max(8),
  sourceName: z.string().min(1).max(40),
  targetName: z.string().min(1).max(40),
});

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Translation is not configured.");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { generateText } = await import("ai");

    const gateway = createLovableAiGatewayProvider(key);

    const system =
      `You are a professional real-time translator. Translate the user's text ` +
      `from ${data.sourceName} to ${data.targetName}. ` +
      `Return ONLY the translated text, with no quotes, no explanations, ` +
      `no transliteration and no extra commentary. Preserve tone, names and emoji. ` +
      `If the text is already in ${data.targetName}, return it unchanged.`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt: data.text,
    });

    return { translation: text.trim() };
  });
