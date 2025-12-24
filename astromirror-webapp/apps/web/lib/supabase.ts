/**
 * Supabase Client Utilities
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client - only create if credentials exist
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Check if Supabase is configured
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

// Types for database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          locale: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          locale?: string
          timezone?: string
        }
        Update: {
          display_name?: string | null
          locale?: string
          timezone?: string
        }
      }
      birth_data: {
        Row: {
          user_id: string
          birth_utc: string
          lat: number
          lon: number
          place_label: string | null
          consent_version: string
          consent_at: string
          updated_at: string
        }
      }
      entitlements: {
        Row: {
          user_id: string
          plan: 'free' | 'premium'
          status: 'active' | 'past_due' | 'canceled'
          voice_minutes_monthly: number
          voice_minutes_used: number
          period_start: string
          period_end: string
          updated_at: string
        }
      }
      natal_charts: {
        Row: {
          id: string
          user_id: string
          computed_at: string
          engine_version: string
          zodiac: string
          house_system: string
          warnings: Record<string, unknown>
          payload: Record<string, unknown>
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string | null
          quiz_type: string
          answers: Record<string, unknown>
          scores: Record<string, unknown> | null
          profile_id: string | null
          started_at: string
          completed_at: string | null
        }
      }
    }
  }
}
