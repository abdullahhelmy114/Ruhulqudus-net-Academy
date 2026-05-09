"use client";

import { AuthCard } from "@/components/auth/AuthCard";

export default function SignupPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-4 py-12">
      <AuthCard mode="signup" />
    </div>
  );
}