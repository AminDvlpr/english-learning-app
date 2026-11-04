import { createBrowserClient } from '@supabase/ssr'

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && url !== '' && key !== '' && url.startsWith('http')
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client if not configured so it doesn't crash in local mode
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({ data: null, error: new Error("Supabase not configured") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
           eq: () => ({
               single: async () => ({ data: null, error: null }),
               order: () => ({
                   limit: async () => ({ data: null, error: null })
               })
           })
        }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({
            eq: async () => ({ data: null, error: null })
        })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({
            unsubscribe: () => {}
          })
        })
      }),
      removeChannel: () => {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}