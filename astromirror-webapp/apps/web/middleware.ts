/**
 * AstroMirror - Middleware
 * Protects /app routes and handles auth redirects
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/chart', '/voice', '/settings']

// Routes that are public
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/faq', '/whitepaper']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get session from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // If no tokens, redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token is valid (basic check - full verification happens in API)
  try {
    // Decode JWT to check expiry (without full verification)
    if (accessToken) {
      const parts = accessToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        const expiry = payload.exp * 1000
        
        // If expired, redirect to refresh or login
        if (Date.now() > expiry) {
          // Token expired - let the client-side handle refresh
          // or redirect to login
          if (!refreshToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
          }
        }
      }
    }
  } catch {
    // If token decode fails, let it through - API will reject
    console.warn('Token decode failed, letting request through')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
