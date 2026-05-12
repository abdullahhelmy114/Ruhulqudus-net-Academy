"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { AdminProfile } from "@/components/profile/AdminProfile";

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/login"); return; }

    // السماح فقط للمستخدمين المسجلين (سيتم إضافة فحص الأدمن لاحقاً)
    setReady(true);
  }, [user, isLoading, router]);

  if (!ready) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="shimmer h-8 w-48 rounded-full" />
    </div>
  );

  return <AdminProfile />;
}