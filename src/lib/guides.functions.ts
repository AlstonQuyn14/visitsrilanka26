import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

export const getGuides = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("is_verified", { ascending: false })
    .order("rating", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export interface CreateGuideInput {
  name: string;
  bio: string;
  languages: string[];
  specialties: string[];
  location: string;
  price_per_day: number;
  contact_phone: string;
  contact_email: string;
  experience_years: number;
  certifications: string[];
  photo_url?: string;
}

export const createGuide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    return data as CreateGuideInput;
  })
  .handler(async ({ data }) => {
    const supabase = supabasePublic();
    const { data: inserted, error } = await supabase
      .from("guides")
      .insert({
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
      .select()
      .single();
    if (error) throw error;
    return inserted;
  });
