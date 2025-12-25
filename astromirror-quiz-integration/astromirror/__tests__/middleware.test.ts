/**
 * Middleware Tests
 * Tests für Authentication & Authorization Middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse.redirect
jest.spyOn(NextResponse, 'redirect')
jest.spyOn(NextResponse, 'next')

describe('Middleware - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Route Protection', () => {
    it('should allow public routes without auth', async () => {
      const publicRoutes = ['/', '/login', '/signup', '/pricing', '/faq']

      for (const route of publicRoutes) {
        const request = new NextRequest(`http://localhost:3000${route}`)
        const response = await middleware(request)

        expect(NextResponse.redirect).not.toHaveBeenCalled()
      }
    })

    it('should protect /dashboard without token', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: new Headers(),
      })

      // Mock: No cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(undefined),
        },
      })

      const response = await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/login'),
          searchParams: expect.objectContaining({
            redirect: '/dashboard',
          }),
        })
      )
    })

    it('should protect /voice without token', async () => {
      const request = new NextRequest('http://localhost:3000/voice')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(undefined),
        },
      })

      await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/login')
      )
    })

    it('should protect /chart without token', async () => {
      const request = new NextRequest('http://localhost:3000/chart')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(undefined),
        },
      })

      await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should protect /settings without token', async () => {
      const request = new NextRequest('http://localhost:3000/settings')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(undefined),
        },
      })

      await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('Token Validation', () => {
    it('should allow access with valid access token', async () => {
      // Create valid JWT (simplified - not cryptographically valid)
      const payload = {
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      }
      const mockToken = `header.${btoa(JSON.stringify(payload))}.signature`

      const request = new NextRequest('http://localhost:3000/dashboard')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn((name: string) =>
            name === 'sb-access-token' ? { value: mockToken } : undefined
          ),
        },
      })

      const response = await middleware(request)

      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should redirect with expired access token and no refresh token', async () => {
      // Expired token
      const payload = {
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      }
      const expiredToken = `header.${btoa(JSON.stringify(payload))}.signature`

      const request = new NextRequest('http://localhost:3000/dashboard')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn((name: string) =>
            name === 'sb-access-token' ? { value: expiredToken } : undefined
          ),
        },
      })

      await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/login')
      )
    })

    it('should allow through with expired token but valid refresh token', async () => {
      const expiredAccessToken = `header.${btoa(JSON.stringify({ exp: 0 }))}.sig`
      const refreshToken = 'valid-refresh-token'

      const request = new NextRequest('http://localhost:3000/dashboard')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn((name: string) => {
            if (name === 'sb-access-token') return { value: expiredAccessToken }
            if (name === 'sb-refresh-token') return { value: refreshToken }
            return undefined
          }),
        },
      })

      const response = await middleware(request)

      // Should allow through - refresh will happen client-side
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('should handle malformed JWT gracefully', async () => {
      const malformedToken = 'not-a-valid-jwt'

      const request = new NextRequest('http://localhost:3000/dashboard')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn(() => ({ value: malformedToken })),
        },
      })

      // Should let it through - API will reject
      const response = await middleware(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('API Routes', () => {
    it('should skip middleware for /api routes', async () => {
      const apiRoutes = ['/api/quiz/start', '/api/voice/session', '/api/auth/login']

      for (const route of apiRoutes) {
        const request = new NextRequest(`http://localhost:3000${route}`)
        await middleware(request)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(NextResponse.redirect).not.toHaveBeenCalled()
      }
    })

    it('should skip middleware for static files', async () => {
      const staticPaths = [
        '/_next/static/chunks/main.js',
        '/_next/image?url=/logo.png',
        '/favicon.ico',
        '/logo.svg',
      ]

      for (const path of staticPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`)
        await middleware(request)

        expect(NextResponse.next).toHaveBeenCalled()
      }
    })
  })

  describe('Redirect Behavior', () => {
    it('should preserve original path in redirect param', async () => {
      const targetPath = '/dashboard/settings'
      const request = new NextRequest(`http://localhost:3000${targetPath}`)

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue(undefined),
        },
      })

      await middleware(request)

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          searchParams: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      )

      const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectCall.toString()).toContain('redirect=' + encodeURIComponent(targetPath))
    })
  })
})

/**
 * Security Considerations:
 *
 * ✅ Implemented:
 * - Route-based protection (public vs. protected)
 * - Token expiry checking
 * - Redirect with return URL
 *
 * ⚠️ Limitations:
 * - JWT signature NOT verified (only expiry check)
 * - Full verification happens in API routes via Supabase
 * - Middleware is a first-line defense, not cryptographic validation
 *
 * 🔴 TODO:
 * - Add rate limiting tests
 * - Test CSRF protection (implicit via SameSite cookies)
 * - Test cookie flags (HttpOnly, Secure, SameSite)
 */
