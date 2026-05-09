"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CourseCalendar } from "@/components/dashboard/CourseCalendar";
import { Award, Copy, GraduationCap, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Types
type StudentProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
};

type InProgressCourse = {
  id: string;
  title: string;
  next_lesson_title: string;
  progress_percent: number;
};

type CompletedCourse = {
  id: string;
  title: string;
  completed_at: string;
};

type StudentStats = {
  streak_days: number;
  referrals_count: number;
  credits_amount: number;
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [inProgress, setInProgress] = useState<InProgressCourse[]>([]);
  const [completed, setCompleted] = useState<CompletedCourse[]>([]);
  const [stats, setStats] = useState<StudentStats>({ streak_days: 0, referrals_count: 0, credits_amount: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchStudentData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // جلب بيانات الملف الشخصي من جدول profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        router.push("/login");
        return;
      }
      setProfile(profileData);

      // جلب الدورات الجارية (مثال: من جدول enrollments + courses)
      // نفترض وجود جدول enrollments يربط student_id مع course_id ويخزن progress و next_lesson
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          progress,
          next_lesson,
          courses:course_id (id, title)
        `)
        .eq("student_id", user.id)
        .eq("status", "active");

      if (!enrollError && enrollments) {
        const inProg = enrollments.map((e: any) => ({
          id: e.course_id,
          title: e.courses?.title || "Untitled",
          next_lesson_title: e.next_lesson || "Continue learning",
          progress_percent: e.progress || 0,
        }));
        setInProgress(inProg);
      }

      // جلب الدورات المكتملة (من enrollments حيث status = 'completed')
      const { data: completedEnrolls } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          completed_at,
          courses:course_id (id, title)
        `)
        .eq("student_id", user.id)
        .eq("status", "completed");

      if (completedEnrolls) {
        const comp = completedEnrolls.map((e: any) => ({
          id: e.course_id,
          title: e.courses?.title || "Untitled",
          completed_at: e.completed_at ? new Date(e.completed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently",
        }));
        setCompleted(comp);
      }

      // جلب الإحصائيات (streak, referrals, credits) – نفترض جدول student_stats
      const { data: statsData } = await supabase
        .from("student_stats")
        .select("streak_days, referrals_count, credits_amount")
        .eq("student_id", user.id)
        .single();

      if (statsData) {
        setStats({
          streak_days: statsData.streak_days || 0,
          referrals_count: statsData.referrals_count || 0,
          credits_amount: statsData.credits_amount || 0,
        });
      }

      setLoading(false);
    }

    fetchStudentData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-700 space-y-8 bg-background px-4 py-10 md:px-8 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-8 shadow-elegant flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">As‑salāmu ʿalaykum</div>
          <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">Welcome back, {firstName}</h1>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Continue where you left off — every word is a victory.
          </p>
        </div>
        
        <div className="flex items-center gap-3 rounded-full border border-amber-500/20 bg-background/50 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md">
          <Trophy className="h-5 w-5 animate-bounce text-amber-500" /> 
          {stats.streak_days}-day streak
        </div>
      </div>

      {/* Learning Hub Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Courses & Calendar */}
        <div className="space-y-10 lg:col-span-2">
          
          {/* In Progress Section */}
          <section>
            <SectionHeader title="In Progress" subtitle="Continue your studies" />
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {inProgress.length > 0 ? (
                inProgress.map((c) => (
                  <div key={c.id} className="group rounded-4xl border border-border bg-card p-6 shadow-elegant transition-all hover:border-amber-500/30 hover:shadow-lg">
                    <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-amber-600">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.next_lesson_title}</p>
                    
                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">{c.progress_percent}% complete</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted shadow-inner">
                        <div
                          className="h-full bg-amber-500 transition-all duration-1000"
                          style={{ width: `${c.progress_percent}%` }}
                        />
                      </div>
                    </div>
                    
                    <button className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700">
                      Resume Learning <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-4xl border border-border bg-card p-8 text-center text-muted-foreground">
                  You are not enrolled in any courses yet. Explore the marketplace!
                </div>
              )}
            </div>
          </section>

          {/* Calendar Section */}
          <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-elegant">
            <CourseCalendar canJoin={false} />
          </section>
        </div>

        {/* Right Column: Achievements & Extras */}
        <div className="space-y-8">
          
          {/* Completed Courses */}
          <section>
            <SectionHeader title="Achievements" subtitle="Your milestones" />
            <div className="mt-4 space-y-4">
              {completed.length > 0 ? (
                completed.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-amber-500 text-black shadow-md">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-serif text-base text-foreground">{c.title}</div>
                      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Completed {c.completed_at}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                  No completed courses yet.
                </div>
              )}
            </div>
          </section>

          {/* Placement Test CTA */}
          <div className="group relative overflow-hidden rounded-4xl border-2 border-amber-500/30 bg-card p-8 shadow-elegant">
            <GraduationCap className="mb-4 h-10 w-10 text-amber-500 transition-transform group-hover:scale-110" />
            <h3 className="font-serif text-2xl text-foreground">Placement Test</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Discover your level — get a tailored learning path from our experts.
            </p>
            <button className="mt-6 w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-black shadow-lg transition-all hover:brightness-110 active:scale-95">
              Launch Assessment
            </button>
          </div>

          {/* Referral Center */}
          <div className="rounded-4xl border border-border bg-card p-8 shadow-elegant">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Referral Center</div>
            <h3 className="mt-2 font-serif text-xl text-foreground">Share the Academy</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Earn credits for every friend who joins our community.</p>
            
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background p-2 text-[10px]">
              <code className="flex-1 truncate px-2 font-mono text-muted-foreground">ruhulqudus.academy/r/{profile.id.slice(0, 6)}</code>
              <button className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="font-serif text-2xl text-foreground">{stats.referrals_count}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Referrals</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="font-serif text-2xl text-amber-600">${stats.credits_amount}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Credits</div>
              </div>
            </div>
          </div>

          {/* Quick Link to Marketplace */}
          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm font-bold text-amber-600 transition-all hover:bg-amber-500/10 shadow-sm"
          >
            Explore Marketplace →
          </Link>
        </div>

      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600">{subtitle}</div>
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
    </div>
  );
}