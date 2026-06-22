import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useDarkMode } from "@/hooks/useDarkMode";

export function HomeHeader() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      const resolved =
        data?.display_name ??
        user.user_metadata?.display_name ??
        user.email?.split("@")[0] ??
        null;
      if (active) setName(resolved);
    }
    fetchName();
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground">
            ආ
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ayubowan 🙏</p>
            <p className="text-sm font-bold text-foreground">
              Welcome, {name ?? "traveller"}
            </p>
          </div>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative grid h-11 w-11 place-items-center rounded-full border border-border/70 bg-card text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search beaches, temples, guides…"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </header>
  );
}
