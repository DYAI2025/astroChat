# AstroChat - Astrologische KI-Plattform mit Voice-Integration

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

Eine vollständige astrologische KI-Plattform mit DSGVO-konformer Voice-Chat-Integration, kosmischem Archetypen-Quiz und Swiss Ephemeris-basierten Berechnungen.

---

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Features](#-features)
- [Architektur](#-architektur)
- [Schnellstart](#-schnellstart)
- [Anwendungen](#-anwendungen)
  - [Quiz-Integration App](#1-quiz-integration-app)
  - [Main WebApp](#2-main-webapp)
  - [Astro.ai (Experimental)](#3-astroai-experimental)
  - [FastAPI Backend](#4-fastapi-backend)
- [Entwicklung](#-entwicklung)
- [Deployment](#-deployment)
- [Dokumentation](#-dokumentation)
- [Lizenz](#-lizenz)

---

## 🌟 Überblick

**AstroChat** ist eine moderne Full-Stack-Plattform für personalisierte astrologische Beratung, die KI-gestützte Voice-Agenten mit präzisen astrologischen Berechnungen kombiniert. Die Plattform besteht aus vier Hauptkomponenten:

1. **Quiz-Integration App** - Standalone kosmisches Archetypen-Quiz (Next.js)
2. **Main WebApp** - Premium-Plattform mit Voice-Agent-Integration (Next.js)
3. **Astro.ai** - Experimentelle 3D-Visualisierung (React 19 + Three.js)
4. **FastAPI Backend** - Astrologische Berechnungen und Voice-Agent-Orchestrierung (Python)

---

## ✨ Features

### Astrologische Features
- 🌠 **Swiss Ephemeris Integration** - Präzise astrologische Berechnungen (NASA-Datenqualität)
- 🎭 **Kosmische Archetypen** - 12 Profile basierend auf 9-dimensionalem Scoring
- 🔮 **Natal Chart Generation** - Vollständige Radix-Berechnungen mit Planeten, Häusern und Aspekten
- 🌌 **Transit Tracking** - Aktuelle planetarische Transite mit Deutungen

### KI & Voice Features
- 🎤 **ElevenLabs Voice Agents** - Natürliche Sprachgespräche mit astrologischem Kontext
- 🤖 **Contextual AI** - Agenten erhalten Echtzeit-Radix- und Transitdaten
- 📊 **Usage Tracking** - Minutengenaue Nutzungserfassung mit Quotenverwaltung
- 🔊 **Multi-Agent System** - Spezialisierte Agenten (Astraea, Li Wei, u.a.)

### Compliance & Sicherheit
- 🔒 **DSGVO-konform** - Vollständige Einwilligungsverwaltung mit Versionierung
- 📝 **Audit Logging** - 2-Jahres-Retention aller Voice-Sessions
- 🔐 **Supabase Auth** - JWT-basierte Authentifizierung mit Row-Level-Security
- 🛡️ **HMAC Validation** - Signatur-Verifizierung für Webhook-Callbacks

### Design & UX
- 🎨 **Cosmic Design System** - Gold/Emerald/Obsidian Farbschema
- ✨ **Framer Motion** - Flüssige Animationen und Übergänge
- 📱 **Responsive Design** - Optimiert für Desktop, Tablet und Mobile
- 🌙 **Immersive UI** - Serif-Typographie (Cinzel) und mystische Ästhetik

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Quiz App    │  │  Main WebApp │  │  Astro.ai    │     │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Vite)      │     │
│  │  Port 3001   │  │  Port 3000   │  │  Port 5173   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘     │
│         │                 │                                 │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          │                 │ API Proxy (/api/*)
          │                 ↓
┌─────────┼──────────────────────────────────────────────────┐
│         │         Backend Layer (FastAPI)                  │
│         │         Port 8000                                │
│         │                                                  │
│         │  ┌──────────────────────────────────────────┐   │
│         │  │  Routers                                 │   │
│         │  │  - /v1/voice/session                     │   │
│         │  │  - /v1/elevenlabs/tool/get_context       │   │
│         │  │  - /v1/elevenlabs/webhook/post-call      │   │
│         │  │  - /v1/astro/natal, /v1/astro/transits   │   │
│         │  └────────────┬─────────────────────────────┘   │
│         │               │                                  │
│         │  ┌────────────▼─────────────────────────────┐   │
│         │  │  Services                                │   │
│         │  │  - astro.py (Swiss Ephemeris)            │   │
│         │  │  - elevenlabs.py (Agent Integration)     │   │
│         │  │  - consent.py (DSGVO Compliance)         │   │
│         │  │  - audit.py (Logging)                    │   │
│         │  └────────────┬─────────────────────────────┘   │
│         │               │                                  │
└─────────┼───────────────┼──────────────────────────────────┘
          │               │
          │               │ SQL (asyncpg)
          ↓               ↓
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (Supabase PostgreSQL)           │
│                                                             │
│  Tables:                                                    │
│  - profiles           - User profiles                       │
│  - birth_data         - Birth time/location                │
│  - natal_charts       - Cached calculations                │
│  - quiz_sessions      - Quiz state                         │
│  - quiz_results       - Archetype profiles                 │
│  - voice_consents     - DSGVO consent tracking             │
│  - voice_sessions     - Session metadata                   │
│  - voice_audit_logs   - Full audit trail                   │
│  - entitlements       - Plan & quota management            │
└─────────────────────────────────────────────────────────────┘
          │
          │ API Calls
          ↓
┌─────────────────────────────────────────────────────────────┐
│         External Services                                   │
│  - ElevenLabs Conversational AI                            │
│  - Swiss Ephemeris (swisseph library)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js** 18+ (empfohlen: 20.x LTS)
- **Python** 3.12+
- **PostgreSQL** (via Supabase oder lokal)
- **npm** oder **yarn**
- **Git**

### 1. Repository klonen

```bash
git clone https://github.com/DYAI2025/astroChat.git
cd astroChat
```

### 2. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir:
   - Project URL (`https://xxx.supabase.co`)
   - Anon/Public Key

### 3. Datenbank-Schema migrieren

#### Quiz-App Schema
```bash
# Öffne Supabase SQL Editor
# Führe aus: astromirror-quiz-integration/astromirror/supabase/migrations/001_initial_schema.sql
```

#### Main-App Schema
```bash
# Öffne Supabase SQL Editor
# Führe aus: astromirror-webapp/apps/web/supabase-migration.sql
```

#### Backend Schema
```bash
# Öffne Supabase SQL Editor
# Führe aus: backend/migrations/002_voice_chat_schema.sql
```

### 4. Environment-Variablen konfigurieren

#### Quiz-App
```bash
cd astromirror-quiz-integration/astromirror
cp .env.local.example .env.local

# Bearbeite .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Main-App
```bash
cd astromirror-webapp/apps/web
cp .env.example .env.local

# Bearbeite .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:8000
```

#### Backend
```bash
cd backend
cp .env.example .env

# Bearbeite .env:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_WEBHOOK_SECRET=your-webhook-secret
```

### 5. Dependencies installieren

```bash
# Quiz-App
cd astromirror-quiz-integration/astromirror
npm install

# Main-App
cd astromirror-webapp/apps/web
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 6. Entwicklungsserver starten

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Main-App
cd astromirror-webapp/apps/web
npm run dev

# Terminal 3: Quiz-App (optional)
cd astromirror-quiz-integration/astromirror
PORT=3001 npm run dev
```

**URLs:**
- Main-App: http://localhost:3000
- Quiz-App: http://localhost:3001
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📦 Anwendungen

### 1. Quiz-Integration App

**Pfad:** `astromirror-quiz-integration/astromirror/`

Standalone kosmisches Archetypen-Quiz mit anonymer Nutzung.

#### Features
- 🎯 9-dimensionales Scoring (Elemente, Modalitäten, Orientierungen)
- 🎭 12 kosmische Archetypen-Profile
- ⏱️ Session-basierter State (24h TTL)
- 🎨 Framer Motion Animationen
- 📱 Mobile-First Design

#### Technologie-Stack
```json
{
  "framework": "Next.js 14.2",
  "ui": "Tailwind CSS 3.4",
  "animations": "Framer Motion 11.12",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Anonymous Auth"
}
```

#### Verzeichnisstruktur
```
astromirror/
├── app/
│   ├── api/quiz/
│   │   ├── start/route.ts          # Session erstellen
│   │   ├── answer/route.ts         # Antwort verarbeiten
│   │   └── result/[id]/route.ts    # Profil abrufen
│   ├── quiz/cosmic-archetype/
│   └── profile/result/[id]/
├── components/
│   ├── CosmicArchetypeQuiz.tsx     # Haupt-Quiz-Komponente
│   ├── ProfileResult.tsx           # Ergebnis-Anzeige
│   └── ResultCard.tsx              # Profil-Karte
├── lib/
│   ├── quiz-engine.ts              # Scoring-Logik
│   ├── quiz-data.ts                # JSON-Loader
│   └── session-store.ts            # In-Memory Sessions
└── public/data/
    └── cosmic-archetype-quiz.json  # Quiz-Inhalt
```

#### Entwicklung
```bash
npm run dev          # Dev Server (Port 3001)
npm run build        # Production Build
npm run lint         # ESLint
npm run type-check   # TypeScript Check
```

#### Deployment
```bash
vercel --prod
```

---

### 2. Main WebApp

**Pfad:** `astromirror-webapp/apps/web/`

Premium-Plattform mit vollständiger astrologischer Beratung und Voice-Integration.

#### Features
- 🎤 ElevenLabs Voice Chat mit astrologischem Kontext
- 📊 Natal Chart Visualisierung
- 🌌 Transit Tracking
- 👤 User Profile Management
- 💳 Entitlement System (Free/Premium)
- 🔐 JWT-basierte Authentifizierung
- 🎭 Multi-Agent System (Astraea, Li Wei)

#### Route-Struktur (Next.js App Router)

```
app/
├── (app)/                    # Authentifizierte Routes
│   ├── dashboard/            # Übersicht
│   ├── chart/                # Natal Chart
│   ├── voice/                # Voice Chat
│   ├── agents/               # Agent-Übersicht
│   │   ├── astraea/          # Westliche Astrologie
│   │   └── li-wei/           # Chinesische Astrologie
│   ├── profile/              # User Profile
│   └── settings/             # Einstellungen
├── (auth)/                   # Auth Routes
│   ├── login/
│   └── signup/
├── (marketing)/              # Öffentliche Routes
│   ├── page.tsx              # Landing Page
│   └── pricing/              # Pricing Page
├── api/                      # API Proxy Routes
│   ├── auth/                 # Auth Endpoints
│   ├── astro/                # Astro Calculations
│   ├── voice/                # Voice Sessions
│   └── user/                 # User Data
└── quiz/                     # Quiz Integration
    └── cosmic-archetype/
```

#### Middleware (Auth Protection)
```typescript
// middleware.ts schützt:
['/dashboard', '/chart', '/voice', '/agents', '/profile', '/settings']
```

#### Entwicklung
```bash
npm run dev          # Dev Server (Port 3000)
npm run build        # Production Build
npm run lint         # ESLint
npm run type-check   # TypeScript Check
```

#### Environment Variables (Vollständig)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API
API_URL=http://localhost:8000
```

---

### 3. Astro.ai (Experimental)

**Pfad:** `astro.ai/`

Experimentelle 3D-Visualisierung mit React 19 und Three.js.

#### Features
- 🌐 3D-Visualisierungen mit Three.js
- 🤖 Google GenAI Integration
- ⚛️ React 19 (neueste Features)

#### Technologie-Stack
```json
{
  "framework": "Vite 6.2",
  "ui": "React 19.2",
  "3d": "Three.js 0.182 + @react-three/fiber 9.4",
  "ai": "Google GenAI 1.34"
}
```

#### Entwicklung
```bash
npm install
npm run dev    # Port 5173
```

---

### 4. FastAPI Backend

**Pfad:** `backend/`

Python-Backend für astrologische Berechnungen und Voice-Agent-Orchestrierung.

#### Features
- 🌠 Swiss Ephemeris Integration (NASA-Qualität)
- 🎤 ElevenLabs Agent Management
- 📝 DSGVO-konforme Consent-Verwaltung
- 📊 Audit Logging (2 Jahre)
- 🔒 HMAC Webhook Validation
- ⚡ Async/Await (asyncpg, HTTPX)
- 🐳 Docker Support

#### API-Endpunkte

```
POST   /v1/voice/session              # Voice Session erstellen
GET    /v1/voice/usage                # Nutzungsstatistik
POST   /v1/elevenlabs/tool/get_context # Agent Context Callback
POST   /v1/elevenlabs/webhook/post-call # Post-Call Webhook
POST   /v1/astro/natal                # Natal Chart berechnen
GET    /v1/astro/transits             # Aktuelle Transite
```

#### Verzeichnisstruktur
```
backend/
├── app/
│   ├── main.py                 # FastAPI App
│   ├── config.py               # Pydantic Settings
│   ├── dependencies.py         # DI Container
│   ├── models/                 # SQLAlchemy ORM
│   │   ├── astro.py
│   │   ├── user.py
│   │   └── voice.py
│   ├── schemas/                # Pydantic Schemas
│   │   ├── astro.py
│   │   └── voice.py
│   ├── services/               # Business Logic
│   │   ├── astro.py            # Swiss Ephemeris
│   │   ├── elevenlabs.py       # Agent Integration
│   │   ├── consent.py          # DSGVO
│   │   └── audit.py            # Logging
│   └── routers/                # API Routes
│       ├── voice.py
│       └── elevenlabs.py
├── tests/                      # Pytest Tests
│   ├── test_astro.py
│   ├── test_consent.py
│   ├── test_elevenlabs.py
│   └── test_api_voice.py
├── migrations/                 # SQL Migrations
├── requirements.txt            # Python Dependencies
├── Dockerfile                  # Docker Image
└── pytest.ini                  # Test Config
```

#### Entwicklung
```bash
# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Tests ausführen
./run_tests.sh

# Server starten
uvicorn app.main:app --reload
```

#### Docker
```bash
docker build -t astrochat-backend .
docker run -p 8000:8000 --env-file .env astrochat-backend
```

#### Deployment (Production)
Siehe [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md)

---

## 🛠️ Entwicklung

### Code-Qualität

#### TypeScript Type-Checking
```bash
# Beide Apps
npm run type-check
```

#### ESLint
```bash
# Beide Apps
npm run lint
```

#### Prettier (optional)
```bash
npm run format
```

### Testing

#### Frontend (TODO: Setup erforderlich)
```bash
# Unit Tests (Jest + React Testing Library)
npm test

# E2E Tests (Playwright)
npm run test:e2e
```

#### Backend
```bash
cd backend
./run_tests.sh

# Mit Coverage
pytest --cov=app --cov-report=html
```

### Git-Workflow

#### Branch-Strategie
```
main          # Production
develop       # Development
feature/*     # Feature-Branches
bugfix/*      # Bugfix-Branches
```

#### Commit-Convention
```
feat: Add voice agent integration
fix: Resolve ESLint errors in agents page
docs: Update README with deployment guide
refactor: Extract quiz scoring to separate service
test: Add integration tests for voice API
```

### Design System (Tailwind)

#### Farben
```css
/* Backgrounds */
obsidian:    #070708  /* Haupt-Hintergrund */
graphite:    #0F1012  /* Sekundärer Hintergrund */

/* Akzente */
gold:        #D4AF37  /* Primär-Akzent */
gold-muted:  #B8975E  /* Sekundär-Akzent */
emerald-deep: #0F3D2E /* Emerald-Ton */

/* Text */
ivory:       #F6F0E1  /* Haupt-Text */
mist:        #CFC7B8  /* Sekundär-Text */
```

#### Typographie
```css
font-display:   Cinzel (Serifen, für Überschriften)
font-body:      Inter (Sans-Serif, für Text)
```

#### Utility Classes
```html
<button class="btn-primary">CTA Button</button>
<button class="btn-ghost">Outlined Button</button>
<div class="card">Standard Card Container</div>
<h1 class="text-gradient-gold">Gradient Text</h1>
```

---

## 🚢 Deployment

### Frontend (Vercel - empfohlen)

#### Quiz-App
```bash
cd astromirror-quiz-integration/astromirror
vercel --prod

# Environment Variables in Vercel Dashboard:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Main-App
```bash
cd astromirror-webapp/apps/web
vercel --prod

# Environment Variables in Vercel Dashboard:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
API_URL (Backend URL)
```

### Backend (Render/Railway/Fly.io)

Siehe [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md) für detaillierte Anleitung.

**Kurzversion (Docker):**
```bash
cd backend
docker build -t astrochat-backend .
docker push your-registry/astrochat-backend:latest
```

### Datenbank (Supabase Production)

1. Upgrade zu Supabase Pro/Team Plan
2. Migriere alle SQL-Schemas
3. Aktiviere Row-Level-Security
4. Konfiguriere Backup-Strategie
5. Setze Connection Pooling (PgBouncer)

---

## 📚 Dokumentation

### Projekt-Dokumentation
- [`CLAUDE.md`](CLAUDE.md) - Claude Code Guidance (Entwickler-Handbuch)
- [`FEHLERANALYSE.md`](FEHLERANALYSE.md) - Fehlerbericht und Reparaturen
- [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) - Backend Implementation Status
- [`VOICE_CHAT_BACKEND_PLAN.md`](VOICE_CHAT_BACKEND_PLAN.md) - Voice Feature Architektur (1238 Zeilen)

### Backend-Dokumentation
- [`backend/README.md`](backend/README.md) - Backend Quick Start
- [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md) - Production Deployment Guide
- API Docs: http://localhost:8000/docs (Swagger UI)
- ReDoc: http://localhost:8000/redoc

### Quiz-App Dokumentation
- [`astromirror-quiz-integration/astromirror/CLAUDE.md`](astromirror-quiz-integration/astromirror/CLAUDE.md)

---

## 🔒 Sicherheit & Compliance

### DSGVO-Compliance
- ✅ Explizite Einwilligungsverwaltung (Voice-Features)
- ✅ Versionierung von Consent-Dokumenten
- ✅ Audit-Logs (2 Jahre Retention)
- ✅ Löschanspruch implementierbar
- ✅ Datenminimierung

### Sicherheitsmaßnahmen
- ✅ JWT-basierte Authentifizierung
- ✅ Row-Level-Security (Supabase)
- ✅ HMAC Webhook Validation
- ✅ Rate Limiting (SlowAPI)
- ✅ Input Validation (Pydantic)
- ✅ SQL Injection Prevention (SQLAlchemy ORM)
- ✅ XSS Prevention (React Default Escaping)

### Dependencies
```bash
# Regelmäßige Security Audits
npm audit
pip-audit  # Backend

# Auto-Updates (Dependabot empfohlen)
```

---

## 🤝 Contributing

Dieses Repository ist privat. Für interne Beiträge:

1. Fork den `develop` Branch
2. Erstelle Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe Änderungen (`git commit -m 'feat: Add AmazingFeature'`)
4. Push zu Branch (`git push origin feature/AmazingFeature`)
5. Erstelle Pull Request

---

## 📊 Projekt-Statistik

```
Gesamt-Codezeilen:   ~15,000+ (TypeScript + Python)
TypeScript-Dateien:  72 (38 Main-App + 23 Quiz-App + 11 Astro.ai)
Python-Dateien:      10+ (Backend)
Test-Coverage:       Backend: 22 Tests
Dependencies:        780+ npm packages, 28 pip packages
Disk Usage:          ~238 MB
```

---

## 🆘 Support

### Häufige Probleme

#### "Module not found" Fehler
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Fehler nach Update
```bash
# TypeScript Cache löschen
rm -rf .next
rm tsconfig.tsbuildinfo
npm run type-check
```

#### Backend startet nicht
```bash
# Virtual Environment neu erstellen
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Logs

#### Frontend
```bash
# Next.js Build Logs
.next/

# Vercel Deployment Logs
vercel logs
```

#### Backend
```bash
# Uvicorn Logs
uvicorn app.main:app --log-level debug

# Docker Logs
docker logs <container-id>
```

---

## 📝 Lizenz

**Private Repository** - Alle Rechte vorbehalten.

Dieses Projekt ist proprietär und darf nicht ohne ausdrückliche Genehmigung verwendet, kopiert oder verteilt werden.

---

## 🙏 Credits

### Technologien
- [Next.js](https://nextjs.org) - React Framework
- [FastAPI](https://fastapi.tiangolo.com) - Python Web Framework
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [ElevenLabs](https://elevenlabs.io) - Voice AI
- [Swiss Ephemeris](https://www.astro.com/swisseph/) - Astrologische Berechnungen
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [Three.js](https://threejs.org) - 3D Library

### Fonts
- [Cinzel](https://fonts.google.com/specimen/Cinzel) - Display Font
- [Inter](https://fonts.google.com/specimen/Inter) - Body Font

---

**Built with 🌟 by DYAI2025**

*Last Updated: 26. Dezember 2025*
