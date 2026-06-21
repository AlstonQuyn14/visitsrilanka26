CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cause_id text NOT NULL,
  cause_name text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  donor_name text,
  donor_email text,
  status text NOT NULL DEFAULT 'completed',
  paddle_transaction_id text UNIQUE,
  receipt_sent boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_transaction ON public.donations(paddle_transaction_id);