import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ChevronLeft, Heart, MapPin, Shield, Truck, Users, MessageCircle, ShoppingBag, Globe, Calendar } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Visit Sri Lanka" },
      { name: "description", content: "Learn about Visit Sri Lanka, your all-in-one travel companion for exploring Sri Lanka." },
      { property: "og:title", content: "About — Visit Sri Lanka" },
      { property: "og:description", content: "Your all-in-one Sri Lanka travel companion." },
    ],
  }),
  component: AboutPage,
});

const features = [
  { icon: MapPin, label: "Explore", desc: "Discover iconic destinations, beaches, temples, and hidden gems across Sri Lanka." },
  { icon: Truck, label: "Transport", desc: "Book Tuk Tuks, cars, vans, and buses with live driver tracking." },
  { icon: Globe, label: "Translation", desc: "Translate Sinhala, Tamil, and English in real time by text, voice, or camera." },
  { icon: Shield, label: "Safety", desc: "SOS alerts, live location sharing, and emergency contacts at your fingertips." },
  { icon: Users, label: "Tour Guides", desc: "Connect with verified local guides who speak your language." },
  { icon: MessageCircle, label: "AI Assistant", desc: "Get personalized travel tips, itineraries, and local advice instantly." },
  { icon: ShoppingBag, label: "Essentials", desc: "Order groceries, food, and daily essentials delivered to your hotel or rental." },
  { icon: Calendar, label: "Group Trips", desc: "Plan shared itineraries, split expenses, and stay connected with your group." },
];

const team = [
  { name: "Alston Mathew Quyn", role: "Founder & Lead Developer" },
  { name: "Chanuka Lakshan", role: "Co-Founder & Developer" },
  { name: "Pabasara Perera", role: "Co-Founder & Developer" },
];

function AboutPage() {
  return (
    <AppShell>
      <div className="px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">About</h1>
        </div>

        {/* Intro */}
        <section className="mt-6 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
          <h2 className="font-display text-lg font-bold text-foreground">Visit Sri Lanka</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your all-in-one travel companion designed to make every moment in Sri Lanka unforgettable.
            From booking rides and finding guides to exploring destinations and staying safe,
            we bring everything you need into one seamless experience.
          </p>
        </section>

        {/* What you can do */}
        <section className="mt-7">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            What you can do
          </h3>
          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mt-7">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Team
          </h3>
          <div className="space-y-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <span className="text-sm font-bold">
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-accent" />
          <span>Made with love for Sri Lanka</span>
        </div>
      </div>
    </AppShell>
  );
}
