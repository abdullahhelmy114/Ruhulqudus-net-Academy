"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Upload, Loader2, Video, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LiveSession {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string;
  course_id: string;
  course_title: string;
}

export default function TeacherDashboard() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("B1");
  const [price, setPrice] = useState(49);
  const [isPublishing, setIsPublishing] = useState(false);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // التحقق من الجلسات القادمة
  useEffect(() => {
    if (!user || role !== "teacher") return;
    const fetchSessions = async () => {
      try {
        const res = await fetch(`/api/teacher/sessions?teacherUid=${user.uid}`);
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
  }, [user, role]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "teacher" && role !== "admin") {
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

  const fullName = user.displayName || user.email?.split("@")[0] || "معلم";
  const initial = fullName.charAt(0).toUpperCase();

  const handlePublish = async () => {
    const isProfileComplete =
      typeof window !== "undefined" && localStorage.getItem("profileComplete") === "true";
    if (!isProfileComplete) {
      alert("يجب إكمال ملفك الشخصي أولاً قبل نشر كورس.");
      return;
    }
    if (!title.trim()) return;
    setIsPublishing(true);
    setTimeout(() => {
      alert("Course submitted for moderation!");
      setTitle("");
      setLevel("B1");
      setPrice(49);
      setIsPublishing(false);
    }, 1000);
  };

  // دالة للتحقق من أن الوقت الحالي يقع ضمن نافذة الجلسة (قبل 10 دقائق وحتى ساعة بعدها)
  const isJoinable = (scheduledAt: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const startWindow = new Date(sessionTime.getTime() - 10 * 60 * 1000); // 10 دقائق قبل
    const endWindow = new Date(sessionTime.getTime() + 60 * 60 * 1000);   // ساعة بعد
    return now >= startWindow && now <= endWindow;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8 bg-background min-h-screen animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-4xl border border-border bg-card p-8 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 flex-none place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 font-serif text-3xl text-white ring-4 ring-amber-500/20 shadow-lg">
            {initial}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Instructor Portal</div>
            <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">{fullName}</h1>
            <p className="mt-1 text-sm italic text-muted-foreground">"Your students await your wisdom today."</p>
          </div>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <Link
            href="/dashboard/teacher/courses/new"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent md:flex-none"
          >
            <Upload className="h-4 w-4 text-amber-500" /> New Course
          </Link>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-elegant transition-transform hover:scale-[1.02] md:flex-none">
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>
      </div>

      {/* Upcoming Live Sessions */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 shadow-elegant"
        >
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-amber-500" />
            <h2 className="font-serif text-xl">Your Live Sessions</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {sessions.map((session) => {
              const joinable = isJoinable(session.scheduled_at);
              return (
                <div key={session.id} className="flex items-center justify-between bg-background/50 rounded-2xl p-4 border border-border">
                  <div>
                    <h3 className="font-serif text-sm font-semibold">{session.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.course_title}
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
                        Join Now <ArrowRight size={14} />
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

      {/* Course Creation Panel */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-elegant">
        {/* ... (نفس كود إنشاء الكورس بدون تغيير) ... */}
      </div>
    </div>
  );
}