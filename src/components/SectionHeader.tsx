import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="flex items-end justify-between px-5">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {action && to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-sm font-semibold text-primary"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
