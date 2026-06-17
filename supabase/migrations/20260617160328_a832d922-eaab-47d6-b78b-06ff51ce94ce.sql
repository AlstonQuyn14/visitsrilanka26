CREATE TABLE public.guides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    photo_url text,
    bio text,
    languages text[] NOT NULL DEFAULT '{}',
    specialties text[] NOT NULL DEFAULT '{}',
    location text NOT NULL,
    price_per_day integer NOT NULL DEFAULT 0,
    rating numeric NOT NULL DEFAULT 0,
    reviews_count integer NOT NULL DEFAULT 0,
    is_verified boolean NOT NULL DEFAULT false,
    contact_phone text,
    contact_email text,
    experience_years integer NOT NULL DEFAULT 0,
    certifications text[] NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.guides TO anon;
GRANT SELECT, INSERT ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guides"
ON public.guides
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can register as a guide"
ON public.guides
FOR INSERT
TO public
WITH CHECK (true);

CREATE TRIGGER update_guides_updated_at
BEFORE UPDATE ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();