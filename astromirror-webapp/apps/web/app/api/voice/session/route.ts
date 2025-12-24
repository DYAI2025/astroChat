/**
 * AstroMirror - Voice Session API Route
 * Proxies to FastAPI backend with auth forwarding
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies or header
    const cookieStore = await cookies()
    const supabaseToken = 
      cookieStore.get('sb-access-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!supabaseToken) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Bitte melde dich an.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    
    // Forward to FastAPI backend
    const response = await fetch(`${API_URL}/v1/voice/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseToken}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Map error codes
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Voice session error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Interner Serverfehler.' },
      { status: 500 }
    )
  }
}
