import type { Context } from 'hono'
import type { createClient } from '@supabase/supabase-js'

export type Env = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export type YogaContext = {
  supabase: ReturnType<typeof createClient>
  var: Context<{ Bindings: Env }>['var']
}
