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
  ChevronLeft,
  Shield,
  Star,
  ArrowRight,
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
  {
    id: "tuktuk",
    label: "Tuk Tuk",
    icon: Car,
    seats: "1–3",
    price: "Rs. 120/km",
    eta: "3 min",
    color: "bg-chart-1",
    description: "Zip through traffic with the iconic Sri Lankan tuk tuk",
  },
  {
    id: "car",
    label: "Car",
    icon: Car,
    seats: "1–4",
    price: "Rs. 220/km",
    eta: "5 min",
    color: "bg-chart-3",
    description: "Comfortable sedan with AC for longer journeys",
  },
  {
    id: "van",
    label: "Van",
    icon: Truck,
    seats: "1–8",
    price: "Rs. 320/km",
    eta: "8 min",
    color: "bg-chart-4",
    description: "Spacious van perfect for groups and luggage",
  },
  {
    id: "bus",
    label: "Coaster Bus",
    icon: Bus,
    seats: "1–20",
    price: "Rs. 480/km",
    eta: "12 min",
    color: "bg-chart-5",
    description: "Large bus for tours and big groups",
  },
] as const;

type Step = "vehicle" | "details" | "confirm" | "success";

function Transport() {
  const [step, setStep] = useState<Step>("vehicle");
  const [vehicle, setVehicle] = useState<string>("tuktuk");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [person, setPerson] = useState("");

  const selected = vehicles.find((v) => v.id === vehicle);
  const canDetails = !!selected;
  const canConfirm =
    pickup.trim() && destination.trim() && time.trim() && person.trim();

  function handleBook() {
    if (!canConfirm || !selected) return;
    setStep("success");
  }

  function handleBack() {
    if (step === "details") setStep("vehicle");
    else if (step === "confirm") setStep("details");
  }

  function reset() {
    setStep("vehicle");
    setVehicle("tuktuk");
    setPickup("");
    setDestination("");
    setTime("");
    setPerson("");
  }

  if (step === "success" && selected) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground">
            Ride booked!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your <span className="font-medium text-foreground">{selected.label}</span> is on the way. The driver will arrive at{" "}
            <span className="font-medium text-foreground">{pickup}</span> around{" "}
            <span className="font-medium text-foreground">{time}</span>.
          </p>
          <div className="mt-6 w-full space-y-2 rounded-3xl border border-border/60 bg-card p-5 text-left">
            <Detail label="Passenger" value={person} />
            <Detail label="Pickup" value={pickup} />
            <Detail label="Destination" value={destination} />
            <Detail label="Pickup time" value={time} />
            <Detail label="Vehicle" value={selected.label} />
            <Detail label="Price rate" value={selected.price} />
          </div>
          <button
            onClick={reset}
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
      {/* Header with back button */}
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {step !== "vehicle" && (
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}
        <p className="text-xs font-medium text-accent">Transport Booking</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">
          {step === "vehicle" && "Choose Vehicle"}
          {step === "details" && "Trip Details"}
          {step === "confirm" && "Confirm Ride"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "vehicle" && "Select the perfect ride for your journey."}
          {step === "details" && "Tell us where you're heading and when."}
          {step === "confirm" && "Review everything before we send your driver."}
        </p>
      </header>

      {/* Step 1: Vehicle Selection */}
      {step === "vehicle" && (
        <div className="mt-6 space-y-4 px-5">
          <div className="grid grid-cols-1 gap-3">
            {vehicles.map((v) => {
              const isActive = vehicle === v.id;
              const VIcon = v.icon;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicle(v.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/70 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <VIcon className="h-6 w-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {v.label}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {v.price}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {v.seats} seats · {v.eta} away · {v.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => canDetails && setStep("details")}
            disabled={!canDetails}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Trip Details */}
      {step === "details" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canConfirm) setStep("confirm");
          }}
          className="mt-6 space-y-4 px-5"
        >
          {/* Selected vehicle summary */}
          {selected && (
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <selected.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{selected.label}</p>
                <p className="text-xs text-muted-foreground">{selected.seats} seats · {selected.price}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("vehicle")}
                className="text-xs font-medium text-primary"
              >
                Change
              </button>
            </div>
          )}

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
            disabled={!canConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            Review & Confirm
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && selected && (
        <div className="mt-6 space-y-5 px-5">
          {/* Vehicle card */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-foreground">Selected vehicle</h2>
            <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                <selected.icon className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">{selected.label}</p>
                <p className="text-xs text-muted-foreground">{selected.seats} seats · {selected.eta} away</p>
                <p className="mt-1 text-sm font-bold text-primary">{selected.price}</p>
              </div>
              <button
                onClick={() => setStep("vehicle")}
                className="text-xs font-medium text-primary"
              >
                Change
              </button>
            </div>
          </section>

          {/* Trip summary */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-foreground">Trip summary</h2>
            <div className="space-y-2 rounded-2xl border border-border/60 bg-card p-5">
              <Detail label="Passenger" value={person} />
              <Detail label="Pickup" value={pickup} />
              <Detail label="Destination" value={destination} />
              <Detail label="Pickup time" value={time} />
              <Detail label="Vehicle" value={selected.label} />
              <Detail label="Rate" value={selected.price} />
            </div>
          </section>

          {/* Safety note */}
          <div className="flex items-start gap-3 rounded-2xl bg-chart-1/10 p-4">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
            <p className="text-xs text-muted-foreground">
              All drivers are verified and tracked. Share your trip with friends for added safety. Emergency SOS is available throughout your ride.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleBook}
              disabled={!canConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Confirm & Book Ride
            </button>
            <button
              onClick={() => setStep("details")}
              className="w-full rounded-2xl border border-border/60 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}
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
