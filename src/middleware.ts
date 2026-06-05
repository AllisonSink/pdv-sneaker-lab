import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const isPlanosRoute = request.nextUrl.pathname === '/planos'
  const isRootRoute = request.nextUrl.pathname === '/'

  if (isPlanosRoute || isRootRoute) {
    return supabaseResponse
  }

  // Initialize Supabase server client for middleware session check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginRoute = request.nextUrl.pathname.startsWith('/login')
  const isPublicRoute = isLoginRoute

  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isStaticFile = request.nextUrl.pathname.includes('.') || request.nextUrl.pathname.startsWith('/_next')

  if (isStaticFile || isApiRoute) {
    return supabaseResponse
  }

  // Route protection rules
  /*
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  */

  if (user && isLoginRoute) {
    const role = user.user_metadata?.role || 'seller'
    const url = request.nextUrl.clone()
    url.pathname = role === 'admin' ? '/dashboard' : '/pdv'
    return NextResponse.redirect(url)
  }

  if (user && user.user_metadata?.role === 'seller' && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/pdv'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
