import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-secondary/40">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-sm">
        <main className="flex-1 pb-28">{children}</main>
        <p className="absolute bottom-[5.5rem] left-0 right-0 text-center text-[10px] text-muted-foreground">
          Created by Alston Mathew Quyn
        </p>
        <BottomNav />
      </div>
    </div>
  );
}
