"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RoleToggle } from "./RoleToggle";
import { Mail, User, FileText, Upload, Target, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AuthCardProps {
  mode?: "login" | "signup";
  children?: ReactNode;
}

export function AuthCard({ mode = "signup", children }: AuthCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");

  // ==== الدالة المشتركة لتسجيل الدخول الاجتماعي ====
  const handleSocialLogin = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) toast.error(error.message);
  };

  // ==== مكون الأزرار الاجتماعية (مشترك) ====
  const SocialButtons = () => (
    <div className="space-y-3 pt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">أو سجل عبر</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );

  // ==== إذا كان هناك children (صفحة login تمرر نموذجها الخاص) ====
  if (children) {
    return (
      <div className="relative w-full max-w-xl">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass overflow-hidden rounded-3xl bg-card p-8 shadow-elegant md:p-10"
        >
          <div className="mb-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Ruhulqudus Academy
            </div>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl">
              {mode === "login" ? "Welcome Back" : "Begin Your Journey"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Continue your path with Dr. Jehan Ali Ahmed"
                : "Join an elite community devoted to the Arabic language"}
            </p>
          </div>
          {children}
          <SocialButtons /> {/* ✅ الأزرار تظهر في وضع login أيضًا */}
        </motion.div>
      </div>
    );
  }

  // ==== وضع signup الأصلي ====
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!fullName || !email || !password) {
      setError("جميع الحقول مطلوبة");
      toast.error("جميع الحقول مطلوبة");
      setIsLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error(signUpError.message);
      setIsLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email,
        role,
        bio: role === "teacher" ? bio : null,
      });

      if (role === "teacher") {
        await supabase.from("teacher_applications").insert({
          full_name: fullName,
          email,
          specialization,
          status: "pending",
          applied_at: new Date().toISOString(),
        });
        toast.success("تم إنشاء حساب المعلم بنجاح، طلبك قيد المراجعة");
        router.push("/dashboard/teacher?pending=true");
      } else {
        toast.success("تم إنشاء الحساب بنجاح");
        router.push("/dashboard/student");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-amber-500/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass overflow-hidden rounded-3xl bg-card p-8 shadow-elegant md:p-10"
      >
        <div className="mb-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
            Ruhulqudus Academy
          </div>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl">Begin Your Journey</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join an elite community devoted to the Arabic language
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-sm">
          <RoleToggle value={role} onChange={setRole} />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Field icon={<User className="h-4 w-4" />} label="الاسم الكامل" placeholder="أدخل اسمك الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Field icon={<Mail className="h-4 w-4" />} label="البريد الإلكتروني" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="كلمة المرور" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <AnimatePresence mode="wait">
            {role === "teacher" && (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* ... (نفس محتوى المعلم) ... */}
              </motion.div>
            )}
            {role === "student" && (
              <motion.div
                key="student"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* ... (نفس محتوى الطالب) ... */}
              </motion.div>
            )}
          </AnimatePresence>

          {error && <div className="rounded-md bg-destructive/10 p-2 text-center text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-elegant transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {isLoading ? "جاري الإنشاء..." : `إنشاء حساب ${role === "teacher" ? "معلم" : "طالب"}`}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            لديك حساب بالفعل؟ <a href="/login" className="text-amber-600 underline-offset-4 hover:underline">تسجيل الدخول</a>
          </p>

          <SocialButtons /> {/* ✅ الأزرار تظهر في وضع signup */}
        </form>
      </motion.div>
    </div>
  );
}

// مكون الحقل (بدون تغيير)
function Field({ icon, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; label: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon && <span className="mr-1 inline-block align-middle">{icon}</span>}
        {label}
      </label>
      <input {...props} className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-ring/30 transition focus:ring-2" />
    </div>
  );
}