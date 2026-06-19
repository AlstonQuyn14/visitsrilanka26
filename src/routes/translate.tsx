import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRightLeft,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Languages as LanguagesIcon,
  Trash2,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { languages } from "@/lib/languages";
import { translateText } from "@/lib/translate.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/translate")({
  head: () => ({
    meta: [
      { title: "Live Translator — Serendib" },
      {
        name: "description",
        content:
          "Real-time translation between 15 languages including Sinhala, Tamil, English, Hindi, Mandarin and more. Swap languages instantly and translate any direction.",
      },
      { property: "og:title", content: "Live Translator — Serendib" },
      {
        property: "og:description",
        content:
          "Translate between 15 languages in real time — English, Sinhala, Tamil, Hindi, Mandarin, Russian and more.",
      },
    ],
  }),
  component: Translate,
});

function langByCode(code: string) {
  return languages.find((l) => l.code === code) ?? languages[0];
}

function Translate() {
  const runTranslate = useServerFn(translateText);

  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("si");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sourceLang = langByCode(source);
  const targetLang = langByCode(target);

  function swap() {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
    setError(null);
  }

  async function handleTranslate() {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const result = await runTranslate({
        data: {
          text,
          source,
          target,
          sourceName: sourceLang.name,
          targetName: targetLang.name,
        },
      });
      setOutput(result.translation);
    } catch {
      setError("Couldn't translate right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError(null);
  }

  async function startRecording() {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is needed to record.");
      return;
    }
    const mimeType = ["audio/webm", "audio/mp4"].find(
      (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t),
    );
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError("This browser can't record audio.");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      if (blob.size < 1024) {
        setError("That recording was empty — please try again.");
        return;
      }
      await transcribe(blob);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    setTranscribing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", blob, "recording");
      form.append("language", source);
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Transcription failed");
      const text = (data.text ?? "").trim();
      if (!text) {
        setError("Couldn't hear anything — please try again.");
        return;
      }
      setInput(text);
    } catch {
      setError("Couldn't transcribe the audio. Please try again.");
    } finally {
      setTranscribing(false);
    }
  }

  async function speak() {
    if (!output) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(true);
    setError(null);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: output }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setSpeaking(false);
      setError("Couldn't play the translation aloud.");
    }
  }


  return (
    <AppShell>
      {/* Header */}
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium text-primary">Live Translator</p>
        <h1 className="mt-0.5 font-display text-2xl font-bold text-foreground">
          Translate anything
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time translation across 15 languages — pick any direction.
        </p>
      </header>

      <div className="mt-5 space-y-4 px-5 pb-8">
        {/* Language switcher */}
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-2">
          <div className="min-w-0 flex-1">
            <LangPicker value={source} onChange={setSource} />
          </div>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap languages"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform active:scale-90"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <LangPicker value={target} onChange={setTarget} />
          </div>
        </div>

        {/* Source input */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>{sourceLang.flag}</span>
              {sourceLang.native}
            </span>
            <div className="flex items-center gap-3">
              {input && !recording && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                disabled={transcribing}
                aria-label={recording ? "Stop recording" : "Record voice"}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-50",
                  recording
                    ? "animate-pulse bg-destructive text-destructive-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                {transcribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : recording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              recording
                ? "Listening… tap stop when you're done"
                : transcribing
                  ? "Transcribing your voice…"
                  : `Type or speak in ${sourceLang.name}…`
            }
            rows={4}
            maxLength={5000}
            className="w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground/70">
            <span className="flex items-center gap-1 text-primary">
              {recording && (
                <>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                  Recording…
                </>
              )}
            </span>
            <span>{input.length}/5000</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={loading || !input.trim()}
          onClick={handleTranslate}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Translate
        </Button>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Result */}
        <div
          className={cn(
            "rounded-2xl border p-4 shadow-sm transition-colors",
            output
              ? "border-primary/30 bg-primary/5"
              : "border-dashed border-border/60 bg-muted/30",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>{targetLang.flag}</span>
              {targetLang.native}
            </span>
            {output && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-medium text-primary"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            )}
          </div>
          {output ? (
            <p className="whitespace-pre-wrap text-base text-foreground">{output}</p>
          ) : (
            <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground/70">
              <LanguagesIcon className="h-4 w-4" />
              Your translation will appear here.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function LangPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const selected = langByCode(value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full rounded-xl border-0 bg-background/70 font-semibold">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0">{selected.flag}</span>
          <span className="truncate">{selected.native}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="mr-2">{lang.flag}</span>
            <span className="font-medium">{lang.native}</span>
            <span className="ml-1.5 text-muted-foreground">{lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
