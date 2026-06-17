import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Car,
  Bus,
  Truck,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transport")({
  head: () => ({
    meta: [
      { title: "Book a Ride — Serendib" },
      {
        name: "description",
        content:
          "Book a Tuk Tuk, Car, Van or Bus across Sri Lanka. Choose your pickup, destination, time and passenger details with Serendib transport.",
      },
      { property: "og:title", content: "Book a Ride — Serendib" },
      {
        property: "og:description",
        content:
          "Choose a Tuk Tuk, Car, Van or Bus and book your ride across Sri Lanka.",
      },
    ],
  }),
  component: Transport,
});

const vehicles = [
  { id: "tuktuk", label: "Tuk Tuk", icon: Car, seats: "1–3", price: "Rs. 120/km", eta: "3 min" },
  { id: "car", label: "Car", icon: Car, seats: "1–4", price: "Rs. 220/km", eta: "5 min" },
  { id: "van", label: "Van", icon: Truck, seats: "1–8", price: "Rs. 320/km", eta: "8 min" },
  { id: "bus", label: "Coaster Bus", icon: Bus, seats: "1–20", price: "Rs. 480/km", eta: "12 min" },
] as const;

function Transport() {
  const [vehicle, setVehicle] = useState<string>("tuktuk");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [person, setPerson] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selected = vehicles.find((v) => v.id === vehicle);
  const canBook =
    pickup.trim() && destination.trim() && time.trim() && person.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canBook) return;
    setSubmitted(true);
  }

  if (submitted && selected) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground">Ride booked!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your {selected.label} is on the way. The driver will arrive at{" "}
            <span className="font-medium text-foreground">{pickup}</span> around{" "}
            <span className="font-medium text-foreground">{time}</span>.
          </p>
          <div className="mt-6 w-full space-y-2 rounded-3xl border border-border/60 bg-card p-5 text-left">
            <Detail label="Passenger" value={person} />
            <Detail label="Pickup" value={pickup} />
            <Detail label="Destination" value={destination} />
            <Detail label="Pickup time" value={time} />
            <Detail label="Vehicle" value={selected.label} />
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
          >
            Book another ride
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium text-accent">Transport Booking</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">Book a Ride</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your vehicle and tell us where you're heading.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 px-5">
        {/* Vehicle selection */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Select vehicle
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {vehicles.map((v) => {
              const isActive = vehicle === v.id;
              const VIcon = v.icon;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicle(v.id)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <VIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {v.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {v.seats} seats · {v.eta}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {v.price}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Trip details */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Trip details</h2>

          <Field
            icon={<Navigation className="h-5 w-5 text-primary" />}
            label="Pickup location"
          >
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              type="text"
              placeholder="Where should we pick you up?"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </Field>

          <Field
            icon={<MapPin className="h-5 w-5 text-accent" />}
            label="Destination"
          >
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              type="text"
              placeholder="Where are you going?"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </Field>

          <Field
            icon={<Clock className="h-5 w-5 text-chart-3" />}
            label="Pickup time"
          >
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </Field>

          <Field
            icon={<User className="h-5 w-5 text-chart-5" />}
            label="Passenger name"
          >
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              type="text"
              placeholder="Who is this ride for?"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </Field>
        </section>

        <button
          type="submit"
          disabled={!canBook}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          Confirm booking
        </button>
      </form>
    </AppShell>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
