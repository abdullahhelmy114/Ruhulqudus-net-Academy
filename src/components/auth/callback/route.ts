// src/app/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    if (user) {
      // تحقق إن كان البروفايل موجودًا، إن لم يكن أنشئه
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          role: "student", // افتراضي
        });
      }
      return NextResponse.redirect(`${origin}/dashboard/student`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}