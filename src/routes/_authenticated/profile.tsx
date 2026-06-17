import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { User, Settings, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setProfile({
          display_name: data?.display_name ?? user.user_metadata?.display_name ?? null,
          email: user.email ?? null,
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "User";

  return (
    <AppShell>
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-foreground truncate">{name}</h1>
                {profile?.email && (
                  <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left transition-colors hover:bg-accent/50">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Settings</span>
          </button>

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

