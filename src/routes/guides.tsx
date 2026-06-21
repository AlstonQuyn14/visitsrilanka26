import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  Search,
  SlidersHorizontal,
  Globe,
  Compass,
  X,
  CalendarCheck,
  Lock,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CheckoutSheet } from "@/components/CheckoutSheet";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getGuides, getGuideContact } from "@/lib/guides.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Guide rates are stored in Sri Lankan Rupees; checkout charges in USD.
const LKR_PER_USD = 300;
function lkrToUsd(lkr: number): number {
  return Math.max(0.7, Math.round((lkr / LKR_PER_USD) * 100) / 100);
}

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Tour Guides — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Find verified local tour guides across Sri Lanka. Filter by language, specialty, and location.",
      },
      { property: "og:title", content: "Tour Guides — Visit Sri Lanka" },
      {
        property: "og:description",
        content: "Browse verified local guides for your Sri Lanka adventure.",
      },
    ],
  }),
  component: Guides,
});

const allLanguages = ["English", "Sinhala", "Tamil", "French", "German", "Mandarin", "Japanese", "Russian", "Hindi", "Arabic"];
const allSpecialties = ["Historical", "Cultural", "Nature", "Wildlife", "Adventure", "Beach", "Food", "Photography", "Temples", "Tea Country"];
const allLocations = ["Colombo", "Kandy", "Galle", "Sigiriya", "Ella", "Yala", "Anuradhapura", "Nuwara Eliya", "Trincomalee", "Jaffna"];

function Guides() {
  const fetchGuides = useServerFn(getGuides);
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["guides"],
    queryFn: () => fetchGuides(),
  });

  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState<string | null>(null);
  const [filterSpec, setFilterSpec] = useState<string | null>(null);
  const [filterLoc, setFilterLoc] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [booking, setBooking] = useState<any | null>(null);

  const filtered = guides.filter((g) => {
    const matchesSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.bio?.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase());
    const matchesLang = !filterLang || g.languages?.includes(filterLang);
    const matchesSpec = !filterSpec || g.specialties?.includes(filterSpec);
    const matchesLoc = !filterLoc || g.location === filterLoc;
    return matchesSearch && matchesLang && matchesSpec && matchesLoc;
  });

  const activeFilters = [filterLang, filterSpec, filterLoc].filter(Boolean).length;

  function clearFilters() {
    setFilterLang(null);
    setFilterSpec(null);
    setFilterLoc(null);
  }

  return (
    <AppShell>
      <PaymentTestModeBanner />
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xs font-medium text-accent">Local Experts</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">Tour Guides</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find verified local guides who speak your language and know the hidden gems.
        </p>
      </header>

      {/* Search + Filter bar */}
      <div className="mt-4 px-5">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, locations..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-2xl border shadow-sm transition-colors",
              activeFilters > 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterLang && (
              <FilterChip label={filterLang} onRemove={() => setFilterLang(null)} />
            )}
            {filterSpec && (
              <FilterChip label={filterSpec} onRemove={() => setFilterSpec(null)} />
            )}
            {filterLoc && (
              <FilterChip label={filterLoc} onRemove={() => setFilterLoc(null)} />
            )}
            <button
              onClick={clearFilters}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter panels */}
        {showFilters && (
          <div className="mt-3 space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            <FilterGroup
              title="Language"
              options={allLanguages}
              active={filterLang}
              onSelect={setFilterLang}
            />
            <FilterGroup
              title="Specialty"
              options={allSpecialties}
              active={filterSpec}
              onSelect={setFilterSpec}
            />
            <FilterGroup
              title="Location"
              options={allLocations}
              active={filterLoc}
              onSelect={setFilterLoc}
            />
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mt-4 flex items-center justify-between px-5">
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading guides..." : `${filtered.length} guide${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>


      {/* Guide Cards */}
      <div className="mt-3 space-y-3 px-5 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Compass className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No guides found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search.</p>
          </div>
        ) : (
          filtered.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onBook={setBooking} />
          ))
        )}
      </div>

      {booking && (
        <CheckoutSheet
          orderType="guide"
          itemId={String(booking.id)}
          itemName={`Guide: ${booking.name}`}
          amountUsd={lkrToUsd(Number(booking.price_per_day) || 0)}
          emoji="🧭"
          accent="bg-accent/15 text-accent"
          subtitle={`${booking.location} · 1 day`}
          extra={{
            days: "1",
            location: booking.location,
            priceLkr: String(booking.price_per_day ?? ""),
          }}
          onClose={() => setBooking(null)}
        />
      )}
    </AppShell>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterGroup({
  title,
  options,
  active,
  onSelect,
}: {
  title: string;
  options: string[];
  active: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(active === opt ? null : opt)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active === opt
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuideCard({
  guide,
  onBook,
}: {
  guide: any;
  onBook: (guide: any) => void;
}) {
  const initials = guide.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = ["bg-primary", "bg-accent", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
  const colorIndex = guide.name.length % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {guide.photo_url ? (
          <img
            src={guide.photo_url}
            alt={guide.name}
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-xl text-lg font-bold text-white",
              avatarColor,
            )}
          >
            {initials}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-foreground">{guide.name}</p>
            {guide.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {guide.location}
            {guide.experience_years > 0 && (
              <span className="ml-1">· {guide.experience_years} yrs exp</span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4" />
            <span className="text-xs font-bold text-foreground">
              {guide.rating ? Number(guide.rating).toFixed(1) : "New"}
            </span>
            {guide.reviews_count > 0 && (
              <span className="text-xs text-muted-foreground">({guide.reviews_count})</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-primary">Rs. {guide.price_per_day}</p>
          <p className="text-[10px] text-muted-foreground">per day</p>
        </div>
      </div>

      {/* Bio */}
      {guide.bio && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {guide.bio}
        </p>
      )}

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-1">
        {guide.languages?.slice(0, 3).map((lang: string) => (
          <span
            key={lang}
            className="flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <Globe className="h-2.5 w-2.5" />
            {lang}
          </span>
        ))}
        {guide.specialties?.slice(0, 3).map((spec: string) => (
          <span
            key={spec}
            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
          >
            {spec}
          </span>
        ))}
        {(guide.languages?.length > 3 || guide.specialties?.length > 3) && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            +{guide.languages.length + guide.specialties.length - 6} more
          </span>
        )}
      </div>

      {/* Contact buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {guide.contact_phone && (
          <a
            href={`tel:${guide.contact_phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        )}
        {guide.contact_email && (
          <a
            href={`mailto:${guide.contact_email}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-semibold text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        )}
      </div>

      <button
        onClick={() => onBook(guide)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
      >
        <CalendarCheck className="h-4 w-4" />
        Book guide · ${lkrToUsd(Number(guide.price_per_day) || 0).toLocaleString()}/day
      </button>
    </div>
  );
}
