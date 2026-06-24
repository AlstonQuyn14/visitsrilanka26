ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.force_guide_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_verified := false;
  NEW.rating := 0;
  NEW.reviews_count := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS force_guide_defaults_trigger ON public.guides;
CREATE TRIGGER force_guide_defaults_trigger
BEFORE INSERT ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.force_guide_defaults();

DROP POLICY IF EXISTS "Authenticated users can register as a guide" ON public.guides;
CREATE POLICY "Authenticated users can register as a guide"
  ON public.guides FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own guide profile"
  ON public.guides FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own guide profile"
  ON public.guides FOR DELETE TO authenticated
  USING (user_id = auth.uid());