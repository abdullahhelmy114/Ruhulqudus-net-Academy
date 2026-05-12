"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherProfile } from "@/components/profile/TeacherProfile";
import { Loader2 } from "lucide-react";

export default function TeacherProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return null;

  return <TeacherProfile />;
}