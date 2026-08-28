import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
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
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 30, // Tiket Permanen 30 Hari
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  let redirectUrl = null;

  // 1. Jika BELUM login, cegah masuk ke dalam dashboard
  if (!user && (pathname.startsWith('/customer') || pathname.startsWith('/driver') || pathname.startsWith('/admin'))) {
    redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.startsWith('/driver') ? '/driver/login' : '/login';
  }

  // 2. Jika SUDAH login, atur lalu lintasnya
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role || user.user_metadata?.role || 'customer';

    // BINGO: Jika sudah login tapi nyasar ke halaman awal/login, lemparkan langsung ke dalam!
    if (pathname === '/login' || pathname === '/register' || pathname === '/') {
      redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === 'driver' ? '/driver' : '/customer';
    } 
    // Batasi akses jika role tidak sesuai
    else if (pathname.startsWith('/driver') && userRole !== 'driver') {
      redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/customer';
    } 
    else if (pathname.startsWith('/customer') && userRole === 'driver') {
      redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/driver';
    }
  }

  // 3. Eksekusi perpindahan halaman DAN bawa serta tiket 30 harinya
  if (redirectUrl) {
    const finalResponse = NextResponse.redirect(redirectUrl);
    
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        maxAge: 60 * 60 * 24 * 30, // Kloning tiket agar tidak hilang saat dipindah
      });
    });
    
    return finalResponse;
  }

  return supabaseResponse;
}

// 4. Bangunkan satpam untuk MENJAGA SEMUA HALAMAN (kecuali gambar/file statis)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};