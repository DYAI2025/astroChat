-- Voice Chat Backend Schema Extension
-- Run this after 001_initial_schema.sql in Supabase SQL Editor

-- Voice Consents Table
CREATE TABLE IF NOT EXISTS voice_consents (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  consent_text TEXT NOT NULL,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_withdrawn CHECK (withdrawn_at IS NULL OR withdrawn_at > consent_at)
);

-- Voice Sessions Table
CREATE TABLE IF NOT EXISTS voice_sessions (
  id TEXT PRIMARY KEY,  -- Format: vs_xxxxx
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  elevenlabs_session_id TEXT UNIQUE,
  elevenlabs_conversation_id TEXT,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'failed', 'expired')),
  voice_mode TEXT NOT NULL CHECK (voice_mode IN ('analytical', 'warm')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Voice Audit Logs Table
CREATE TABLE IF NOT EXISTS voice_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT REFERENCES voice_sessions(id) ON DELETE SET NULL,
  conversation_id TEXT,
  event_type TEXT NOT NULL,  -- 'session_created', 'context_accessed', 'session_ended', 'consent_granted', 'consent_withdrawn'
  data_accessed JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_voice_consents_user_id ON voice_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started_at ON voice_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_elevenlabs_session_id ON voice_sessions(elevenlabs_session_id);
CREATE INDEX IF NOT EXISTS idx_voice_audit_user_id ON voice_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_audit_session_id ON voice_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_audit_created_at ON voice_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_audit_event_type ON voice_audit_logs(event_type);

-- Row Level Security
ALTER TABLE voice_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_audit_logs ENABLE ROW LEVEL SECURITY;

-- Voice Consents Policies
DROP POLICY IF EXISTS "Users can view own consent" ON voice_consents;
CREATE POLICY "Users can view own consent" ON voice_consents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent" ON voice_consents;
CREATE POLICY "Users can insert own consent" ON voice_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own consent" ON voice_consents;
CREATE POLICY "Users can update own consent" ON voice_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- Voice Sessions Policies
DROP POLICY IF EXISTS "Users can view own sessions" ON voice_sessions;
CREATE POLICY "Users can view own sessions" ON voice_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON voice_sessions;
CREATE POLICY "Users can insert own sessions" ON voice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can update sessions (for webhook)
DROP POLICY IF EXISTS "Service role can update sessions" ON voice_sessions;
CREATE POLICY "Service role can update sessions" ON voice_sessions
  FOR UPDATE USING (true);

-- Voice Audit Logs Policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON voice_audit_logs;
CREATE POLICY "Users can view own audit logs" ON voice_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert audit logs" ON voice_audit_logs;
CREATE POLICY "Service role can insert audit logs" ON voice_audit_logs
  FOR INSERT WITH CHECK (true);

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_voice_consents_updated_at ON voice_consents;
CREATE TRIGGER update_voice_consents_updated_at
  BEFORE UPDATE ON voice_consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_sessions_updated_at ON voice_sessions;
CREATE TRIGGER update_voice_sessions_updated_at
  BEFORE UPDATE ON voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Clean up old data (DSGVO retention policy)
CREATE OR REPLACE FUNCTION cleanup_voice_data()
RETURNS void AS $$
BEGIN
  -- Delete sessions older than 90 days
  DELETE FROM voice_sessions
  WHERE created_at < now() - interval '90 days';

  -- Delete audit logs older than 2 years
  DELETE FROM voice_audit_logs
  WHERE created_at < now() - interval '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Set up a cron job in Supabase to run cleanup_voice_data() daily
-- Example: SELECT cron.schedule('cleanup-voice-data', '0 2 * * *', 'SELECT cleanup_voice_data()');

COMMENT ON TABLE voice_consents IS 'DSGVO-compliant consent tracking for voice features';
COMMENT ON TABLE voice_sessions IS 'Voice conversation sessions with ElevenLabs';
COMMENT ON TABLE voice_audit_logs IS 'Audit trail for data access (DSGVO Art. 5(2))';
COMMENT ON FUNCTION cleanup_voice_data IS 'Automated cleanup per DSGVO retention policy';
