ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'ANALYST'
  CHECK (role IN ('ADMIN', 'ANALYST'));

CREATE INDEX idx_profiles_role ON public.profiles(role);
