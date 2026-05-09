"use client";

import { useState, useEffect } from "react";
import {
  Users, GraduationCap, DollarSign, TrendingUp, ShieldCheck, FileText,
  CheckCircle2, XCircle, Eye, Search, BookOpen, Clock, Wallet,
  Sparkles, Settings2, Crown, AlertCircle, ArrowUpRight, MoreHorizontal,
  Filter, Download, Bot, Save, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type TabKey = "overview" | "teachers" | "courses" | "users" | "finance" | "ai";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "teachers", label: "Teacher Verification", icon: ShieldCheck },
  { key: "courses", label: "Course Moderation", icon: BookOpen },
  { key: "users", label: "User Management", icon: Users },
  { key: "finance", label: "Financial Center", icon: Wallet },
  { key: "ai", label: "AI Configuration", icon: Bot },
];

// Types (تعديل لتتوافق مع جدول profiles)
type User = {
  id: string;
  full_name: string;
  email: string;
  role: "Student" | "Teacher";
  plan: string;
  status: "Active" | "Suspended";
  joined: string;
  avatar_url?: string;
};

type TeacherApplication = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  years_experience: number;
  specialization: string;
  applied_at: string;
  cv_url: string;
  status: "pending" | "approved" | "rejected";
};

type Course = {
  id: string;
  title: string;
  teacher_name: string;
  teacher_id: string;
  level: string;
  price: number;
  lessons_count: number;
  submitted_at: string;
  status: "pending" | "published" | "rejected";
  description: string;
  thumbnail_url?: string;
};

type Transaction = {
  id: string;
  user_name: string;
  item_name: string;
  amount: number;
  type: string;
  created_at: string;
};

type Payout = {
  teacher_id: string;
  teacher_name: string;
  students_count: number;
  commission_rate: number;
  pending_amount: number;
};

type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  totalRevenue: number;
  revenueDelta: string;
  studentsDelta: string;
  teachersDelta: string;
  coursesDelta: string;
};

type PendingItems = {
  teacher_applications: number;
  courses_pending: number;
  payouts_pending: number;
  reported_content: number;
};

function getLastMonthDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
}

function getDaysAgoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function aggregateDailyRevenue(transactions: any[], days: number): number[] {
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyMap.set(dateKey, 0);
  }
  for (const tx of transactions) {
    const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
    const current = dailyMap.get(dateKey) || 0;
    dailyMap.set(dateKey, current + (tx.amount / 1000));
  }
  return Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, value]) => value);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-card p-6 shadow-elegant md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700 ring-4 ring-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Management Suite</div>
            <h1 className="font-serif text-3xl">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Oversee the entire Ruhulqudus Academy ecosystem.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-elegant"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === "overview" && <PlatformOverview />}
            {tab === "teachers" && <TeacherVerification />}
            {tab === "courses" && <CourseModeration />}
            {tab === "users" && <UserManagement />}
            {tab === "finance" && <FinancialCenter />}
            {tab === "ai" && <AIConfiguration />}
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Overview ───────────────────────── */
function PlatformOverview() {
  const supabase = createClient(); // ✅ تعريف supabase
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItems | null>(null);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverviewData() {
      setLoading(true);
      try {
        // باستخدام profiles بدلاً من users
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');
        
        const { count: teachersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'teacher');
        
        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        
        const { data: revenueData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed');
        
        const { data: lastMonthRevenue } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', getLastMonthDate());

        const totalRevenue = revenueData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const lastMonthTotal = lastMonthRevenue?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const revenueDelta = lastMonthTotal ? ((totalRevenue - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : "0";

        const { count: pendingTeachers } = await supabase
          .from('teacher_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        const { count: pendingCourses } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        const { count: pendingPayouts } = await supabase
          .from('payouts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        const { count: reportedContent } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);

        setStats({
          totalStudents: studentsCount || 0,
          totalTeachers: teachersCount || 0,
          activeCourses: coursesCount || 0,
          totalRevenue: totalRevenue,
          revenueDelta: `${revenueDelta}%`,
          studentsDelta: "+12.4%",
          teachersDelta: "+3.1%",
          coursesDelta: "+8.7%",
        });

        setPendingItems({
          teacher_applications: pendingTeachers || 0,
          courses_pending: pendingCourses || 0,
          payouts_pending: pendingPayouts || 0,
          reported_content: reportedContent || 0,
        });

        const { data: trendData } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', getDaysAgoDate(30));

        const dailyRevenue = aggregateDailyRevenue(trendData || [], 30);
        setRevenueData(dailyRevenue);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOverviewData();
  }, [supabase]);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents.toLocaleString() || "0", delta: stats?.studentsDelta || "0%", icon: Users, accent: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Total Teachers", value: stats?.totalTeachers.toLocaleString() || "0", delta: stats?.teachersDelta || "0%", icon: GraduationCap, accent: "from-amber-500/30 to-amber-500/5" },
    { label: "Active Courses", value: stats?.activeCourses.toLocaleString() || "0", delta: stats?.coursesDelta || "0%", icon: BookOpen, accent: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Total Revenue", value: `$${stats?.totalRevenue.toLocaleString() || "0"}`, delta: stats?.revenueDelta || "0%", icon: DollarSign, accent: "from-amber-500/30 to-amber-500/5" },
  ];

  const pendingList = [
    { icon: ShieldCheck, label: "Teacher applications", count: pendingItems?.teacher_applications || 0 },
    { icon: BookOpen, label: "Courses awaiting review", count: pendingItems?.courses_pending || 0 },
    { icon: Wallet, label: "Payouts to process", count: pendingItems?.payouts_pending || 0 },
    { icon: AlertCircle, label: "Reported content", count: pendingItems?.reported_content || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          const isPositive = s.delta.startsWith("+");
          return (
            <div key={s.label} className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-elegant">
              <div className={cn("absolute inset-0 bg-linear-to-br opacity-60", s.accent)} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-background/80 backdrop-blur">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    isPositive ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"
                  )}>
                    <ArrowUpRight className={cn("h-3 w-3", !isPositive && "rotate-90")} /> {s.delta}
                  </span>
                </div>
                <div className="mt-4 font-serif text-3xl">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Last 30 days</div>
              <h3 className="font-serif text-xl">Revenue Trend</h3>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-accent">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <RevenueChart data={revenueData} />
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-elegant">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Action Required</div>
          <h3 className="font-serif text-xl">Pending Items</h3>
          <ul className="mt-4 space-y-3">
            {pendingList.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    {item.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mt-6 flex h-44 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="group relative flex-1">
          <div
            className="rounded-t-lg bg-linear-to-t from-primary to-amber-500/70 transition-all hover:opacity-80"
            style={{ height: `${(v / max) * 100}%`, minHeight: v === 0 ? 2 : undefined }}
          />
          <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
            ${v.toFixed(0)}k
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Teacher Verification ───────────────────────── */
function TeacherVerification() {
  const supabase = createClient();
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('teacher_applications')
      .select('*')
      .eq('status', 'pending')
      .order('applied_at', { ascending: false });
    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('teacher_applications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      const app = applications.find(a => a.id === id);
      if (app) {
        await supabase.from('profiles').update({ role: 'teacher' }).eq('email', app.email);
      }
      fetchApplications();
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('teacher_applications')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) fetchApplications();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Pending Teacher Applications</h2>
          <p className="text-sm text-muted-foreground">{applications.length} applications awaiting review</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm hover:bg-accent">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {applications.map((t) => (
          <div key={t.id} className="rounded-3xl border bg-card p-5 shadow-elegant transition-all hover:shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 font-serif text-xl text-white">
                  {t.full_name.charAt(0)} {/* ✅ use full_name */}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg">{t.full_name}</h3> {/* ✅ use full_name */}
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      {t.specialization}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t.email} · {t.country} · {t.years_experience} yrs experience
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> Applied {formatRelativeTime(t.applied_at)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-xs font-medium hover:bg-accent">
                  <FileText className="h-3.5 w-3.5" /> View CV
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-xs font-medium hover:bg-accent">
                  <Eye className="h-3.5 w-3.5" /> Profile
                </button>
                <button
                  onClick={() => handleReject(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-500/20"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-semibold text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              </div>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
            No pending applications
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Course Moderation ───────────────────────── */
function CourseModeration() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teacher:teacher_id (full_name)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });
    if (!error && data) {
      const formatted = data.map((c: any) => ({
        ...c,
        teacher_name: c.teacher?.full_name || 'Unknown'
      }));
      setCourses(formatted);
    }
    setLoading(false);
  }

  async function handlePublish(id: string) {
    const { error } = await supabase
      .from('courses')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) fetchCourses();
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('courses')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (!error) fetchCourses();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl">Course Moderation Queue</h2>
        <p className="text-sm text-muted-foreground">{courses.length} courses awaiting review</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-3xl border bg-card shadow-elegant">
            <div className="relative aspect-16/7 bg-linear-to-r from-emerald-600 to-emerald-700">
              <div className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
                ${c.price}
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Level {c.level}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg leading-tight">{c.title}</h3>
              <div className="mt-1 text-xs text-muted-foreground">
                by {c.teacher_name} · {c.lessons_count} lessons
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> Submitted {formatRelativeTime(c.submitted_at)}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full border bg-background py-2 text-xs font-medium hover:bg-accent">
                  Preview
                </button>
                <button
                  onClick={() => handleReject(c.id)}
                  className="flex-1 rounded-full border border-red-500/30 bg-red-500/10 py-2 text-xs font-medium text-red-600 hover:bg-red-500/20"
                >
                  Reject
                </button>
                <button
                  onClick={() => handlePublish(c.id)}
                  className="flex-1 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 py-2 text-xs font-semibold text-white"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-2 rounded-3xl border bg-card p-12 text-center text-muted-foreground">
            No pending courses
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── User Management ───────────────────────── */
function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('joined', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }

  async function handleUpdateStatus(userId: string, newStatus: "Active" | "Suspended") {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);
    if (!error) fetchUsers();
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl">User Management</h2>
          <p className="text-sm text-muted-foreground">{users.length} total members on platform</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full rounded-full border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border bg-card shadow-elegant">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-5 py-3 text-left">User</th><th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Plan</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Joined</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t transition-colors hover:bg-accent/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 text-xs font-semibold text-white">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{u.full_name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", u.role === "Teacher" ? "bg-amber-500/20 text-amber-800" : "bg-primary/10 text-primary")}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm">{u.plan}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.status}
                      onChange={(e) => handleUpdateStatus(u.id, e.target.value as "Active" | "Suspended")}
                      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer border-none bg-transparent", u.status === "Active" ? "text-emerald-600" : "text-red-600")}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-grid h-8 w-8 place-items-center rounded-full hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Financial Center ───────────────────────── */
function FinancialCenter() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState({ grossRevenue: 0, pendingPayouts: 0, platformNet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  async function fetchFinancialData() {
    try {
      // جلب أحدث المعاملات
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, amount, type, created_at, user_id, course_id')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      let formattedTx: Transaction[] = [];
      if (txData && txData.length) {
        const userIds = txData.map(t => t.user_id).filter(Boolean);
        const { data: usersData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        const userMap = new Map(usersData?.map(u => [u.id, u.full_name]));
        const courseIds = txData.map(t => t.course_id).filter(Boolean);
        let courseMap = new Map();
        if (courseIds.length) {
          const { data: coursesData } = await supabase.from('courses').select('id, title').in('id', courseIds);
          coursesData?.forEach(c => courseMap.set(c.id, c.title));
        }
        formattedTx = txData.map(t => ({
          id: t.id,
          user_name: userMap.get(t.user_id) || 'Unknown',
          item_name: courseMap.get(t.course_id) || t.type || 'Transaction',
          amount: t.amount,
          type: t.type || 'general',
          created_at: t.created_at,
        }));
      }
      setTransactions(formattedTx);

      // جلب المدفوعات المعلقة
      const { data: payoutData } = await supabase
        .from('payouts')
        .select('id, amount, teacher_id, commission_rate')
        .eq('status', 'pending');

      let formattedPayouts: Payout[] = [];
      if (payoutData && payoutData.length) {
        const teacherIds = [...new Set(payoutData.map(p => p.teacher_id))].filter(Boolean);
        const { data: teachers } = await supabase.from('profiles').select('id, full_name').in('id', teacherIds);
        const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]));
        const map = new Map<string, Payout>();
        for (const p of payoutData) {
          const existing = map.get(p.teacher_id);
          if (existing) existing.pending_amount += p.amount;
          else map.set(p.teacher_id, { teacher_id: p.teacher_id, teacher_name: teacherMap.get(p.teacher_id) || 'Unknown', students_count: 0, commission_rate: p.commission_rate, pending_amount: p.amount });
        }
        formattedPayouts = Array.from(map.values());
      }
      setPayouts(formattedPayouts);

      // الإحصائيات الإجمالية
      const { data: allTx } = await supabase.from('transactions').select('amount').eq('status', 'completed');
      const { data: pendingPayoutsData } = await supabase.from('payouts').select('amount').eq('status', 'pending');
      const grossRevenue = allTx?.reduce((s, t) => s + t.amount, 0) || 0;
      const pendingPayoutsTotal = pendingPayoutsData?.reduce((s, p) => s + p.amount, 0) || 0;
      setStats({ grossRevenue, pendingPayouts: pendingPayoutsTotal, platformNet: grossRevenue * 0.3 });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleProcessAllPayouts() {
    const { error } = await supabase.from('payouts').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('status', 'pending');
    if (!error) fetchFinancialData();
  }

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: "Gross Revenue", value: `$${stats.grossRevenue.toLocaleString()}`, sub: "All time", icon: DollarSign },
    { label: "Pending Payouts", value: `$${stats.pendingPayouts.toLocaleString()}`, sub: `${payouts.length} teachers`, icon: Wallet },
    { label: "Platform Net", value: `$${stats.platformNet.toLocaleString()}`, sub: "After 30% commission", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-3xl border bg-card p-6 shadow-elegant">
              <div className="flex items-center justify-between"><div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div><Icon className="h-4 w-4 text-amber-500" /></div>
              <div className="mt-3 font-serif text-3xl">{c.value}</div><div className="text-xs text-muted-foreground">{c.sub}</div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border bg-card p-6 shadow-elegant lg:col-span-3">
          <div className="flex items-center justify-between"><h3 className="font-serif text-xl">Recent Transactions</h3><button className="text-xs text-primary hover:underline">View all</button></div>
          <ul className="mt-4 divide-y">
            {transactions.map(t => <li key={t.id} className="flex items-center justify-between py-3"><div><div className="text-sm font-medium">{t.user_name}</div><div className="text-xs text-muted-foreground">{t.item_name} · {new Date(t.created_at).toLocaleDateString()}</div></div><div className="text-right"><div className="font-serif text-lg">${t.amount}</div><div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">{t.type}</div></div></li>)}
            {!transactions.length && <li className="py-8 text-center text-muted-foreground">No transactions found</li>}
          </ul>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between"><h3 className="font-serif text-xl">Pending Payouts</h3><button onClick={handleProcessAllPayouts} className="rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-3 py-1 text-xs font-semibold text-white">Process All</button></div>
          <ul className="mt-4 space-y-3">
            {payouts.map(p => <li key={p.teacher_id} className="rounded-2xl border bg-background p-4"><div className="flex items-center justify-between"><div><div className="text-sm font-medium">{p.teacher_name}</div><div className="text-xs text-muted-foreground">{p.commission_rate}% commission</div></div><div className="font-serif text-lg text-primary">${p.pending_amount.toLocaleString()}</div></div></li>)}
            {!payouts.length && <li className="py-8 text-center text-muted-foreground">No pending payouts</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── AI Configuration ───────────────────────── */
function AIConfiguration() {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    systemPrompt: "You are Nūr, a refined and knowledgeable assistant...",
    model: "gpt-5.2",
    temperature: 0.7,
    maxTokens: 2048,
    rtlResponses: true,
    citeSources: true,
  });

  useEffect(() => { fetchConfig(); }, []);
  async function fetchConfig() {
    const { data } = await supabase.from('ai_config').select('*').single();
    if (data) setConfig({ systemPrompt: data.system_prompt, model: data.model, temperature: data.temperature, maxTokens: data.max_tokens, rtlResponses: data.rtl_responses, citeSources: data.cite_sources });
  }
  async function handleSave() {
    setIsSaving(true);
    const { error } = await supabase.from('ai_config').upsert({ system_prompt: config.systemPrompt, model: config.model, temperature: config.temperature, max_tokens: config.maxTokens, rtl_responses: config.rtlResponses, cite_sources: config.citeSources, updated_at: new Date().toISOString() });
    if (!error) alert("Saved!"); else alert("Error");
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-700"><Sparkles className="h-5 w-5 text-white" /></div><div><div className="text-xs font-semibold uppercase tracking-widest text-amber-600">Nūr Assistant</div><h2 className="font-serif text-2xl">AI Configuration</h2></div></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Prompt</label><textarea rows={8} value={config.systemPrompt} onChange={(e) => setConfig({...config, systemPrompt: e.target.value})} className="w-full rounded-2xl border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <div className="space-y-4">
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</label><select value={config.model} onChange={(e) => setConfig({...config, model: e.target.value})} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm"><option>gpt-5.2 (Recommended)</option><option>gpt-5.2-mini</option><option>claude-sonnet-4.5</option></select></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temperature</label><input type="number" value={config.temperature} onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})} step={0.1} min={0} max={2} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm" /></div><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max tokens</label><input type="number" value={config.maxTokens} onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})} step={128} className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm" /></div></div>
            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center justify-between"><div className="text-sm font-medium">RTL Arabic responses</div><button onClick={() => setConfig({...config, rtlResponses: !config.rtlResponses})} className={cn("h-6 w-11 rounded-full p-0.5 transition-colors", config.rtlResponses ? "bg-emerald-600" : "bg-gray-300")}><div className={cn("h-5 w-5 rounded-full bg-white transition-transform", config.rtlResponses && "translate-x-5")} /></button></div>
              <div className="mt-3 flex items-center justify-between"><div className="text-sm font-medium">Cite source materials</div><button onClick={() => setConfig({...config, citeSources: !config.citeSources})} className={cn("h-6 w-11 rounded-full p-0.5 transition-colors", config.citeSources ? "bg-emerald-600" : "bg-gray-300")}><div className={cn("h-5 w-5 rounded-full bg-white transition-transform", config.citeSources && "translate-x-5")} /></button></div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center justify-between"><div><h3 className="font-serif text-xl">Knowledge Base</h3><p className="text-sm text-muted-foreground">Documents Nūr can reference when answering</p></div><button className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm hover:bg-accent"><Settings2 className="h-4 w-4" /> Manage</button></div>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {[{name:"Academy Curriculum Guide.pdf",size:"2.4 MB",indexed:true},{name:"Pricing & Subscriptions.md",size:"18 KB",indexed:true},{name:"Teacher Handbook 2026.pdf",size:"5.1 MB",indexed:true},{name:"FAQ — Common Questions.md",size:"32 KB",indexed:false}].map(doc => <li key={doc.name} className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3"><div className="flex items-center gap-3"><FileText className="h-4 w-4 text-amber-500" /><div><div className="text-sm font-medium">{doc.name}</div><div className="text-xs text-muted-foreground">{doc.size}</div></div></div><span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-medium", doc.indexed ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>{doc.indexed ? "Indexed" : "Pending"}</span></li>)}
        </ul>
      </div>
      <div className="flex justify-end gap-2"><button className="rounded-full border bg-background px-5 py-2.5 text-sm hover:bg-accent">Discard</button><button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSaving ? "Saving..." : "Save Configuration"}</button></div>
    </div>
  );
}