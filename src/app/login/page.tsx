"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. تسجيل الدخول
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message === "Invalid login credentials") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        setError(signInError.message);
        toast.error(signInError.message);
      }
      setIsLoading(false);
      return;
    }

    // 2. جلب دور المستخدم من جدول profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      // إذا لم يكن هناك بروفايل، نعتبره طالباً (يتم إنشاؤه تلقائياً عبر trigger)
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard/student");
      setIsLoading(false);
      return;
    }

    // التوجيه حسب الدور
    toast.success("تم تسجيل الدخول بنجاح");

    switch (profile.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "teacher":
        router.push("/dashboard/teacher");
        break;
      default:
        router.push("/dashboard/student");
    }

    setIsLoading(false);
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <AuthCard mode="login">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-2 text-center text-sm text-destructive">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            ليس لديك حساب؟{" "}
            <a href="/signup" className="text-amber-600 underline-offset-4 hover:underline">
              إنشاء حساب
            </a>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}