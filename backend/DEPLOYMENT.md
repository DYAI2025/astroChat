# Deployment Guide

## Production Deployment

### 1. Database Setup

Run the migration in Supabase SQL Editor:

```sql
-- Execute migrations/002_voice_chat_schema.sql
```

Set up automated cleanup (daily at 2 AM UTC):

```sql
SELECT cron.schedule(
  'cleanup-voice-data',
  '0 2 * * *',
  'SELECT cleanup_voice_data()'
);
```

### 2. Environment Variables

Set these in your production environment:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-jwt-secret

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxx
ELEVENLABS_AGENT_ID_ANALYTICAL=agent_xxx
ELEVENLABS_AGENT_ID_WARM=agent_xxx
ELEVENLABS_WEBHOOK_SECRET=whsec_xxx

# Application
API_URL=https://api.astromirror.de
FRONTEND_URL=https://app.astromirror.de
ENVIRONMENT=production

# Security
TOOL_CALLBACK_SECRET=<generate-random-32-chars>
```

### 3. Deploy to Railway/Render

#### Option A: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### Option B: Render

1. Connect GitHub repository
2. Select "Web Service"
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### 4. Configure ElevenLabs

In ElevenLabs dashboard:

1. Create two agents:
   - **Analytical Agent**: Professional, precise
   - **Warm Agent**: Empathetic, reflective

2. Configure tool callback:
   - Name: `get_context`
   - URL: `https://api.astromirror.de/v1/elevenlabs/tool/get_context`
   - Method: POST
   - Secret: (from ELEVENLABS_WEBHOOK_SECRET)

3. Configure webhook:
   - URL: `https://api.astromirror.de/v1/elevenlabs/webhook/post-call`
   - Secret: (same as above)

### 5. Update Frontend

Update `astromirror-webapp/apps/web/.env.local`:

```bash
API_URL=https://api.astromirror.de
```

### 6. Health Checks

Set up monitoring:

```bash
# Health endpoint
curl https://api.astromirror.de/health

# Expected response:
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0"
}
```

### 7. Monitoring & Alerts

#### Sentry Integration

Add to requirements.txt:
```
sentry-sdk[fastapi]==1.40.0
```

Add to `app/main.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment=settings.environment,
    traces_sample_rate=0.1
)
```

#### Logging

Configure structured logging:

```python
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

## Security Checklist

Before going live:

- [ ] All environment variables set
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS restricted to production frontend
- [ ] Rate limiting configured
- [ ] Database RLS policies active
- [ ] Audit logging working
- [ ] Error tracking (Sentry) configured
- [ ] API docs disabled in production (`docs_url=None`)
- [ ] Secrets rotated from defaults
- [ ] ElevenLabs webhook signature validation active

## Performance

### Recommended Resources

- **CPU**: 1-2 vCPUs
- **RAM**: 512MB - 1GB
- **Scaling**: Auto-scale on CPU > 70%

### Caching

Consider adding Redis for:
- Session state caching
- Rate limit counters
- Natal chart caching

### Database Optimization

Monitor these queries:
- `voice_sessions` by user_id
- `natal_charts` by user_id
- `voice_audit_logs` by created_at

Ensure indexes are created (already in migration).

## Rollback Plan

If issues occur:

1. Check logs: `railway logs` or Render dashboard
2. Rollback deployment: `railway rollback` or Render dashboard
3. Check database: Supabase dashboard → SQL Editor
4. Disable voice features: Set `ENVIRONMENT=maintenance`

## Maintenance

### Weekly
- Review audit logs for anomalies
- Check error rates in Sentry

### Monthly
- Review usage patterns
- Check database size growth
- Update dependencies: `pip list --outdated`

### Quarterly
- Security audit
- Performance review
- Dependency updates
