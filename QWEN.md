# AstroChat Project - Comprehensive Overview

## Project Overview

AstroChat is a comprehensive astrology platform that combines a cosmic archetype quiz with voice chat capabilities using ElevenLabs AI. The project consists of multiple interconnected components:

1. **Frontend Web Application** (`astromirror-webapp/apps/web`) - A Next.js 14 application with authentication, quiz functionality, and voice chat integration
2. **Quiz Application** (`astromirror-quiz-integration/astromirror`) - A standalone cosmic archetype quiz
3. **Backend API** (`backend`) - A FastAPI backend with DSGVO-compliant voice chat integration
4. **Astrology Quiz Component** (`CosmicArchetypeQuiz.tsx`) - The core quiz interface with Framer Motion animations

## Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### Backend Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL (via Supabase)
- **Astro Calculations**: Swiss Ephemeris
- **AI Integration**: ElevenLabs Conversational AI
- **Containerization**: Docker

### Key Components

#### Quiz Engine (`quiz-engine.ts`)
- 9-dimensional scoring system across elements, modalities, and orientations
- Profile matching using weighted criteria hierarchy
- Session-based scoring with fallback to "Kosmischer Hybrid" profile

#### Voice Chat Backend
- DSGVO-compliant consent management
- Audit logging for all data access
- ElevenLabs API integration with signature validation
- Swiss Ephemeris for real-time astrological calculations

## Project Structure

```
AstroChat/
├── Astro-Agents-Charakter/      # Astrology agent character files
├── astro.ai/                    # Astro AI files
├── astromirror-quiz-integration/ # Standalone quiz application
├── astromirror-webapp/          # Main web application
│   └── apps/web/               # Next.js frontend
├── backend/                     # FastAPI backend
├── docs/                        # Documentation
├── CosmicArchetypeQuiz.tsx      # Main quiz component
├── quiz-engine.ts              # Quiz scoring logic
├── route.ts                    # API route for quiz start
├── IMPLEMENTATION_SUMMARY.md   # Backend implementation summary
├── VOICE_CHAT_BACKEND_PLAN.md  # Backend planning document
└── ...
```

## Building and Running

### Main Web Application
```bash
cd astromirror-webapp/apps/web
npm install
npm run dev          # Start dev server (localhost:3000)
```

### Quiz Application
```bash
cd astromirror-quiz-integration/astromirror
npm install
npm run dev          # Start dev server (localhost:3000)
```

### Backend API
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload    # Start FastAPI server (localhost:8000)
```

### Environment Setup
Create `.env.local` files in both frontend apps with Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:8000  # For main app to connect to backend
```

### Database Setup
Execute the migration files in your Supabase SQL Editor:
- `astromirror-webapp/apps/web/supabase-migration.sql`
- `backend/migrations/002_voice_chat_schema.sql`

## Development Conventions

### Code Style
- TypeScript/JavaScript: Follow Next.js conventions
- Python: Follow PEP 8 standards
- CSS: Use Tailwind classes with custom design tokens
- File naming: Use camelCase for components, kebab-case for routes

### Type Safety
- Use TypeScript with strict mode
- Define interfaces for all data structures
- Leverage Supabase-generated types for database operations

### DSGVO Compliance
- All personal data access requires explicit consent
- Audit logs for all data access operations
- Automatic data cleanup after retention periods
- Data minimization - only send essential data to AI agents

### API Design
- RESTful endpoints with clear naming conventions
- Consistent error response format
- Proper authentication and authorization
- Rate limiting for all endpoints

## Key Features

### Quiz Functionality
- 7-question cosmic archetype quiz
- Animated UI with Framer Motion
- 9-dimensional scoring system
- Profile matching with fallback logic

### Voice Chat
- ElevenLabs Conversational AI integration
- Real-time astrological data access during conversations
- DSGVO-compliant data handling
- Session-based usage tracking

### Astrological Calculations
- Swiss Ephemeris integration for accurate calculations
- Natal chart generation
- Transit calculations with aspects
- Zodiac sign and house position calculations

## Testing

### Frontend Testing
- Unit tests with Jest
- E2E tests with Playwright
- Type checking with TypeScript

### Backend Testing
- Unit tests with pytest
- Integration tests for API endpoints
- Test coverage reports

## Deployment

### Frontend
- Deploy to Vercel with Next.js configuration
- Environment variables for production URLs
- CDN for static assets

### Backend
- Deploy to Railway or Render as Docker container
- Environment-specific configurations
- Monitoring and logging setup

## Security Considerations

- JWT token validation for all protected endpoints
- Signature validation for ElevenLabs webhooks
- Rate limiting to prevent abuse
- CORS restrictions to frontend domains only
- SQL injection prevention via ORM usage
- DSGVO-compliant data handling and retention policies

## Project Status

The backend voice chat functionality is marked as completed according to the implementation summary, with DSGVO compliance, ElevenLabs integration, and comprehensive testing. The frontend provides both a standalone quiz experience and a full-featured astrology platform with voice capabilities.

## Key Files

- `CosmicArchetypeQuiz.tsx` - Main quiz component with animations
- `quiz-engine.ts` - Scoring and profile matching logic
- `backend/README.md` - Backend API documentation
- `VOICE_CHAT_BACKEND_PLAN.md` - Detailed backend implementation plan
- `IMPLEMENTATION_SUMMARY.md` - Backend implementation status
- `CLAUDE.md` - Development guidelines and architecture overview