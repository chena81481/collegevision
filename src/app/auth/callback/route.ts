import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { syncStudentProfile } from '@/lib/student-journey'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' is an optional param to redirect the user to a specific page after login
  const next = searchParams.get('next') ?? '/student/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await syncStudentProfile({
        user,
        source: 'AUTH_CALLBACK',
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
