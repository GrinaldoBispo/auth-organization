// src/components/appointments/time-slots.tsx

"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeSlotsProps {
  slots: string[];
  selectedSlot?: string;
  onSelect: (slot: string) => void;
  isLoading?: boolean;
}

export function TimeSlots({ slots, selectedSlot, onSelect, isLoading }: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
        <Clock className="h-8 w-8 text-zinc-300 mb-2" />
        <p className="text-sm text-zinc-500 font-medium">Nenhum horário disponível.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot}
          variant="outline"
          onClick={() => onSelect(slot)}
          className={cn(
            "rounded-xl font-bold transition-all h-10 border-zinc-200",
            selectedSlot === slot 
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-95" 
              : "hover:border-blue-300 hover:bg-blue-50 text-zinc-600"
          )}
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}