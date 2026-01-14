import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    // If there's an error in the URL params, redirect to error page with details
    if (error || errorCode) {
        const errorParams = new URLSearchParams({
            ...(error && { error }),
            ...(errorCode && { error_code: errorCode }),
            ...(errorDescription && { error_description: errorDescription }),
        });
        return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams.toString()}`);
    }

    // Determine redirect destination based on "next" param or "type" for password reset
    const next = searchParams.get('next') ?? '/dashboard'
    const type = searchParams.get('type')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // If this is a password reset, redirect to reset password page
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password`)
            }
            return NextResponse.redirect(`${origin}${next}`)
        }

        // Exchange failed - redirect with error info
        const errorParams = new URLSearchParams({
            error: 'exchange_failed',
            error_code: 'session_exchange_error',
            error_description: error.message || 'Failed to verify your session',
        });
        return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams.toString()}`);
    }

    // No code provided - generic error
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code&error_description=No+verification+code+provided`)
}
