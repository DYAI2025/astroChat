/**
 * Astro Natal Chart API Route
 * Proxies to FastAPI backend
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Nicht angemeldet' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/v1/astro/natal`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Astro natal error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Chart konnte nicht geladen werden' },
      { status: 500 }
    )
  }
}
