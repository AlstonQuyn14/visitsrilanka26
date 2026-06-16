import { Link } from "@tanstack/react-router";
import { quickActions, type QuickAction } from "@/lib/data";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

const toneStyles: Record<QuickAction["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  nature: "bg-chart-3/15 text-chart-3",
  sun: "bg-chart-4/20 text-chart-5",
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3 px-5">
      {quickActions.map((action) => (
        <Link
          key={action.id}
          to={action.to}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={cn(
              "grid h-14 w-14 place-items-center rounded-2xl transition-transform active:scale-95",
              toneStyles[action.tone],
            )}
          >
            <Icon name={action.icon} className="h-6 w-6" strokeWidth={2} />
          </span>
          <span className="text-center text-[11px] font-medium leading-tight text-foreground">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
