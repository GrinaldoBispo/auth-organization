// src/components/staff/staff-schedule-modal.tsx

"use client";

import { useState, useTransition } from "react";
import { updateStaffScheduleAction } from "@/lib/actions/staff";
import { toast } from "sonner";
import { Clock, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const DAYS_OF_WEEK = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

interface StaffScheduleModalProps {
  staffId: string;
  staffName: string;
  initialSchedules?: any[]; // Você pode tipar melhor depois
}

export function StaffScheduleModal({ staffId, staffName, initialSchedules }: StaffScheduleModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Inicializa o estado com os 7 dias
  const [schedules, setSchedules] = useState(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const existing = initialSchedules?.find(s => s.dayOfWeek === i);
      return {
        dayOfWeek: i,
        startTime: existing?.startTime || "08:00",
        endTime: existing?.endTime || "18:00",
        isWorking: existing ? existing.isWorking : i !== 0 && i !== 6, // Padrão: seg a sex
      };
    });
  });

  const handleToggle = (day: number) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === day ? { ...s, isWorking: !s.isWorking } : s));
  };

  const handleChange = (day: number, field: "startTime" | "endTime", value: string) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s));
  };

  const onSave = () => {
    startTransition(async () => {
      const result = await updateStaffScheduleAction(staffId, schedules);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-zinc-200 text-zinc-600 hover:text-blue-600">
          <Clock className="h-4 w-4" /> Horários
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Jornada de Trabalho: {staffName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {schedules.map((s) => (
            <div key={s.dayOfWeek} className="flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3 w-32">
                <Checkbox 
                  checked={s.isWorking} 
                  onCheckedChange={() => handleToggle(s.dayOfWeek)} 
                  disabled={isPending}
                />
                <span className={cn("text-sm font-bold", !s.isWorking && "text-zinc-400")}>
                  {DAYS_OF_WEEK[s.dayOfWeek]}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <Input 
                  type="time" 
                  value={s.startTime} 
                  onChange={(e) => handleChange(s.dayOfWeek, "startTime", e.target.value)}
                  disabled={!s.isWorking || isPending}
                  className="h-8"
                />
                <span className="text-zinc-400">às</span>
                <Input 
                  type="time" 
                  value={s.endTime} 
                  onChange={(e) => handleChange(s.dayOfWeek, "endTime", e.target.value)}
                  disabled={!s.isWorking || isPending}
                  className="h-8"
                />
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={onSave} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Agenda</>}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Função auxiliar cn (se você não tiver importado)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}