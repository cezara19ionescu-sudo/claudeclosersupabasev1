-- ============================================
-- CLOSER APP - SUPABASE SCHEMA
-- Fresh start - run this in SQL Editor
-- ============================================

-- 1. USERS PROFILE TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'customer' CHECK (type IN ('customer', 'professional')),
  img TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFESSIONALS TABLE
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  img TEXT DEFAULT '',
  cat_id TEXT NOT NULL DEFAULT 'home',
  sub TEXT NOT NULL DEFAULT 'Handyman',
  rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  jobs_completed INT DEFAULT 0,
  location TEXT DEFAULT 'Local',
  price NUMERIC(10,2) DEFAULT 25,
  unit TEXT DEFAULT '/hr',
  verified_id INT DEFAULT 0,
  verified_dbs INT DEFAULT 0,
  verified_ins INT DEFAULT 0,
  about TEXT DEFAULT '',
  services TEXT[] DEFAULT '{}',
  is_emergency_available BOOLEAN DEFAULT FALSE,
  cover_img TEXT DEFAULT '',
  hired_count INT DEFAULT 0,
  response_time TEXT DEFAULT '',
  year_started INT,
  team_size TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  title TEXT DEFAULT '',
  type TEXT DEFAULT 'work' CHECK (type IN ('before', 'after', 'work')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS (on professional profiles)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT '',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  dt TEXT NOT NULL,
  times TEXT[] DEFAULT '{}'
);

-- 6. VERIFIED CREDENTIALS
CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL
);

-- 7. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- 8. JOBS / BOOKINGS
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  pro_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pro_name TEXT NOT NULL,
  pro_email TEXT DEFAULT '',
  pro_sub TEXT DEFAULT '',
  price TEXT DEFAULT '0',
  description TEXT DEFAULT '',
  slot TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'hired' CHECK (status IN ('hired', 'active', 'finish_requested', 'completed', 'cancelled', 'declined')),
  customer_finished BOOLEAN DEFAULT FALSE,
  pro_finished BOOLEAN DEFAULT FALSE,
  is_emergency BOOLEAN DEFAULT FALSE,
  is_disputed BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. JOB REVIEWS (customer review + pro review per job)
CREATE TABLE IF NOT EXISTS public.job_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_type TEXT NOT NULL CHECK (author_type IN ('customer', 'professional')),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  from_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_name TEXT NOT NULL,
  to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_cat_id ON public.professionals(cat_id);
CREATE INDEX IF NOT EXISTS idx_professionals_email ON public.professionals(email);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pro_user_id ON public.jobs(pro_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON public.messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON public.messages(from_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional_id ON public.portfolio_items(professional_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PROFILES: anyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PROFESSIONALS: anyone can read, owner can update
CREATE POLICY "Professionals are viewable by everyone" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Pros can insert own profile" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pros can update own profile" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);

-- PORTFOLIO: anyone can read, owner can manage
CREATE POLICY "Portfolio viewable by everyone" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Pros can manage own portfolio" ON public.portfolio_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);
CREATE POLICY "Pros can update own portfolio" ON public.portfolio_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);
CREATE POLICY "Pros can delete own portfolio" ON public.portfolio_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);

-- REVIEWS: anyone can read, authenticated users can create
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SLOTS: anyone can read, owner can manage
CREATE POLICY "Slots viewable by everyone" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Pros can manage own slots" ON public.slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);

-- CREDENTIALS: anyone can read, owner can manage
CREATE POLICY "Credentials viewable by everyone" ON public.credentials FOR SELECT USING (true);
CREATE POLICY "Pros can manage own credentials" ON public.credentials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);

-- FAQS: anyone can read, owner can manage
CREATE POLICY "FAQs viewable by everyone" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Pros can manage own faqs" ON public.faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
);

-- JOBS: participants can read their own jobs
CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = pro_user_id
);
CREATE POLICY "Customers can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Participants can update jobs" ON public.jobs FOR UPDATE USING (
  auth.uid() = customer_id OR auth.uid() = pro_user_id
);

-- JOB REVIEWS: participants can read, author can create
CREATE POLICY "Job reviews viewable by participants" ON public.job_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND (customer_id = auth.uid() OR pro_user_id = auth.uid()))
);
CREATE POLICY "Authenticated users can create job reviews" ON public.job_reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

-- MESSAGES: participants can read and send
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
  auth.uid() = from_id OR auth.uid() = to_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = from_id);
CREATE POLICY "Recipients can mark as read" ON public.messages FOR UPDATE USING (auth.uid() = to_id);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'type', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ENABLE REALTIME (for messages & jobs)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
