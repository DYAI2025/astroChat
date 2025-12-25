-- AstroMirror Webapp - Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT DEFAULT 'de' NOT NULL,
  timezone TEXT DEFAULT 'Europe/Berlin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Birth data table
CREATE TABLE IF NOT EXISTS birth_data (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  birth_utc TIMESTAMPTZ NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lon DECIMAL(9,6) NOT NULL,
  place_label TEXT,
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Entitlements table (plans & usage)
CREATE TABLE IF NOT EXISTS entitlements (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'premium')),
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'past_due', 'canceled')),
  voice_minutes_monthly INTEGER DEFAULT 3 NOT NULL,
  voice_minutes_used INTEGER DEFAULT 0 NOT NULL,
  period_start TIMESTAMPTZ DEFAULT now() NOT NULL,
  period_end TIMESTAMPTZ DEFAULT (now() + interval '1 month') NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Natal charts table
CREATE TABLE IF NOT EXISTS natal_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  engine_version TEXT DEFAULT 'swisseph-2.10' NOT NULL,
  zodiac TEXT DEFAULT 'tropical' NOT NULL,
  house_system TEXT DEFAULT 'placidus' NOT NULL,
  warnings JSONB DEFAULT '{}' NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_type TEXT DEFAULT 'cosmic-archetype' NOT NULL,
  answers JSONB DEFAULT '{}' NOT NULL,
  scores JSONB,
  profile_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Birth data policies
DROP POLICY IF EXISTS "Users can view own birth data" ON birth_data;
CREATE POLICY "Users can view own birth data" ON birth_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own birth data" ON birth_data;
CREATE POLICY "Users can insert own birth data" ON birth_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own birth data" ON birth_data;
CREATE POLICY "Users can update own birth data" ON birth_data FOR UPDATE USING (auth.uid() = user_id);

-- Entitlements policies
DROP POLICY IF EXISTS "Users can view own entitlements" ON entitlements;
CREATE POLICY "Users can view own entitlements" ON entitlements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entitlements" ON entitlements;
CREATE POLICY "Users can insert own entitlements" ON entitlements FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entitlements" ON entitlements;
CREATE POLICY "Users can update own entitlements" ON entitlements FOR UPDATE USING (auth.uid() = user_id);

-- Natal charts policies
DROP POLICY IF EXISTS "Users can view own charts" ON natal_charts;
CREATE POLICY "Users can view own charts" ON natal_charts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own charts" ON natal_charts;
CREATE POLICY "Users can insert own charts" ON natal_charts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON quiz_sessions;
CREATE POLICY "Users can view own sessions" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON quiz_sessions;
CREATE POLICY "Users can insert own sessions" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON quiz_sessions;
CREATE POLICY "Users can update own sessions" ON quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, locale, timezone)
  VALUES (NEW.id, 'de', 'Europe/Berlin');

  INSERT INTO public.entitlements (user_id, plan, voice_minutes_monthly)
  VALUES (NEW.id, 'free', 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_birth_data_user_id ON birth_data(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_natal_charts_user_id ON natal_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at DESC);
