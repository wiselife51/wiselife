-- Columna para guardar como supieron de Vida Sabia (array de opciones)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_sources TEXT[] DEFAULT '{}';

-- Columna para indicar si completo la encuesta de referencia
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_completed BOOLEAN DEFAULT FALSE;
