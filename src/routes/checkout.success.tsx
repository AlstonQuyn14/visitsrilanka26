import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Home, Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Your payment was successful. Your booking is confirmed and a receipt is on its way.",
      },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-primary">
          <Check className="h-10 w-10" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          Payment Successful
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          We've received your payment and your booking is confirmed. A receipt
          has been emailed to you. Enjoy your time in Sri Lanka! 🌴
        </p>

        <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
          <Link
            to="/explore"
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
          >
            <Compass className="h-4 w-4" />
            Keep exploring
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card py-3.5 text-sm font-semibold text-foreground"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
