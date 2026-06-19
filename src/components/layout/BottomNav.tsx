import { Link } from "@tanstack/react-router";
import { Home, Compass, BedDouble, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/safety", label: "Safety", icon: ShieldAlert, danger: true },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="pointer-events-auto relative mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="relative flex items-end justify-between rounded-3xl border border-border/60 bg-card/90 px-3 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.label} {...item} />
          ))}

          {/* Center AI assistant action */}
          <Link
            to="/planner"
            className="-mt-7 flex flex-col items-center gap-1"
            aria-label="AI Travel Assistant"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95">
              <Sparkles className="h-6 w-6" />
            </span>
            <span className="text-[10px] font-semibold text-foreground">AI</span>
          </Link>

          {items.slice(2).map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  danger,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  danger?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="group flex w-14 flex-col items-center gap-1 py-1.5"
    >
      <Icon
        className={cn(
          "h-5 w-5 text-muted-foreground transition-colors group-data-[status=active]:text-primary",
          danger && "group-data-[status=active]:text-destructive",
        )}
      />
      <span
        className={cn(
          "text-[10px] font-medium text-muted-foreground transition-colors group-data-[status=active]:text-primary",
          danger && "group-data-[status=active]:text-destructive",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
