-- Update tokens table policy to allow inserts without auth (wallet-based)
DROP POLICY IF EXISTS "Authenticated users can create tokens" ON public.tokens;

CREATE POLICY "Anyone can create tokens"
ON public.tokens FOR INSERT
WITH CHECK (true);