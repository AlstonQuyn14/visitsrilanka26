-- Require authentication to register as a guide
DROP POLICY IF EXISTS "Anyone can register as a guide" ON public.guides;
CREATE POLICY "Authenticated users can register as a guide"
  ON public.guides FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Remove redundant always-true admin policies (service_role bypasses RLS already)
DROP POLICY IF EXISTS "Only admin can update guides" ON public.guides;
DROP POLICY IF EXISTS "Only admin can delete guides" ON public.guides;

-- Hide contact_phone / contact_email from anonymous visitors via column-level grants
REVOKE SELECT ON public.guides FROM anon;
GRANT SELECT (
  id, name, photo_url, bio, languages, specialties, location,
  price_per_day, rating, reviews_count, is_verified,
  experience_years, certifications, created_at, updated_at
) ON public.guides TO anon;

-- Authenticated users can read the full row (including contact details) and register
GRANT SELECT, INSERT ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;