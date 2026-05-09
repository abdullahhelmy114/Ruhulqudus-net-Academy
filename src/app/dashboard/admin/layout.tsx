export const runtime = 'edge';

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=يرجى تسجيل الدخول للوصول إلى لوحة التحكم')
  }

  if (user.email !== 'abdullahhelmy114@gmail.com') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">غير مصرح</h1>
          <p className="text-muted-foreground">
            هذا الحساب لا يمتلك صلاحية الوصول إلى لوحة التحكم.
          </p>
        </div>
      </div>
    )
  }

  // كل شيء تمام → عرض المحتوى
  return <>{children}</>
}