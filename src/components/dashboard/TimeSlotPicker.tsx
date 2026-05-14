"use client";

import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 صباحاً - 10 مساءً

interface TimeSlotPickerProps {
  selected: string | null; // "HH:00"
  onChange: (time: string) => void;
  date?: Date | null;
}

export function TimeSlotPicker({ selected, onChange, date }: TimeSlotPickerProps) {
  const now = new Date();
  // التأكد من أن isToday هو boolean صريح (ليس null)
  const isToday = !!(date && date.toDateString() === now.toDateString());

  return (
    <div className="grid grid-cols-3 gap-2">
      {HOURS.map((h) => {
        const value = `${h.toString().padStart(2, "0")}:00`;
        const past = isToday && h <= now.getHours(); // الآن past هو boolean فقط
        return (
          <button
            key={value}
            disabled={past}
            onClick={() => onChange(value)}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-medium border transition-colors",
              past && "text-muted-foreground/30 cursor-not-allowed border-border",
              selected === value && "bg-emerald text-white border-emerald",
              !past && selected !== value && "border-border hover:bg-accent"
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}