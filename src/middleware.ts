// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  const { data: { user } } = await supabase.auth.getUser()

  // مسارات عامة لا تحتاج حماية
  const publicPaths = ['/', '/login', '/signup', '/marketplace', '/about']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path)

  // مسارات protected
  const isAdminPath = request.nextUrl.pathname.startsWith('/dashboard/admin')
  const isTeacherPath = request.nextUrl.pathname.startsWith('/dashboard/teacher')
  const isStudentPath = request.nextUrl.pathname.startsWith('/dashboard/student')

  if (!user && !isPublicPath) {
    // غير مسجل ويحاول دخول protected => يوجه للـ login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // ✅ فحص خاص للإيميل قبل أي شيء للمسارات الإدارية
    if (isAdminPath && user.email !== 'abdullahhelmy114@gmail.com') {
      // لو البريد ليس البريد المخصص، نعيد التوجيه إلى الصفحة الرئيسية
      return NextResponse.redirect(new URL('/', request.url))
    }

    // جلب دور المستخدم من جدول profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'student'

    // admin يمكنه الوصول إلى admin و teacher و student
    // teacher لا يمكنه الوصول إلى admin
    // student لا يمكنه الوصول إلى admin أو teacher

    if (isAdminPath && role !== 'admin') {
      // هذا الشرط لن ينطبق إلا إذا كان البريد هو abdullahhelmy114 لكن دوره ليس admin
      return NextResponse.redirect(new URL('/dashboard/student', request.url))
    }

    if (isTeacherPath && role !== 'admin' && role !== 'teacher') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url))
    }

    // إذا كان المستخدم مسجلاً ويحاول دخول login أو signup نوجهه للوحة المناسبة
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
      if (role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      if (role === 'teacher') return NextResponse.redirect(new URL('/dashboard/teacher', request.url))
      return NextResponse.redirect(new URL('/dashboard/student', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}