# AstroChat / AstroMirror

**Dein kosmischer Spiegel** – Premium-Astrologie-Anwendung mit Voice Agent, Quiz und Geburtshoroskop-Berechnung

[![Security Audit](https://img.shields.io/badge/Security-Audit%20Required-red)](./SECURITY_AUDIT_2025-12-25.md)
[![License](https://img.shields.io/badge/License-Proprietary-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## ⚠️ Wichtige Sicherheitshinweise

**🔴 KRITISCH: Voice Agent Feature ist NICHT produktionsbereit!**

Das Backend für den Voice Agent existiert nicht im Repository. Bitte lesen Sie den vollständigen Bericht:
👉 **[SECURITY_AUDIT_2025-12-25.md](./SECURITY_AUDIT_2025-12-25.md)**

**Hauptprobleme:**
- ❌ Fehlende Benutzerisolierung im Voice Agent
- ❌ Keine Session-Token Validierung
- ❌ Backend-Endpoints nicht implementiert
- ❌ Datenschutz-Consent fehlt

**Empfehlung:** Voice Agent deaktivieren bis Backend-Implementierung abgeschlossen ist.

---

## 📁 Projekt-Struktur

Dieses Repository enthält **zwei separate Anwendungen**:

### 1. AstroMirror Quiz (`astromirror-quiz-integration/astromirror/`)
**Kosmischer Archetyp Quiz** – 7 Fragen führen zu einem von 8 astrologischen Profilen

- ✅ **Produktionsbereit**
- Next.js 14 App Router
- Supabase Persistence mit RLS
- Anonyme Sessions (kein Login erforderlich)
- 9-dimensionales Scoring-System

**Dokumentation:**
- [CLAUDE.md](./astromirror-quiz-integration/astromirror/CLAUDE.md) – Entwickler-Guide
- [app/README.md](./astromirror-quiz-integration/astromirror/app/README.md) – Architektur

### 2. AstroMirror Voice Webapp (`astromirror-webapp/apps/web/`)
**Full-Stack Webapp** mit Voice Agent, Geburtshoroskop und Premium-Features

- ⚠️ **In Entwicklung** (Backend fehlt)
- Next.js 14 + FastAPI (Python) – *Backend nicht im Repo*
- ElevenLabs Conversational AI Integration
- Swiss Ephemeris Berechnungen
- Supabase Auth & Entitlements

**Dokumentation:**
- [app/README.md](./astromirror-quiz-integration/astromirror/app/README.md) – System-Architektur
- [ELEVENLABS_AGENT_SETUP.md](./astromirror-quiz-integration/astromirror/app/ELEVENLABS_AGENT_SETUP.md) – Voice Agent Konfiguration

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** oder **yarn**
- **Supabase Account** (kostenlos bei [supabase.com](https://supabase.com))
- *Optional:* Python 3.11+ für Backend (noch nicht implementiert)

### 1. Quiz-App starten (Produktionsbereit)

```bash
# Ins Quiz-Verzeichnis wechseln
cd astromirror-quiz-integration/astromirror

# Dependencies installieren
npm install

# Environment Setup
cp .env.example .env.local
# Trage Supabase Credentials ein:
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Datenbank Migration ausführen
# Option 1: Supabase CLI
supabase db push

# Option 2: SQL Editor in Supabase Dashboard
# Kopiere Inhalt von supabase/migrations/001_initial_schema.sql

# Development Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### 2. Voice Webapp starten (Experimentell)

⚠️ **Nicht funktionsfähig ohne Backend!**

```bash
cd astromirror-webapp/apps/web

npm install
cp .env.example .env.local

# Benötigt zusätzlich:
# API_URL=http://localhost:8000  # ← Backend existiert nicht!
# ELEVENLABS_API_KEY=...

npm run dev
```

---

## 🏗️ Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)               │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │  Quiz UI     │  │  Voice UI    │  │  Chart UI   │  │
│   │  (Working)   │  │  (Blocked)   │  │  (Blocked)  │  │
│   └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND (FastAPI - NICHT IM REPO!)        │
│   ❌ /v1/voice/session                                  │
│   ❌ /v1/elevenlabs/tool/get_context                    │
│   ❌ /v1/elevenlabs/webhook/post-call                   │
│   ❌ /v1/astro/*                                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         DATABASE (Supabase PostgreSQL)                  │
│   ✅ profiles                                           │
│   ✅ quiz_sessions (RLS enabled)                        │
│   ✅ quiz_results (RLS enabled)                         │
│   ❌ birth_data (Schema fehlt)                          │
│   ❌ natal_charts (Schema fehlt)                        │
│   ❌ voice_sessions (Schema fehlt)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Sicherheit & Datenschutz

### Implementiert ✅

- **Row Level Security (RLS)** auf allen Quiz-Tabellen
- **JWT-basierte Authentifizierung** (Supabase Auth)
- **Middleware-Schutz** für `/dashboard`, `/voice`, `/chart`
- **Cascade Delete** bei User-Löschung
- **Cookie Security** (httpOnly, Secure, SameSite)

### Kritisch Fehlend 🔴

- **Voice Agent Backend** (komplette Implementierung fehlt)
- **Session-Token Validierung** für ElevenLabs Tool Calls
- **Datenschutz-Consent Management** (DSGVO Art. 7)
- **Audit Logging** für sensible Operationen
- **Automatische Datenlöschung** (Voice Transkripte)
- **Privacy Policy** und Impressum

**Vollständiger Report:** [SECURITY_AUDIT_2025-12-25.md](./SECURITY_AUDIT_2025-12-25.md)

---

## 🧪 Testing

**Aktueller Stand:** ❌ **0% Code Coverage**

Automatisierte Tests fehlen komplett. Geplante Test-Suiten:

- [ ] Unit Tests für Quiz Engine
- [ ] Integration Tests für Auth Flow
- [ ] Security Tests für RLS Policies
- [ ] E2E Tests für Quiz Journey

Tests werden im aktuellen Branch `claude/voice-agent-tests-privacy-JZ7Gd` implementiert.

---

## 📦 Features

### ✅ Produktionsbereit

#### Kosmischer Archetyp Quiz
- 7 Fragen zu Elementen, Modalitäten, Orientierungen
- 8 Profile + 1 Fallback ("Kosmischer Hybrid")
- Scoring-Algorithmus mit gewichteten Kriterien (Primary 3pts, Secondary 2pts, Tertiary 1pt)
- Responsive UI mit Framer Motion Animationen
- Deutsch-sprachig
- Anonyme Nutzung (kein Login erforderlich)

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS 3.4
- Framer Motion 11
- Supabase (Auth + DB)

### ⚠️ In Entwicklung (Blockiert)

#### Voice Agent (Premium Feature)
- Echtzeit-Gespräch mit ElevenLabs Conversational AI
- Zugriff auf Natal Chart + Transite
- Zwei Voice-Modi: Analytisch / Einfühlsam
- Monatliche Minutenlimits
- **Status:** Backend fehlt komplett

#### Geburtshoroskop
- Swiss Ephemeris Berechnungen
- Placidus Häuser mit Polar-Fallback
- Tropischer Zodiak
- Aspekt-Erkennung
- **Status:** Backend fehlt

---

## 🗂️ Repository-Dateien

```
astroChat/
├── README.md                              # Diese Datei
├── SECURITY_AUDIT_2025-12-25.md          # Sicherheits-Audit
├── CLAUDE.md                              # AI Assistant Guide
│
├── astromirror-quiz-integration/
│   └── astromirror/                       # ✅ Quiz-App (Working)
│       ├── app/
│       │   ├── api/quiz/                  # API Routes
│       │   ├── quiz/                      # Quiz UI
│       │   └── result/                    # Result Pages
│       ├── lib/
│       │   ├── quiz-engine.ts            # Scoring-Algorithmus
│       │   ├── session-store.ts          # Supabase Persistence
│       │   └── supabase.ts               # DB Client
│       ├── supabase/
│       │   └── migrations/
│       │       └── 001_initial_schema.sql
│       ├── middleware.ts                  # Auth Protection
│       └── CLAUDE.md                      # Entwickler-Docs
│
├── astromirror-webapp/
│   └── apps/web/                          # ⚠️ Voice Webapp (Blocked)
│       ├── app/
│       │   ├── (app)/
│       │   │   ├── voice/                 # Voice UI (nicht funktional)
│       │   │   ├── dashboard/
│       │   │   └── chart/
│       │   └── api/voice/                 # Proxy zu fehlendem Backend
│       └── middleware.ts                  # Auth Middleware
│
├── docs/
│   └── plans/
│       ├── 2025-12-24-supabase-persistence-design.md
│       └── 2025-12-24-supabase-persistence-implementation.md
│
└── [Backend fehlt - sollte hier sein:]
    └── apps/api/                          # ❌ NICHT VORHANDEN
        ├── routers/
        │   ├── voice_router.py
        │   └── elevenlabs_router.py
        └── services/
            └── voice_service.py
```

---

## 🛠️ Development

### Verfügbare Commands (Quiz-App)

```bash
cd astromirror-quiz-integration/astromirror

npm run dev          # Development Server (localhost:3000)
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint
npm run type-check   # TypeScript Check (tsc --noEmit)
```

### Path Aliases

```typescript
import { ... } from '@/lib/...'        // app/lib/
import { ... } from '@/types/...'      // app/types/
import { ... } from '@/components/...' // app/components/
```

### Environment Variables

**Quiz-App** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Voice Webapp** (benötigt zusätzlich):
```env
API_URL=http://localhost:8000                    # ← Backend fehlt!
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxx        # ElevenLabs Dashboard
```

**Backend** (`.env` – noch zu erstellen):
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...                    # Für RLS-Bypass
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_WEBHOOK_SECRET=whsec_...
SESSION_TOKEN_PEPPER=random-secret-string        # Für Token Hashing
```

---

## 📋 Roadmap

### Phase 1: Security & Privacy (🔴 Kritisch)
- [ ] Backend-Implementierung (`apps/api/`)
  - [ ] `/v1/voice/session` – Session-Erstellung mit Token-Generierung
  - [ ] `/v1/elevenlabs/tool/get_context` – Tool-Endpoint mit User-Validierung
  - [ ] `/v1/elevenlabs/webhook/post-call` – Webhook mit HMAC-Verifikation
- [ ] Datenschutz
  - [ ] Consent-Management System
  - [ ] Privacy Policy Seite
  - [ ] Auto-Löschung Voice Transkripte (30 Tage)
- [ ] Audit Logging
  - [ ] `audit_logs` Tabelle + RLS
  - [ ] Logging aller Voice Sessions
  - [ ] Alerting bei verdächtigen Aktivitäten

### Phase 2: Testing (⚠️ Hoch)
- [ ] Unit Tests (Jest)
  - [ ] Quiz Engine Scoring
  - [ ] Session Store CRUD
  - [ ] Auth Middleware
- [ ] Integration Tests
  - [ ] Quiz Flow E2E
  - [ ] Voice Session (mit Mock Backend)
  - [ ] RLS Policy Enforcement
- [ ] Security Tests
  - [ ] Penetration Testing
  - [ ] IDOR Testing
  - [ ] Token Manipulation

### Phase 3: Features (🟡 Medium)
- [ ] User Dashboard
  - [ ] Quiz-Historie
  - [ ] Voice-Nutzungsstatistik
  - [ ] Account-Verwaltung
- [ ] Natal Chart UI
  - [ ] Visualisierung (SVG)
  - [ ] Aspekt-Tabelle
  - [ ] Erklärungstexte
- [ ] Premium-Upgrades
  - [ ] Stripe Integration
  - [ ] Plan-Verwaltung

### Phase 4: Production (🟢 Low)
- [ ] Performance
  - [ ] Code Splitting
  - [ ] Image Optimization
  - [ ] CDN Setup
- [ ] Deployment
  - [ ] Vercel (Frontend)
  - [ ] Railway/Fly.io (Backend)
  - [ ] CI/CD Pipeline
- [ ] Monitoring
  - [ ] Sentry Error Tracking
  - [ ] Uptime Monitoring
  - [ ] Analytics (Plausible/Fathom)

---

## 📄 Lizenz

**Proprietary** – Alle Rechte vorbehalten.

Dieses Projekt ist nicht Open Source. Nutzung, Vervielfältigung oder Weitergabe nur mit ausdrücklicher Genehmigung.

---

## 🤝 Beitragen

Dieses Projekt ist derzeit nicht öffentlich. Contributions nur nach Einladung.

**Security Issues:** Bitte melden Sie Sicherheitslücken privat an:
security@astromirror.io *(E-Mail noch anzulegen)*

---

## 📞 Kontakt

**Entwickler:** [TBD]
**Data Protection Officer:** [TBD]
**Support:** support@astromirror.io *(noch anzulegen)*

---

## 📚 Weitere Dokumentation

- [CLAUDE.md](./CLAUDE.md) – Anweisungen für Claude Code AI
- [SECURITY_AUDIT_2025-12-25.md](./SECURITY_AUDIT_2025-12-25.md) – Vollständiger Sicherheits-Audit
- [astromirror-quiz-integration/astromirror/CLAUDE.md](./astromirror-quiz-integration/astromirror/CLAUDE.md) – Quiz-App Details
- [astromirror-quiz-integration/astromirror/app/README.md](./astromirror-quiz-integration/astromirror/app/README.md) – Architektur-Diagramm
- [astromirror-quiz-integration/astromirror/app/ELEVENLABS_AGENT_SETUP.md](./astromirror-quiz-integration/astromirror/app/ELEVENLABS_AGENT_SETUP.md) – Voice Agent Konfiguration
- [docs/plans/](./docs/plans/) – Design-Dokumente

---

**Stand:** 2025-12-25 | Branch: `claude/voice-agent-tests-privacy-JZ7Gd`
