"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CertificationCard } from "@/components/dashboard/CertificationCard";
import { CourseCalendar } from "@/components/dashboard/CourseCalendar";
import { TeacherStats } from "@/components/dashboard/TeacherStats";
import { Plus, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TeacherData = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
};

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeacherData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching teacher data:", error);
        router.push("/login");
        return;
      }

      setTeacher(profile);
      setLoading(false);
    }

    fetchTeacherData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) return null;

  const initial = teacher.full_name.charAt(0).toUpperCase();

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
            <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">{teacher.full_name}</h1>
            <p className="mt-1 text-sm italic text-muted-foreground">"Your students await your wisdom today."</p>
          </div>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent md:flex-none">
            <Upload className="h-4 w-4 text-amber-500" /> Upload Course
          </button>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-elegant transition-transform hover:scale-[1.02] md:flex-none">
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <CertificationCard progress={62} />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-elegant">
            <CourseCalendar canJoin />
          </div>
        </div>
        <div className="lg:col-span-2">
          <CourseManagementPanel teacherId={teacher.id} />
        </div>
      </div>

      {/* Statistics Section - لم نعد نمرر teacherId هنا */}
      <TeacherStats />
    </div>
  );
}

// ========== Course Management Panel (مع اتصال Supabase) ==========
function CourseManagementPanel({ teacherId }: { teacherId: string }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("B1");
  const [price, setPrice] = useState(49);
  const [isPublishing, setIsPublishing] = useState(false);
  const supabase = createClient();

  const handlePublish = async () => {
    if (!title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    setIsPublishing(true);
    const { error } = await supabase.from("courses").insert({
      title,
      level,
      price,
      teacher_id: teacherId,
      status: "pending",
      lessons_count: 0,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      alert("Error publishing course: " + error.message);
    } else {
      alert("Course submitted for moderation!");
      setTitle("");
      setLevel("B1");
      setPrice(49);
    }
    setIsPublishing(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-elegant">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Authoring Studio</div>
        <h3 className="mt-2 font-serif text-2xl text-foreground">Create a New Course</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Craft your curriculum and share it with the world.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
              placeholder="e.g. Classical Poetry Mastery"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div className="group cursor-pointer rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center transition-all hover:border-amber-500/50 hover:bg-amber-500/10">
            <Upload className="mx-auto h-6 w-6 text-amber-500 transition-transform group-hover:scale-110" />
            <div className="mt-3 text-sm font-semibold text-foreground">Drop curriculum files here</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PDF, MP4, or DOCX</div>
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="mt-4 w-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-4 text-sm font-bold text-white shadow-elegant transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Publish to Marketplace"}
          </button>
        </div>
      </div>
    </div>
  );
}