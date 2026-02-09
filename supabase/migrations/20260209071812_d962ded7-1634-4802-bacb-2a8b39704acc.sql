
-- Create enum for silo status
CREATE TYPE public.silo_status AS ENUM ('normal', 'warning', 'critical');

-- Create enum for pest activity
CREATE TYPE public.pest_activity AS ENUM ('none', 'low', 'moderate', 'high');

-- Create silos table
CREATE TABLE public.silos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  grain_type TEXT NOT NULL,
  grain_amount NUMERIC NOT NULL DEFAULT 0,
  capacity NUMERIC NOT NULL DEFAULT 0,
  temperature NUMERIC NOT NULL DEFAULT 0,
  humidity NUMERIC NOT NULL DEFAULT 0,
  pest_activity public.pest_activity NOT NULL DEFAULT 'none',
  co2_level NUMERIC,
  status public.silo_status NOT NULL DEFAULT 'normal',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.silos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Silos are publicly readable"
  ON public.silos
  FOR SELECT
  USING (true);

-- Insert the existing silo data
INSERT INTO public.silos (name, latitude, longitude, grain_type, grain_amount, capacity, temperature, humidity, pest_activity, co2_level, status, last_updated) VALUES
  ('Thanjavur Silo A1', 10.7870, 79.1378, 'Rice (Ponni)', 420, 500, 28.5, 62, 'none', 380, 'normal', '2026-02-09T08:30:00Z'),
  ('Thanjavur Silo A2', 10.7900, 79.1420, 'Wheat', 310, 500, 34.2, 78, 'moderate', 520, 'warning', '2026-02-09T08:28:00Z'),
  ('Madurai Storage B1', 9.9252, 78.1198, 'Maize', 180, 300, 30.1, 55, 'low', 400, 'normal', '2026-02-09T08:25:00Z'),
  ('Coimbatore Silo C1', 11.0168, 76.9558, 'Rice (Basmati)', 490, 500, 38.7, 85, 'high', 680, 'critical', '2026-02-09T08:32:00Z'),
  ('Trichy Silo D1', 10.7905, 78.7047, 'Millet (Ragi)', 220, 400, 27.3, 48, 'none', 350, 'normal', '2026-02-09T08:20:00Z'),
  ('Salem Storage E1', 11.6643, 78.1460, 'Groundnut', 150, 250, 31.5, 70, 'low', 410, 'normal', '2026-02-09T08:18:00Z'),
  ('Erode Silo F1', 11.3410, 77.7172, 'Turmeric', 95, 200, 36.0, 82, 'moderate', 590, 'warning', '2026-02-09T08:15:00Z'),
  ('Tirunelveli Silo G1', 8.7139, 77.7567, 'Rice (Seeraga Samba)', 340, 400, 29.8, 60, 'none', 370, 'normal', '2026-02-09T08:22:00Z');

-- Enable realtime for silos table
ALTER PUBLICATION supabase_realtime ADD TABLE public.silos;
