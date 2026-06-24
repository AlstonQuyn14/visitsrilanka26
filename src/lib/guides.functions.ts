import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function supabasePublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

// Public-safe columns only. Contact details (phone/email) are intentionally
// excluded so they are never exposed to anonymous visitors.
const PUBLIC_GUIDE_COLUMNS =
  "id, name, photo_url, bio, languages, specialties, location, price_per_day, rating, reviews_count, is_verified, experience_years, certifications, created_at, updated_at";

export const getGuides = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("guides")
    .select(PUBLIC_GUIDE_COLUMNS)
    .order("is_verified", { ascending: false })
    .order("rating", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

// Contact details require an authenticated session. RLS + column grants ensure
// only signed-in users can read phone/email.
export const getGuideContact = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: guide, error } = await context.supabase
      .from("guides")
      .select("contact_phone, contact_email")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return {
      contact_phone: guide?.contact_phone ?? null,
      contact_email: guide?.contact_email ?? null,
    };
  });

const createGuideSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().min(1).max(2000),
  languages: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
  specialties: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
  location: z.string().trim().min(1).max(120),
  price_per_day: z.number().int().min(0).max(10_000_000),
  contact_phone: z.string().trim().min(1).max(40),
  contact_email: z.string().trim().email().max(200),
  experience_years: z.number().int().min(0).max(100),
  certifications: z.array(z.string().trim().min(1).max(100)).max(30),
  photo_url: z.string().trim().url().max(2000).optional(),
});

export type CreateGuideInput = z.infer<typeof createGuideSchema>;

export const createGuide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createGuideSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: inserted, error } = await context.supabase
      .from("guides")
      .insert({
        user_id: context.userId,
        name: data.name,
        bio: data.bio,
        languages: data.languages,
        specialties: data.specialties,
        location: data.location,
        price_per_day: data.price_per_day,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        experience_years: data.experience_years,
        certifications: data.certifications,
        photo_url: data.photo_url ?? null,
      })
      .select(PUBLIC_GUIDE_COLUMNS)
      .single();
    if (error) throw error;
    return inserted;
  });
