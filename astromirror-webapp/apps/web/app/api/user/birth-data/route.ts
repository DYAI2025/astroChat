/**
 * User Birth Data API Route
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Nicht angemeldet' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.birth_date || !body.birth_time || !body.birth_place) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Alle Felder erforderlich' },
        { status: 400 }
      )
    }

    // Forward to backend
    const response = await fetch(`${API_URL}/v1/user/birth-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Birth data error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Speichern fehlgeschlagen' },
      { status: 500 }
    )
  }
}

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

    const response = await fetch(`${API_URL}/v1/user/birth-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Birth data error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Laden fehlgeschlagen' },
      { status: 500 }
    )
  }
}
