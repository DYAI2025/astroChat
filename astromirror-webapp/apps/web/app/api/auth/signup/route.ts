/**
 * Auth Signup API Route
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'config_error', message: 'Supabase nicht konfiguriert' },
        { status: 503 }
      )
    }

    const { email, password, name, plan } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'E-Mail und Passwort erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'weak_password', message: 'Passwort muss mindestens 8 Zeichen haben' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name || email.split('@')[0],
          plan: plan || 'free',
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'email_exists', message: 'Diese E-Mail ist bereits registriert' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'signup_failed', message: 'Registrierung fehlgeschlagen' },
        { status: 400 }
      )
    }

    // Set cookies if session exists (email confirmation might be required)
    const cookieStore = await cookies()
    
    if (data.session) {
      cookieStore.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      
      cookieStore.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      confirmation_required: !data.session,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'internal', message: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
