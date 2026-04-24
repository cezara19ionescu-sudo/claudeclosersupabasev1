-- ============================================
-- CLEANUP: Drop all existing tables (fresh start)
-- Run this FIRST, then run supabase-schema.sql
-- ============================================

-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.job_reviews CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.credentials CASCADE;
DROP TABLE IF EXISTS public.slots CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.portfolio_items CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.professionals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Also drop any leftover tables from previous attempts
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
