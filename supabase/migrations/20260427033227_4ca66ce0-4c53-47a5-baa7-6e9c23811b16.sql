-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- transaction ledger
CREATE TABLE public.transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  location TEXT NOT NULL,
  user_behavior TEXT,
  fraud_score INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe','suspicious','fraud')),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own ledger" ON public.transaction_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own ledger" ON public.transaction_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ledger_user_id ON public.transaction_ledger(user_id);
CREATE INDEX idx_ledger_status ON public.transaction_ledger(status);
CREATE INDEX idx_ledger_analyzed_at ON public.transaction_ledger(analyzed_at DESC);