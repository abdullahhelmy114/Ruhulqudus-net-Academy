"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Globe2, Languages, Phone, MessageCircle, Mail, Loader2 } from "lucide-react";
import { AvatarCard } from "./AvatarCard";
import { Section } from "./Section";
import { Field, Input, Select } from "./Field";
import { MultiInput } from "./MultiInput";
import { SaveButton } from "./SaveButton";
import { createClient } from "@/lib/supabase/client";

type State = {
  fullName: string; email: string; avatar: string | null;
  gender: string; nationality: string; age: string;
  nativeLanguage: string; otherLanguages: string[]; residence: string;
  whatsapp: string; telegram: string; facebook: string; instagram: string;
};

export function StudentProfile() {
  const supabase = createClient();
  const [s, setS] = React.useState<State | null>(null);
  const [errors, setErrors] = React.useState<Partial<Record<keyof State, string>>>({});
  const [save, setSave] = React.useState<"idle" | "loading" | "success">("idle");

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setS({
        fullName: data?.full_name || user.email || "",
        email: user.email || "",
        avatar: data?.avatar_url || null,
        gender: data?.gender || "",
        nationality: data?.nationality || "",
        age: data?.age || "",
        nativeLanguage: data?.native_language || "",
        otherLanguages: data?.other_languages || [],
        residence: data?.residence || "",
        whatsapp: data?.whatsapp || "",
        telegram: data?.telegram || "",
        facebook: data?.facebook || "",
        instagram: data?.instagram || "",
      });
    })();
  }, [supabase]);

  const set = React.useCallback(<K extends keyof State>(k: K, v: State[K]) => {
    setS((p) => p ? { ...p, [k]: v } : null);
  }, []);

  const completion = React.useMemo(() => {
    if (!s) return 0;
    const checks = [s.avatar, s.gender, s.nationality, s.age, s.nativeLanguage, s.residence, s.whatsapp || s.telegram];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [s]);

  const submit = React.useCallback(async () => {
    const e: typeof errors = {};
    if (!s?.nativeLanguage.trim()) e.nativeLanguage = "Required field";
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Please complete required fields"); return; }
    setSave("loading");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !s) return;
    await supabase.from("profiles").update({
      gender: s.gender,
      nationality: s.nationality,
      age: s.age,
      native_language: s.nativeLanguage,
      other_languages: s.otherLanguages,
      residence: s.residence,
      whatsapp: s.whatsapp,
      telegram: s.telegram,
      facebook: s.facebook,
      instagram: s.instagram,
      avatar_url: s.avatar,
    }).eq("id", user.id);
    setSave("success");
    toast.success("Profile saved");
    setTimeout(() => setSave("idle"), 1500);
  }, [supabase, s]);

  // تم نقل هذا الفحص إلى ما بعد كل الخطافات
  if (!s) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <AvatarCard
        name={s.fullName} email={s.email} role="Student" completion={completion}
        avatar={s.avatar} onAvatar={(u) => set("avatar", u)}
        stats={[{ label: "Languages", value: String(1 + s.otherLanguages.length) }, { label: "Level", value: "B1" }]}
      />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Profile</p>
          <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Begin your <span className="gold-text">journey</span>
          </h1>
          <p dir="rtl" className="font-arabic text-sm text-muted-foreground">أهلاً بك في أكاديمية روح القدس</p>
        </header>

        <Section step={1} title="Personal" arabic="المعلومات الشخصية" icon={<User size={20} />}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Gender" arabic="الجنس">
              <Select value={s.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select…</option>
                <option value="male">Male / ذكر</option>
                <option value="female">Female / أنثى</option>
              </Select>
            </Field>
            <Field label="Age" arabic="العمر">
              <Input type="number" min={5} max={99} value={s.age} onChange={(e) => set("age", e.target.value)} />
            </Field>
            <Field label="Nationality" arabic="الجنسية" icon={<Globe2 size={14} />}>
              <Input value={s.nationality} onChange={(e) => set("nationality", e.target.value)} />
            </Field>
            <Field label="Country of Residence" arabic="بلد الإقامة">
              <Input value={s.residence} onChange={(e) => set("residence", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section step={2} title="Languages" arabic="اللغات" icon={<Languages size={20} />}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Native Language" arabic="اللغة الأم" required error={errors.nativeLanguage}>
              <Input value={s.nativeLanguage} onChange={(e) => set("nativeLanguage", e.target.value)} />
            </Field>
            <Field label="Other Languages" arabic="لغات أخرى">
              <MultiInput values={s.otherLanguages} onChange={(v) => set("otherLanguages", v)} placeholder="Add a language" />
            </Field>
          </div>
        </Section>

        <Section step={3} title="Contact" arabic="وسائل التواصل" icon={<Phone size={20} />} defaultOpen={false}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Email" arabic="البريد" icon={<Mail size={14} />}>
              <Input value={s.email} disabled />
            </Field>
            <Field label="WhatsApp" arabic="واتساب" icon={<Phone size={14} />}>
              <Input dir="ltr" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </Field>
            <Field label="Telegram" arabic="تيليجرام" icon={<MessageCircle size={14} />}>
              <Input value={s.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="@username" />
            </Field>
            <Field label="Facebook" arabic="فيسبوك">
              <Input value={s.facebook} onChange={(e) => set("facebook", e.target.value)} />
            </Field>
            <Field label="Instagram" arabic="إنستغرام">
              <Input value={s.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@handle" />
            </Field>
          </div>
        </Section>

        <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Profile completion: <span className="font-semibold text-emerald dark:text-gold">{completion}%</span>
          </p>
          <SaveButton onClick={submit} state={save} />
        </div>
      </motion.div>
    </div>
  );
}