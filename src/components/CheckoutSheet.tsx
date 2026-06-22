import { useEffect, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { cn } from "@/lib/utils";

export type OrderType = "hotel" | "guide" | "grocery" | "transport";

const PRICE_BY_TYPE: Record<OrderType, string> = {
  hotel: "hotel_stay_unit",
  guide: "guide_booking_unit",
  grocery: "grocery_order_unit",
  transport: "transport_booking_unit",
};

export interface CheckoutSheetProps {
  orderType: OrderType;
  itemId: string;
  itemName: string;
  /** Total amount to charge, in USD (e.g. 220 or 14.5). */
  amountUsd: number;
  /** Big emoji or short icon shown in the header. */
  emoji?: string;
  /** Accent classes for the header badge. */
  accent?: string;
  /** Subtitle under the item name. */
  subtitle?: string;
  /** Extra fields persisted with the order (stored in metadata). */
  extra?: Record<string, string>;
  /** Called when payment completes successfully. */
  onPaid?: () => void;
  onClose: () => void;
}

/**
 * Reusable bottom-sheet checkout for one-time purchases (hotel stays, tour
 * guide bookings, grocery orders). Collects the buyer's name + email and opens
 * the payment overlay. The webhook records the paid order server-side.
 */
export function CheckoutSheet({
  orderType,
  itemId,
  itemName,
  amountUsd,
  emoji = "🧾",
  accent = "bg-primary/15 text-primary",
  subtitle,
  extra,
  onClose,
}: CheckoutSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const { openCheckout } = usePaddleCheckout();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const amountCents = Math.round(amountUsd * 100);
  const canPay = amountCents >= 70 && emailValid && name.trim().length > 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        if (data.user.email) setEmail((e) => e || data.user!.email!);
      }
    });
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const evtName =
        typeof e.data === "object" && e.data ? (e.data as any).name : undefined;
      if (evtName === "checkout.completed") setStage("done");
      if (evtName === "checkout.closed")
        setStage((s) => (s === "processing" ? "form" : s));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function handlePay() {
    setError(null);
    setStage("processing");
    try {
      await openCheckout({
        priceId: PRICE_BY_TYPE[orderType],
        quantity: amountCents,
        customerEmail: email.trim(),
        customData: {
          kind: "order",
          orderType,
          itemId,
          itemName,
          customerName: name.trim(),
          customerEmail: email.trim(),
          ...(userId ? { userId } : {}),
          ...(extra ?? {}),
        },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch {
      setError("Could not open checkout. Please try again.");
      setStage("form");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-border/60 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {stage === "done" ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-foreground">
              Payment received!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your payment of ${amountUsd.toLocaleString()} for {itemName} is
              confirmed. We've got your money and your booking is secured. 🌴
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              A confirmation is on its way to {email.trim()}.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pr-8">
              <span
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl text-2xl",
                  accent,
                )}
              >
                {emoji}
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {itemName}
                </h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/40 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total
              </span>
              <span className="text-xl font-bold text-foreground">
                ${amountUsd.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

            <button
              onClick={handlePay}
              disabled={!canPay || stage === "processing"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {stage === "processing" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {stage === "processing"
                ? "Opening checkout…"
                : `Pay $${amountUsd.toLocaleString()}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Secure checkout. You'll get a confirmation by email.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
