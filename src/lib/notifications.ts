import { supabase } from "@/integrations/supabase/client";

export type NotifCategory = "login" | "tracking" | "group";

/** Insert a real notification for the current signed-in user (RLS scoped). */
export async function recordNotification(
  category: NotifCategory,
  title: string,
  detail?: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").insert({
    user_id: user.id,
    category,
    title,
    detail: detail ?? null,
  });
}

/** Human-friendly label for the current device/browser. */
export function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  let os = "device";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iPhone";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X/.test(ua)) os = "Mac";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";
  return `${browser} · ${os}`;
}
