/**
 * Voice Session API Tests
 * Tests für /api/voice/session Route
 *
 * WICHTIG: Diese Tests decken die FRONTEND-Validierung ab.
 * Das Backend (FastAPI) existiert nicht und muss noch implementiert werden!
 */

import { POST } from '@/app/api/voice/session/route'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('/api/voice/session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should reject requests without auth token', async () => {
      // Mock: Keine Cookies
      ;(cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('unauthorized')
      expect(data.message).toContain('melde dich an')
    })

    it('should accept token from cookie', async () => {
      const mockToken = 'valid-supabase-token'

      // Mock: Token in Cookie
      ;(cookies as jest.Mock).mockResolvedValue({
        get: jest.fn((name: string) =>
          name === 'sb-access-token' ? { value: mockToken } : undefined
        ),
      })

      // Mock: Backend-Response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          signed_url: 'https://elevenlabs.io/...',
          session_id: 'session_123',
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({ voice_mode: 'analytical' }),
      })

      await POST(request)

      // Verify fetch was called with correct headers
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/voice/session'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('should accept token from Authorization header', async () => {
      const mockToken = 'header-token'

      // Mock: Kein Cookie
      ;(cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      })

      // Mock: Backend OK
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ signed_url: 'test' }),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })
  })

  describe('Backend Communication', () => {
    beforeEach(() => {
      // Default: Valid token
      ;(cookies as jest.Mock).mockResolvedValue({
        get: jest.fn(() => ({ value: 'valid-token' })),
      })
    })

    it('should forward request to backend API', async () => {
      const voiceMode = 'warm'

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ signed_url: 'test' }),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({ voice_mode: voiceMode }),
      })

      await POST(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/voice/session'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ voice_mode: voiceMode }),
        })
      )
    })

    it('should handle backend 402 (Premium required)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => ({
          error: 'payment_required',
          message: 'Premium subscription required',
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(402)
      expect(data.error).toBe('payment_required')
    })

    it('should handle backend 429 (Rate limit)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: 'rate_limit',
          message: 'Monthly minutes exceeded',
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(429)
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('internal')
    })
  })

  describe('Response Validation', () => {
    beforeEach(() => {
      ;(cookies as jest.Mock).mockResolvedValue({
        get: jest.fn(() => ({ value: 'valid-token' })),
      })
    })

    it('should return signed_url on success', async () => {
      const mockResponse = {
        signed_url: 'https://elevenlabs.io/session/xyz',
        signed_url_expires_at: '2025-12-25T12:00:00Z',
        dynamic_variables: {
          user_name: 'TestUser',
          voice_mode: 'analytical',
        },
        limits: {
          minutes_monthly_total: 15,
          minutes_monthly_used: 5,
          minutes_remaining: 10,
        },
        session_id: 'session_abc123',
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/voice/session', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.signed_url).toBe(mockResponse.signed_url)
      expect(data.limits).toEqual(mockResponse.limits)
    })
  })
})

/**
 * KRITISCHE SICHERHEITSLÜCKE:
 *
 * Diese Tests validieren NUR die Frontend-Proxy-Route.
 * Das eigentliche Backend (/v1/voice/session) FEHLT KOMPLETT!
 *
 * Fehlende Backend-Tests (noch zu implementieren):
 * - Session-Token Generierung (SHA256 + Pepper)
 * - User-ID zu Session-Token Mapping
 * - Premium-Berechtigung Validierung
 * - Minutenlimit-Prüfung
 * - ElevenLabs Signed URL Generierung
 * - Session in Datenbank speichern
 *
 * TODO: Backend implementieren und Backend-Tests hinzufügen
 */
