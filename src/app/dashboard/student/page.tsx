"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Copy, GraduationCap, Trophy, ChevronRight, BookOpen, Loader2, Video, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface LiveSession {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string;
  course_id: string;
  course_title: string;
  teacher_name: string;
}

export default function StudentDashboard() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // جلب الجلسات الحية
  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/student/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  // حماية المسار
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "student" && role !== "admin") {
        router.push("/login");
      }
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = user.email?.split("@")[0] || "طالب";

  // دالة للتحقق من أن الوقت الحالي يقع ضمن نافذة الجلسة
  const isJoinable = (scheduledAt: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const startWindow = new Date(sessionTime.getTime() - 10 * 60 * 1000); // 10 دقائق قبل
    const endWindow = new Date(sessionTime.getTime() + 60 * 60 * 1000);   // ساعة بعد
    return now >= startWindow && now <= endWindow;
  };

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
          0-day streak
        </div>
      </div>

      {/* Live Sessions Section */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 shadow-elegant"
        >
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-amber-500" />
            <h2 className="font-serif text-xl">Upcoming Live Sessions</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {sessions.map((session) => {
              const joinable = isJoinable(session.scheduled_at);
              return (
                <div key={session.id} className="flex items-center justify-between bg-background/50 rounded-2xl p-4 border border-border">
                  <div>
                    <h3 className="font-serif text-sm font-semibold">{session.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.course_title} · {session.teacher_name}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Clock size={12} />
                      {new Date(session.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <Link
                    href={`/live/${session.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      joinable
                        ? "bg-emerald text-white hover:bg-emerald-700"
                        : "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                    }`}
                    aria-disabled={!joinable}
                  >
                    {joinable ? (
                      <>
                        Join Now <ChevronRight size={14} />
                      </>
                    ) : (
                      <>
                        <Clock size={14} /> Waiting
                      </>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Learning Hub Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600">Continue your studies</div>
            <h2 className="font-serif text-2xl text-foreground">In Progress</h2>
            <div className="mt-4 rounded-4xl border border-border bg-card p-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 text-amber-500 mb-3" />
              <p>You are not enrolled in any courses yet. Explore the marketplace!</p>
              <Link href="/marketplace" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline">
                Browse Courses →
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600">Your milestones</div>
            <h2 className="font-serif text-2xl text-foreground">Achievements</h2>
            <div className="mt-4 rounded-4xl border border-border bg-card p-6 text-center text-muted-foreground">
              <Award className="mx-auto h-8 w-8 text-amber-500 mb-3" />
              <p>No completed courses yet.</p>
            </div>
          </section>

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

          <div className="rounded-4xl border border-border bg-card p-8 shadow-elegant">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Referral Center</div>
            <h3 className="mt-2 font-serif text-xl text-foreground">Share the Academy</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Earn credits for every friend who joins our community.</p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background p-2 text-[10px]">
              <code className="flex-1 truncate px-2 font-mono text-muted-foreground">ruhulqudus.net/r/{user.uid?.slice(0, 6) || "student"}</code>
              <button className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="font-serif text-2xl text-foreground">0</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Referrals</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="font-serif text-2xl text-amber-600">$0</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Credits</div>
              </div>
            </div>
          </div>

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