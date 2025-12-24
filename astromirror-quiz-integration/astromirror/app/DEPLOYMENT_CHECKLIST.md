# AstroMirror – Deployment Checklist

## Pre-Deployment

### 1. Supabase Setup

- [ ] Create Supabase project
- [ ] Run migration: `supabase/migrations/0001_init.sql`
- [ ] Verify RLS policies active on all tables
- [ ] Copy credentials:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET` (from Settings → API → JWT Settings)

### 2. ElevenLabs Agent Setup

- [ ] Create Agent in ElevenLabs Dashboard
- [ ] Copy System Prompt from `docs/ELEVENLABS_AGENT_SETUP.md`
- [ ] Configure Tool: `get_context`
  - URL: `https://api.YOUR_DOMAIN/v1/elevenlabs/tool/get_context`
  - Auth: Bearer `{{secret__session_token}}`
- [ ] Add Dynamic Variables:
  - `user_name` (public)
  - `account_type` (public)
  - `sun_sign` (public)
  - `voice_mode` (public)
  - `secret__session_token` (secret ✓)
- [ ] Configure Webhook:
  - URL: `https://api.YOUR_DOMAIN/v1/elevenlabs/webhook/post-call`
  - Copy webhook secret → `ELEVENLABS_WEBHOOK_SECRET`
- [ ] Copy Agent ID → `ELEVENLABS_AGENT_ID`
- [ ] Copy API Key → `ELEVENLABS_API_KEY`

### 3. Swiss Ephemeris

- [ ] Download ephemeris files:
  ```bash
  # Required files: sepl_18.se1, semo_18.se1, seas_18.se1
  wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
  wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
  wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
  ```
- [ ] Place in `/usr/share/swisseph/ephe/` or configure `SWISSEPH_EPHE_PATH`

### 4. Generate Secrets

```bash
# Session Token Pepper
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Backend Deployment (Railway/Fly.io)

### Railway

```bash
cd apps/api
railway init
railway up
```

### Environment Variables (Set in Railway Dashboard)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
ELEVENLABS_WEBHOOK_SECRET=
SESSION_TOKEN_PEPPER=
CORS_ORIGINS=https://astromirror.io,https://www.astromirror.io
SWISSEPH_EPHE_PATH=/app/ephe
DEBUG=false
ENVIRONMENT=production
```

### Verify Deployment

```bash
curl https://api.YOUR_DOMAIN/health
# Expected: {"status":"healthy","version":"1.0.0"}

curl https://api.YOUR_DOMAIN/health/ready
# Expected: {"status":"ready","checks":{"database":"ok",...}}
```

---

## Frontend Deployment (Vercel)

### Deploy

```bash
cd apps/web
vercel --prod
```

### Environment Variables (Vercel Dashboard)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://astromirror.io
API_URL=https://api.astromirror.io
```

### Verify Deployment

- [ ] Homepage loads
- [ ] Quiz starts without auth
- [ ] Login/signup works
- [ ] Protected routes redirect to login
- [ ] Voice page shows (Premium required)

---

## Post-Deployment Verification

### API Tests

```bash
# Health
curl https://api.astromirror.io/health

# Docs (should be disabled in production)
curl https://api.astromirror.io/docs
# Expected: 404

# Voice session (requires auth)
curl -X POST https://api.astromirror.io/v1/voice/session \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json"
# Expected: 200 with signed_url (Premium) or 402 (Free)
```

### ElevenLabs Integration

- [ ] Create test Premium user
- [ ] Start voice session
- [ ] Verify ElevenLabs widget connects
- [ ] Speak and verify agent responds
- [ ] Verify `get_context` tool is called (check logs)
- [ ] End call and verify webhook fires
- [ ] Check `voice_conversations` table for record
- [ ] Check `voice_usage_daily` incremented

### Quiz Flow

- [ ] Start quiz without login
- [ ] Complete all 7 questions
- [ ] Verify profile shown matches answers
- [ ] Verify scores add up correctly

### Astro Calculations

- [ ] Create user with birth data
- [ ] Compute natal chart
- [ ] Verify planets, houses, aspects
- [ ] Test polar location (lat > 66°) → fallback message

---

## Monitoring Setup

### Recommended Tools

- **Logging**: Railway/Fly built-in logs
- **Errors**: Sentry (optional)
- **Uptime**: UptimeRobot / Better Stack
- **Analytics**: Vercel Analytics + PostHog

### Key Metrics to Watch

- Voice session creation rate
- Tool call success rate (>99%)
- Webhook processing success
- API latency P95
- Error rate by endpoint

---

## Rollback Plan

### Backend

```bash
# Railway
railway rollback

# Or redeploy previous commit
git checkout <commit>
railway up
```

### Frontend

```bash
# Vercel - redeploy from dashboard
# Or via CLI
vercel rollback
```

### Database

```sql
-- If migration needs reverting
-- Be careful - this drops data!
DROP TABLE IF EXISTS voice_conversations;
DROP TABLE IF EXISTS voice_sessions;
-- etc.
```

---

## DNS Configuration

### Required Records

| Type | Name | Value |
|------|------|-------|
| A/CNAME | @ | Vercel |
| A/CNAME | www | Vercel |
| A/CNAME | api | Railway/Fly |

### SSL

- Vercel: Automatic
- Railway: Automatic
- Fly: Automatic

---

## Launch Checklist

### T-24h

- [ ] All environment variables set
- [ ] Database migration complete
- [ ] ElevenLabs agent tested
- [ ] SSL certificates active
- [ ] Error monitoring active

### T-1h

- [ ] Final smoke test all flows
- [ ] Check error logs clean
- [ ] Verify rate limits active
- [ ] Team notified

### T-0 (Launch)

- [ ] Update DNS if needed
- [ ] Monitor error rates
- [ ] Watch first user sessions
- [ ] Celebrate 🎉

### T+24h

- [ ] Review analytics
- [ ] Check cost dashboards
- [ ] Address any reported issues
- [ ] Plan iteration based on feedback
