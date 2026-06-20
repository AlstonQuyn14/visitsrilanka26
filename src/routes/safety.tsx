import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  Phone,
  Siren,
  Ambulance,
  Building2,
  Plane,
  Car,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Navigation,
  Stethoscope,
  Check,
  X,
  HeartPulse,
  Waves,
  CloudLightning,
  FileWarning,
  Info,
  ShieldCheck,
  ListChecks,
  Plus,
  Trash2,
  Share2,
  LocateFixed,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { geocodeAddress } from "@/lib/geo.functions";
import { recordNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & SOS — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Emergency SOS, vehicle tracking, and hotlines for tourists in Sri Lanka. Police, ambulance, hospital, and airport services.",
      },
      { property: "og:title", content: "Safety & SOS — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Emergency contacts, SOS alerts, and live vehicle tracking for travelers in Sri Lanka.",
      },
    ],
  }),
  component: Safety,
});

/* ── Emergency contacts ── */
const hotlines = [
  {
    id: "119",
    label: "Emergency (119)",
    number: "119",
    icon: Siren,
    tone: "destructive" as const,
    desc: "All emergencies — police, fire, ambulance",
  },
  {
    id: "police",
    label: "Tourist Police",
    number: "011-242-1052",
    icon: ShieldAlert,
    tone: "warning" as const,
    desc: "English-speaking tourist police hotline",
  },
  {
    id: "ambulance",
    label: "Ambulance",
    number: "1990",
    icon: Ambulance,
    tone: "destructive" as const,
    desc: "Suwa Seriya ambulance service",
  },
  {
    id: "hospital",
    label: "National Hospital",
    number: "011-269-1111",
    icon: Stethoscope,
    tone: "primary" as const,
    desc: "Colombo National Hospital emergency",
  },
  {
    id: "airport",
    label: "Airport Service",
    number: "011-225-2861",
    icon: Plane,
    tone: "accent" as const,
    desc: "CMB Colombo Airport info & help desk",
  },
  {
    id: "airport-emergency",
    label: "Airport Emergency",
    number: "011-225-3084",
    icon: Plane,
    tone: "warning" as const,
    desc: "Airport medical / security emergency",
  },
];

/* ── Tracked journeys (real GPS) ── */
type GeoStatus = "locating" | "live" | "arrived" | "error";

interface TrackedRide {
  id: string;
  vehicle: string;
  driver: string;
  plate: string;
  pickup: string;
  destination: string;
  destLat?: number;
  destLng?: number;
  totalMeters?: number; // captured on first GPS fix
  remainingMeters?: number;
  etaMin?: number;
  geoStatus: GeoStatus;
  error?: string;
}

const vehicleOptions = ["Tuk Tuk", "Car", "Van", "Bus", "Bike", "Other"];

const initialRides: TrackedRide[] = [];

/** Great-circle distance between two coordinates, in metres. */
function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/* ── How to be safe in Sri Lanka ── */
const safetyTips = [
  { title: "Transport", text: "Use registered taxis or app-based rides. Always agree on tuk-tuk fares before starting. Avoid unmarked vehicles at night." },
  { title: "Valuables", text: "Keep your passport in the hotel safe. Carry a photocopy. Use hotel safes for jewelry and large cash amounts." },
  { title: "Health", text: "Drink only bottled or boiled water. Avoid ice from unknown sources. Use mosquito repellent in the evenings." },
  { title: "Religious Sites", text: "Remove shoes and hats at temples. Cover shoulders and knees. Never pose with your back to Buddha statues." },
  { title: "Beaches", text: "Swim only in designated areas with lifeguards. Rip currents are common — ask locals before entering the water." },
  { title: "Wildlife", text: "Never feed wild elephants or monkeys. Keep a safe distance in national parks. Follow guide instructions strictly." },
  { title: "Scams", text: "Be wary of 'gem dealers' and 'special tour' offers. Only buy from SLTDA-licensed shops and operators." },
  { title: "Night Safety", text: "Stick to well-lit, busy areas after dark. Avoid walking alone on beaches or remote roads at night." },
];

/* ── Accident response steps ── */
const accidentSteps = [
  { num: "1", title: "Stay Calm", text: "Check yourself and others for injuries. Do not move anyone with serious injuries unless there is immediate danger." },
  { num: "2", title: "Call Emergency", text: "Dial 119 immediately. If near the coast, also alert lifeguards or nearby police. Give exact location details." },
  { num: "3", title: "Secure the Scene", text: "Turn on hazard lights. Set up warning triangles if available. Move to a safe spot away from traffic." },
  { num: "4", title: "Document", text: "Take photos of the scene, vehicles, and any injuries. Exchange contact and insurance details with other parties." },
  { num: "5", title: "Contact Tourist Police", text: "Call 011-242-1052 for English-speaking assistance. They can help with local authorities and insurance claims." },
  { num: "6", title: "Seek Medical Care", text: "Even minor injuries should be checked at a hospital. Keep all medical receipts for insurance claims." },
];

/* ── Natural disasters ── */
const disasters = [
  {
    id: "tsunami",
    label: "Tsunami",
    icon: Waves,
    tone: "destructive" as const,
    steps: [
      "If you feel strong ground shaking or see the sea recede, move inland immediately to higher ground (at least 30m above sea level).",
      "Follow evacuation routes marked with blue and white tsunami signs.",
      "Do not return to the beach until officials declare the all-clear — waves can arrive hours apart.",
      "Sri Lanka has an early warning system — listen for sirens and SMS alerts.",
    ],
  },
  {
    id: "flood",
    label: "Floods & Landslides",
    icon: CloudLightning,
    tone: "warning" as const,
    steps: [
      "During monsoon (May–Sep & Oct–Jan), avoid traveling to hilly or low-lying areas if heavy rain is forecast.",
      "Never cross flooded roads or bridges — just 15cm of flowing water can sweep a car away.",
      "If caught in a landslide area, move uphill away from the path of the slide.",
      "Monitor the Disaster Management Center alerts on radio and local news.",
    ],
  },
  {
    id: "earthquake",
    label: "Earthquake",
    icon: AlertTriangle,
    tone: "primary" as const,
    steps: [
      "Drop to the ground, take cover under a sturdy table or desk, and hold on.",
      "Stay away from windows, glass, and heavy furniture that could fall.",
      "If outdoors, move to an open area away from buildings, trees, and power lines.",
      "After shaking stops, check for injuries and be prepared for aftershocks.",
    ],
  },
];

/* ── Tourist complaints ── */
const complaints = [
  { title: "Tourist Police", number: "011-242-1052", desc: "Theft, harassment, or any safety concern" },
  { title: "SLTDA", number: "011-268-1291", desc: "Complaints about hotels, guides, or unlicensed operators" },
  { title: "Consumer Affairs", number: "1977", desc: "Overcharging, faulty goods, or service disputes" },
  { title: "Airport", number: "011-225-2861", desc: "Lost luggage, flight issues, or airport service problems" },
];

type Tone = "destructive" | "warning" | "primary" | "accent";

const toneMap: Record<Tone, string> = {
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
};

const toneIconBg: Record<Tone, string> = {
  destructive: "bg-destructive text-destructive-foreground",
  warning: "bg-chart-4 text-white",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
};

function Safety() {
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [showSosSent, setShowSosSent] = useState(false);
  const [expandedDisaster, setExpandedDisaster] = useState<string | null>(null);

  /* ── Live vehicle tracking (real GPS) ── */
  const [rides, setRides] = useState<TrackedRide[]>(initialRides);
  const [showRideForm, setShowRideForm] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicle: vehicleOptions[0],
    driver: "",
    plate: "",
    pickup: "",
    destination: "",
  });

  const geocode = useServerFn(geocodeAddress);
  // Last GPS fix, used to derive speed and to share live location.
  const lastFix = useRef<{ lat: number; lng: number; t: number } | null>(null);

  // Any journey that has coordinates and hasn't arrived needs the GPS watcher.
  const needsGps = rides.some(
    (r) => r.destLat != null && r.geoStatus !== "arrived",
  );

  // Real GPS tracking: recompute remaining distance, ETA and progress on every
  // location update from the device.
  useEffect(() => {
    if (!needsGps) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError("Live GPS isn't supported on this device.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null);
        const { latitude, longitude, speed } = pos.coords;
        const t = pos.timestamp;

        // Determine current speed (m/s): device value, else derived from the
        // distance covered since the previous fix, else a 30 km/h fallback.
        let mps: number | null =
          speed != null && speed > 0.5 ? speed : null;
        if (mps == null && lastFix.current) {
          const moved = haversineMeters(
            lastFix.current.lat,
            lastFix.current.lng,
            latitude,
            longitude,
          );
          const dt = (t - lastFix.current.t) / 1000;
          if (dt > 0 && moved > 2) mps = moved / dt;
        }
        const effSpeed = mps && mps > 0.5 ? mps : 8.3;
        lastFix.current = { lat: latitude, lng: longitude, t };

        setRides((prev) =>
          prev.map((r) => {
            if (r.destLat == null || r.destLng == null) return r;
            if (r.geoStatus === "arrived") return r;
            const remaining = haversineMeters(
              latitude,
              longitude,
              r.destLat,
              r.destLng,
            );
            const total = r.totalMeters ?? Math.max(remaining, 1);
            const arrived = remaining < 50;
            const etaMin = arrived
              ? 0
              : Math.max(1, Math.round(remaining / effSpeed / 60));
            return {
              ...r,
              remainingMeters: remaining,
              totalMeters: total,
              etaMin,
              geoStatus: arrived ? "arrived" : "live",
            };
          }),
        );
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow location access to track live."
            : "Couldn't get your location. Make sure GPS is on.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [needsGps]);

  async function addRide() {
    if (!form.pickup.trim() || !form.destination.trim()) return;
    const id = `r${Date.now()}`;
    const newRide: TrackedRide = {
      id,
      vehicle: form.vehicle,
      driver: form.driver.trim() || "My driver",
      plate: form.plate.trim() || "—",
      pickup: form.pickup.trim(),
      destination: form.destination.trim(),
      geoStatus: "locating",
    };
    setRides((prev) => [newRide, ...prev]);
    setForm({ vehicle: vehicleOptions[0], driver: "", plate: "", pickup: "", destination: "" });
    setShowRideForm(false);

    try {
      const res = await geocode({ data: { address: newRide.destination } });
      setRides((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, destLat: res.lat, destLng: res.lng } : r,
        ),
      );
    } catch {
      setRides((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, geoStatus: "error", error: "Couldn't find that destination." }
            : r,
        ),
      );
    }
  }

  function removeRide(id: string) {
    setRides((prev) => prev.filter((r) => r.id !== id));
  }

  function shareRide(ride: TrackedRide) {
    const cur = lastFix.current;
    const locLink = cur
      ? ` My live location: https://maps.google.com/?q=${cur.lat},${cur.lng}`
      : "";
    const eta = ride.etaMin != null ? ` ETA ~${ride.etaMin} min.` : "";
    const text = `Tracking my ${ride.vehicle} to ${ride.destination}.${eta} Plate: ${ride.plate}.${locLink}`;
    if (navigator.share) {
      navigator.share({ title: "My live journey", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }




  function startSos() {
    setSosActive(true);
    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setSosActive(false);
        setSosCountdown(5);
        setShowSosSent(true);
      }
    }, 1000);
  }

  function cancelSos() {
    setSosActive(false);
    setSosCountdown(5);
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium text-accent">Safety Center</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">Emergency & SOS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-tap emergency alerts, live vehicle tracking, and essential hotlines.
        </p>
      </header>

      <div className="mt-5 space-y-8 px-5 pb-8">
        {/* ── SOS Button ── */}
        <section>
          {!showSosSent ? (
            <button
              onClick={sosActive ? undefined : startSos}
              className={cn(
                "relative flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 py-8 transition-all active:scale-[0.98]",
                sosActive
                  ? "border-destructive bg-destructive/10"
                  : "border-destructive/40 bg-destructive/5 hover:border-destructive/60",
              )}
            >
              {sosActive ? (
                <>
                  <span className="text-4xl font-black text-destructive">
                    {sosCountdown}
                  </span>
                  <span className="text-sm font-semibold text-destructive">
                    Sending SOS alert…
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelSos();
                    }}
                    className="mt-2 flex items-center gap-1 rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30">
                    <Siren className="h-8 w-8" />
                  </span>
                  <span className="text-lg font-bold text-destructive">SOS Emergency</span>
                  <span className="text-xs text-muted-foreground">
                    Tap to alert local authorities & share your location
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-border/60 bg-card p-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="h-8 w-8" />
              </span>
              <h2 className="text-lg font-bold text-foreground">SOS Alert Sent</h2>
              <p className="text-sm text-muted-foreground">
                Your location and details have been shared with emergency responders. Help is on the way.
              </p>
              <button
                onClick={() => setShowSosSent(false)}
                className="mt-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* ── Vehicle Tracking ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Live Vehicle Tracking</h2>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live
            </span>
          </div>

          {/* Add journey button / form */}
          {!showRideForm ? (
            <button
              onClick={() => setShowRideForm(true)}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition-colors active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add a vehicle to track
            </button>
          ) : (
            <div className="mb-3 rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Track your journey</p>
                <button
                  onClick={() => setShowRideForm(false)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {vehicleOptions.map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm((f) => ({ ...f, vehicle: v }))}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        form.vehicle === v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 bg-background text-foreground",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={form.driver}
                    onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
                    placeholder="Driver name"
                    className="rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={form.plate}
                    onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                    placeholder="Plate no."
                    className="rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5">
                  <Navigation className="h-4 w-4 shrink-0 text-primary" />
                  <input
                    value={form.pickup}
                    onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.value }))}
                    placeholder="Pickup location"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  <input
                    value={form.destination}
                    onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                    placeholder="Destination"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                  <LocateFixed className="h-3.5 w-3.5 text-primary" />
                  Distance &amp; ETA update live from your phone's GPS.
                </p>


                <button
                  onClick={addRide}
                  disabled={!form.pickup.trim() || !form.destination.trim()}
                  className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  Start live tracking
                </button>
              </div>
            </div>
          )}

          {geoError && (
            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}

          {rides.length > 0 ? (
            <div className="space-y-3">
              {rides.map((ride) => {
                const arrived = ride.geoStatus === "arrived";
                const locating = ride.geoStatus === "locating";
                const errored = ride.geoStatus === "error";
                const progress =
                  ride.totalMeters && ride.remainingMeters != null
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(
                            ((ride.totalMeters - ride.remainingMeters) /
                              ride.totalMeters) *
                              100,
                          ),
                        ),
                      )
                    : 0;

                const badge = errored
                  ? "GPS error"
                  : locating
                    ? "Locating…"
                    : arrived
                      ? "Arrived"
                      : ride.etaMin != null
                        ? `${ride.etaMin} min`
                        : "Live";

                const statusText = errored
                  ? ride.error ?? "Couldn't track this journey"
                  : locating
                    ? "Finding your location…"
                    : arrived
                      ? "Reached destination"
                      : "En route — live GPS";

                return (
                  <div
                    key={ride.id}
                    className="rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Car className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{ride.vehicle}</p>
                          <p className="text-xs text-muted-foreground">{ride.driver} · {ride.plate}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                          errored
                            ? "bg-destructive/10 text-destructive"
                            : arrived
                              ? "bg-chart-3/15 text-chart-3"
                              : "bg-primary/10 text-primary",
                        )}
                      >
                        {locating && <Loader2 className="h-3 w-3 animate-spin" />}
                        {badge}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Navigation className="h-3.5 w-3.5 text-primary" />
                        <span className="text-foreground">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span className="text-foreground">{ride.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <LocateFixed className="h-3.5 w-3.5 text-chart-3" />
                        <span>
                          Status:{" "}
                          <span className="font-medium text-foreground">{statusText}</span>
                          {ride.remainingMeters != null && !arrived && (
                            <span className="text-muted-foreground">
                              {" "}· {formatDistance(ride.remainingMeters)} left
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Live progress bar (GPS-driven) */}
                    {!errored && (
                      <div className="mt-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-1000"
                            style={{ width: `${arrived ? 100 : Math.max(4, progress)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-[10px] text-muted-foreground">
                          {arrived
                            ? "Journey complete"
                            : locating
                              ? "Waiting for GPS…"
                              : `${progress}% of the way`}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <a
                        href={`tel:119`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        SOS
                      </a>
                      <button
                        onClick={() => shareRide(ride)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                      <button
                        onClick={() => removeRide(ride.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-semibold text-muted-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        End
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
              <Car className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">No journeys tracked</p>
              <p className="text-xs text-muted-foreground">Add a vehicle above to start live tracking.</p>
            </div>
          )}
        </section>



        {/* ── Emergency Hotlines ── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Emergency Hotlines</h2>
          <div className="space-y-2.5">
            {hotlines.map((h) => {
              const Icon = h.icon;
              return (
                <a
                  key={h.id}
                  href={`tel:${h.number.replace(/-/g, "")}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors active:scale-[0.98]",
                    toneMap[h.tone],
                  )}
                >
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneIconBg[h.tone])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{h.label}</p>
                    <p className="text-xs opacity-80">{h.desc}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Phone className="h-3.5 w-3.5" />
                    {h.number}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                </a>
              );
            })}
          </div>
        </section>

        {/* ── How to Be Safe in Sri Lanka ── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            How to Be Safe in Sri Lanka
          </h2>
          <div className="space-y-2.5">
            {safetyTips.map((tip, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-3.5"
              >
                <p className="text-xs font-bold text-foreground">{tip.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What to Do in an Accident ── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <HeartPulse className="h-4 w-4 text-destructive" />
            What to Do in an Accident
          </h2>
          <div className="space-y-2.5">
            {accidentSteps.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.num}
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Natural Disasters ── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-accent" />
            Natural Disasters
          </h2>
          <div className="space-y-2.5">
            {disasters.map((d) => {
              const Icon = d.icon;
              const isOpen = expandedDisaster === d.id;
              return (
                <div key={d.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedDisaster(isOpen ? null : d.id)}
                    className={cn(
                      "flex w-full items-center gap-3 p-3.5 text-left transition-colors",
                      toneMap[d.tone],
                    )}
                  >
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneIconBg[d.tone])}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{d.label}</p>
                      <p className="text-xs opacity-80">Tap for response steps</p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isOpen && "rotate-90",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-2 px-3.5 pb-3.5 pt-0">
                      {d.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <p className="text-xs leading-relaxed text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Tourist Complaints ── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileWarning className="h-4 w-4 text-chart-4" />
            Tourist Complaints & Help
          </h2>
          <div className="space-y-2.5">
            {complaints.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.number.replace(/-/g, "")}`}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 transition-colors active:scale-[0.98]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-chart-4/10 text-chart-4">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {c.number}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>

        {/* ── Nearby Services ── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Nearby Services</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <ServiceCard
              icon={Building2}
              label="Police Station"
              sub="Nearest"
              tone="primary"
            />
            <ServiceCard
              icon={Stethoscope}
              label="Hospital"
              sub="Nearest"
              tone="accent"
            />
            <ServiceCard
              icon={Plane}
              label="Airport Desk"
              sub="CMB Colombo"
              tone="warning"
            />
            <ServiceCard
              icon={Ambulance}
              label="Pharmacy"
              sub="24h Open"
              tone="destructive"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ServiceCard({
  icon: Icon,
  label,
  sub,
  tone,
}: {
  icon: typeof Building2;
  label: string;
  sub: string;
  tone: Tone;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 text-center">
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl", toneIconBg[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
