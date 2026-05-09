"use client";

import { CourseGrid } from "@/components/student/CourseGrid";
import { SpecialBundles } from "@/components/student/BundleOffers";
// في Next.js، الـ Metadata تُفضل أن تكون في ملف layout أو تصدر من ملف page (بدون use client)
// ولكن بما أننا نستخدم "use client"، سنركز على المكون وتصميم الصفحة.

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-8 bg-background min-h-screen">
      <header className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold ornament">
          The Marketplace
        </div>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl text-foreground">
          Curated paths to fluency
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
          Recorded courses, live cohorts, and exclusive bundles — designed by the Academy.
        </p>
      </header>

      {/* قسم العروض الخاصة */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="mb-6 font-serif text-3xl text-foreground">Special Bundles</h2>
        <SpecialBundles />
      </section>

      {/* قسم جميع الكورسات */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="mb-6 font-serif text-3xl text-foreground">All Courses</h2>
        <CourseGrid />
      </section>
    </div>
  );
}