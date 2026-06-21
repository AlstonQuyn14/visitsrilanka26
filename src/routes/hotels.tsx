import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Phone, MapPin, Star, CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CheckoutSheet } from "@/components/CheckoutSheet";
import { hotels, hotelCategories, type Hotel, type HotelCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

function priceNumber(priceFrom: string): number {
  return Number(priceFrom.replace(/[^0-9.]/g, "")) || 0;
}

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Hotels & Rentals in Sri Lanka — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Famous Sri Lankan hotels, biggest resorts and rentable villas with hotlines — Shangri-La, Cinnamon Grand, Heritance Kandalama, Jetwing, Galle Fort villas and more.",
      },
      { property: "og:title", content: "Hotels & Rentals in Sri Lanka — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Browse top hotels, resorts and rental villas across Sri Lanka with direct hotlines and prices.",
      },
    ],
  }),
  component: Hotels,
});

function Hotels() {
  const [active, setActive] = useState<HotelCategory | "All">("All");
  const [booking, setBooking] = useState<Hotel | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? hotels
        : hotels.filter((h) => h.category === active),
    [active],
  );

  return (
    <AppShell>
      <PaymentTestModeBanner />
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <BedDouble className="h-4 w-4" />
          Hotels
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">
          Hotels & Rentals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Famous hotels, big resorts and places to rent across Sri Lanka.
        </p>
      </header>

      {/* Category filter */}
      <section className="mt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          {hotelCategories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hotels list */}
      <section className="mt-5 space-y-3 px-5">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "place" : "places"}
        </p>
        {filtered.map((hotel) => (
          <article
            key={hotel.id}
            className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl">
                {hotel.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-bold leading-tight text-foreground">
                    {hotel.name}
                  </h2>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    <Star className="h-3 w-3 fill-current" />
                    {hotel.rating}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                  <MapPin className="h-3 w-3" />
                  {hotel.location} · {hotel.category}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {hotel.description}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {hotel.priceFrom}
                </span>
                {hotel.rentable && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Rentable
                  </span>
                )}
              </div>
              <a
                href={`tel:${hotel.hotline.replace(/\s+/g, "")}`}
                className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-2 text-xs font-semibold text-foreground transition-transform active:scale-95"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            </div>

            <button
              onClick={() => setBooking(hotel)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              <CalendarCheck className="h-4 w-4" />
              Book 1 night · {hotel.priceFrom.replace(/\s*\/\s*night/i, "")}
            </button>
          </article>
        ))}
      </section>

      {booking && (
        <CheckoutSheet
          orderType="hotel"
          itemId={booking.id}
          itemName={booking.name}
          amountUsd={priceNumber(booking.priceFrom)}
          emoji={booking.emoji}
          subtitle={`${booking.location} · 1 night`}
          extra={{ nights: "1", location: booking.location }}
          onClose={() => setBooking(null)}
        />
      )}
    </AppShell>
  );
}
