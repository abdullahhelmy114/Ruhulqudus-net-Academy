"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Upload, Loader2, Video, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CertificationCard } from "@/components/dashboard/CertificationCard";
import { CourseCalendar } from "@/components/dashboard/CourseCalendar";
import { TeacherStats } from "@/components/dashboard/TeacherStats";
import { motion } from "framer-motion";

interface Session {
  id: string; title: string; scheduled_at: string; meeting_url: string; course_id: string; course_title: string;
}

interface TeacherData {
  fullName: string; initial: string; certificationProgress: number;
  students: number; activeCourses: number; revenue: number; sessions: Session[];
}

export default function TeacherDashboard() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== "teacher") return;
    fetch(`/api/teacher/dashboard?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, role]);

  useEffect(() => {
    if (!isLoading && (!user || (role !== "teacher" && role !== "admin"))) router.push("/login");
  }, [user, isLoading, role, router]);

  if (isLoading || loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!data) return null;

  const isJoinable = (s: string) => {
    const n = new Date(), t = new Date(s);
    return n >= new Date(t.getTime() - 10*60*1000) && n <= new Date(t.getTime() + 60*60*1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-4xl border border-border bg-card p-8 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 font-serif text-3xl text-white ring-4 ring-amber-500/20 shadow-lg">
            {data.initial}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Instructor Portal</div>
            <h1 className="mt-1 font-serif text-3xl">{data.fullName}</h1>
            <p className="mt-1 text-sm italic text-muted-foreground">"Your students await your wisdom today."</p>
          </div>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <Link href="/dashboard/teacher/courses/new" className="inline-flex items-center gap-2 rounded-full border bg-background px-6 py-3 text-sm hover:bg-accent">
            <Upload className="h-4 w-4 text-amber-500" /> New Course
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>
      </div>

      {/* Certification Card */}
      <CertificationCard progress={data.certificationProgress} />

      {/* Stats */}
      <TeacherStats />


      {/* Live Sessions */}
      {data.sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-amber-500" />
            <h2 className="font-serif text-xl">Your Live Sessions</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.sessions.map(s => {
              const joinable = isJoinable(s.scheduled_at);
              return (
                <div key={s.id} className="flex items-center justify-between bg-background/50 rounded-2xl p-4 border">
                  <div>
                    <h3 className="font-serif text-sm font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.course_title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Clock size={12} /> {new Date(s.scheduled_at).toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/live/${s.id}`} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${joinable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-muted text-muted-foreground pointer-events-none'}`}>
                    {joinable ? <>Join Now <ArrowRight size={14} /></> : <><Clock size={14} /> Waiting</>}
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}