import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  Check,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Compass,
  BadgeCheck,
  Star,
  Plus,
  X,
  DollarSign,
  Briefcase,
  Award,
  Camera,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { createGuide } from "@/lib/guides.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guides/register")({
  head: () => ({
    meta: [
      { title: "Become a Guide — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Register as a local tour guide in Sri Lanka. Share your languages, specialties, and experience with travelers.",
      },
      { property: "og:title", content: "Become a Guide — Visit Sri Lanka" },
      {
        property: "og:description",
        content: "Join our verified local guide network and connect with travelers.",
      },
    ],
  }),
  component: RegisterGuide,
});

const allLanguages = [
  "English", "Sinhala", "Tamil", "French", "German", "Mandarin",
  "Japanese", "Russian", "Hindi", "Arabic", "Spanish", "Italian",
];

const allSpecialties = [
  "Historical", "Cultural", "Nature", "Wildlife", "Adventure",
  "Beach", "Food", "Photography", "Temples", "Tea Country",
  "Surfing", "Diving", "Bird Watching", "Archaeology",
];

const locations = [
  "Colombo", "Kandy", "Galle", "Sigiriya", "Ella", "Yala",
  "Anuradhapura", "Nuwara Eliya", "Trincomalee", "Jaffna",
  "Negombo", "Mirissa", "Unawatuna", "Polonnaruwa", "Dambulla",
];

function RegisterGuide() {
  const queryClient = useQueryClient();
  const submitGuide = useServerFn(createGuide);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthed(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);


  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");

  const canSubmit =
    name.trim() &&
    bio.trim() &&
    selectedLangs.length > 0 &&
    selectedSpecs.length > 0 &&
    location &&
    price &&
    phone.trim() &&
    email.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await submitGuide({
        data: {
          name: name.trim(),
          bio: bio.trim(),
          languages: selectedLangs,
          specialties: selectedSpecs,
          location,
          price_per_day: Number(price),
          contact_phone: phone.trim(),
          contact_email: email.trim(),
          experience_years: Number(experience) || 0,
          certifications,
          photo_url: photoUrl.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleLang(lang: string) {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

  function toggleSpec(spec: string) {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  }

  function addCert() {
    const trimmed = certInput.trim();
    if (!trimmed || certifications.includes(trimmed)) return;
    setCertifications([...certifications, trimmed]);
    setCertInput("");
  }

  function removeCert(cert: string) {
    setCertifications(certifications.filter((c) => c !== cert));
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <Check className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground">Application Sent!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your guide profile is under review. We will verify your details and contact you within 24–48 hours.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Link
              to="/guides"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <Compass className="h-4 w-4" />
              Browse All Guides
            </Link>
            <Link
              to="/"
              className="w-full rounded-2xl border border-border/60 py-3.5 text-sm font-semibold text-foreground"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link
          to="/guides"
          className="mb-3 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Guides
        </Link>
        <p className="text-xs font-medium text-accent">Local Expert</p>
        <h1 className="mt-0.5 text-2xl font-bold text-foreground">Become a Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your passion for Sri Lanka with travelers from around the world.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-5 pb-8">
        {/* Photo preview */}
        <section>
          <label className="block text-sm font-semibold text-foreground">Profile Photo</label>
          <p className="text-xs text-muted-foreground">Paste a photo URL or leave blank for initials.</p>
          <div className="mt-2 flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                <User className="h-6 w-6" />
              </span>
            )}
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              type="url"
              placeholder="https://example.com/photo.jpg"
              className="flex-1 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </section>

        {/* Basic info */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Basic Info</h2>

          <InputField
            icon={<User className="h-5 w-5 text-primary" />}
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Your full name"
            required
          />

          <InputField
            icon={<MapPin className="h-5 w-5 text-accent" />}
            label="Primary location"
            value={location}
            onChange={setLocation}
            placeholder="Where do you usually guide?"
            required
            isSelect
            options={locations}
          />

          <InputField
            icon={<DollarSign className="h-5 w-5 text-chart-3" />}
            label="Price per day (LKR)"
            value={price}
            onChange={setPrice}
            placeholder="e.g., 5000"
            type="number"
            required
          />

          <InputField
            icon={<Briefcase className="h-5 w-5 text-chart-5" />}
            label="Years of experience"
            value={experience}
            onChange={setExperience}
            placeholder="e.g., 5"
            type="number"
          />
        </section>

        {/* Bio */}
        <section>
          <h2 className="text-sm font-semibold text-foreground">About You</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell travelers about yourself, your background, and what makes your tours special..."
            rows={4}
            className="mt-2 w-full rounded-2xl border border-border/70 bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            required
          />
        </section>

        {/* Languages */}
        <section>
          <h2 className="text-sm font-semibold text-foreground">Languages Spoken</h2>
          <p className="text-xs text-muted-foreground">Select all that apply.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedLangs.includes(lang)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                )}
              >
                <Globe className="h-3 w-3" />
                {lang}
              </button>
            ))}
          </div>
        </section>

        {/* Specialties */}
        <section>
          <h2 className="text-sm font-semibold text-foreground">Tour Specialties</h2>
          <p className="text-xs text-muted-foreground">Select all that apply.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allSpecialties.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedSpecs.includes(spec)
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                )}
              >
                <Compass className="h-3 w-3" />
                {spec}
              </button>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="text-sm font-semibold text-foreground">Certifications</h2>
          <p className="text-xs text-muted-foreground">SLTDA, first aid, or other relevant certs.</p>
          <div className="mt-2 flex gap-2">
            <input
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="e.g., SLTDA License"
              className="flex-1 rounded-2xl border border-border/70 bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
            />
            <button
              type="button"
              onClick={addCert}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {certifications.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  <Award className="h-3 w-3" />
                  {cert}
                  <button type="button" onClick={() => removeCert(cert)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Contact Details</h2>

          <InputField
            icon={<Phone className="h-5 w-5 text-primary" />}
            label="Phone number"
            value={phone}
            onChange={setPhone}
            placeholder="e.g., +94 77 123 4567"
            type="tel"
            required
          />

          <InputField
            icon={<Mail className="h-5 w-5 text-accent" />}
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            type="email"
            required
          />
        </section>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <BadgeCheck className="h-4 w-4" />
          )}
          Submit Application
        </button>
      </form>
    </AppShell>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  isSelect,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  isSelect?: boolean;
  options?: string[];
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium text-muted-foreground">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
        {isSelect && options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none"
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type={type}
            placeholder={placeholder}
            required={required}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        )}
      </span>
    </label>
  );
}
