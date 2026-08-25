import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Jika belum login dan mencoba akses dashboard
  if (!user && (pathname.startsWith('/customer') || pathname.startsWith('/driver') || pathname.startsWith('/admin'))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.startsWith('/driver') ? '/driver/login' : '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Cek Role User
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Baca role dari profile DB atau dari metadata auth jika profile DB belum terupdate
    const userRole = profile?.role || user.user_metadata?.role || 'customer';

    // Jika user mengakses /driver tetapi rolenya bukan driver
    if (pathname.startsWith('/driver') && userRole !== 'driver') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/customer';
      return NextResponse.redirect(redirectUrl);
    }

    // Jika user mengakses /customer tetapi rolenya driver
    if (pathname.startsWith('/customer') && userRole === 'driver') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/driver';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/customer/:path*', '/driver/:path*', '/admin/:path*'],
};