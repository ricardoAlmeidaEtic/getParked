-- Create public_spot_markers table
CREATE TABLE IF NOT EXISTS public_spot_markers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL DEFAULT 'public',
  total_spots INTEGER NOT NULL DEFAULT 1,
  available_spots INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_public_spot_markers_user_id ON public_spot_markers(user_id);
CREATE INDEX IF NOT EXISTS idx_public_spot_markers_status ON public_spot_markers(status);

-- Enable Row Level Security
ALTER TABLE public_spot_markers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários podem ver todas as vagas públicas"
  ON public_spot_markers FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem criar vagas públicas"
  ON public_spot_markers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias vagas"
  ON public_spot_markers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias vagas"
  ON public_spot_markers FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_public_spot_markers_updated_at
  BEFORE UPDATE ON public_spot_markers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 