-- Create storage bucket for token images
INSERT INTO storage.buckets (id, name, public)
VALUES ('token-images', 'token-images', true);

-- Storage policies for token images
CREATE POLICY "Anyone can view token images"
ON storage.objects FOR SELECT
USING (bucket_id = 'token-images');

CREATE POLICY "Authenticated users can upload token images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'token-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own token images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'token-images'
  AND auth.uid() IS NOT NULL
);

-- Create tokens table to store token metadata
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  contract_address TEXT,
  transaction_hash TEXT,
  total_supply TEXT DEFAULT '1000000000',
  network TEXT DEFAULT 'atlantic-2',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can view tokens
CREATE POLICY "Tokens are viewable by everyone"
ON public.tokens FOR SELECT
USING (true);

-- Authenticated users can create tokens
CREATE POLICY "Authenticated users can create tokens"
ON public.tokens FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own tokens
CREATE POLICY "Users can update their own tokens"
ON public.tokens FOR UPDATE
USING (creator_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_tokens_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tokens_timestamp
BEFORE UPDATE ON public.tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_tokens_updated_at();