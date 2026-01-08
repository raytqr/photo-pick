import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create a supabase client that can read/write cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null;
    try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
            user = data.user;
        }
    } catch {
        // Auth error (e.g., invalid refresh token) - treat as unauthenticated
        user = null;
    }

    // ROUTE PROTECTION LOGIC
    const path = request.nextUrl.pathname;

    // 1. If trying to access Protected Routes (Dashboard) without User -> Redirect to Login
    if (path.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. If Auth User tries to access Public Auth Pages (Login/Register) -> Redirect to Dashboard
    if ((path === '/login' || path === '/register') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. Admin route protection with separate admin session
    if (path.startsWith('/admin')) {
        const ADMIN_EMAIL = 'rayhanwhyut27@gmail.com';
        const ADMIN_SESSION_COOKIE = 'admin_session';
        const ADMIN_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in ms

        // Get admin session cookie
        const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        const adminSessionValid = adminSession && (Date.now() - parseInt(adminSession)) < ADMIN_SESSION_DURATION;

        // Allow access to admin login page
        if (path === '/admin/login') {
            // If already has valid admin session, redirect to admin dashboard
            if (user && user.email === ADMIN_EMAIL && adminSessionValid) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            return response
        }

        // For all other admin routes, require:
        // 1. Valid auth session
        // 2. Admin email
        // 3. Valid admin session cookie (from /admin/login)
        if (!user || user.email !== ADMIN_EMAIL || !adminSessionValid) {
            // Clear any stale admin session
            const loginUrl = new URL('/admin/login', request.url);
            const redirectResponse = NextResponse.redirect(loginUrl);
            redirectResponse.cookies.delete(ADMIN_SESSION_COOKIE);
            return redirectResponse;
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
