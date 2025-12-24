/**
 * Voice Usage API Route
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseToken = 
      cookieStore.get('sb-access-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!supabaseToken) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Nicht angemeldet.' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/v1/voice/usage`, {
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Voice usage error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Serverfehler.' },
      { status: 500 }
    )
  }
}
