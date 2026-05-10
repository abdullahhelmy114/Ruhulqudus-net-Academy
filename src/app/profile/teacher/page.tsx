"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TeacherProfile } from "@/components/profile/TeacherProfile";

export default function TeacherProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "teacher" || profile?.role === "admin") {
        setLoading(false);
        return;
      }

      // إعادة التوجيه إلى البروفايل المناسب
      if (profile?.role === "student") router.push("/profile/student");
      else router.push("/login");
    })();
  }, [supabase, router]);

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="shimmer h-8 w-48 rounded-full" />
    </div>
  );

  return <TeacherProfile />;
}