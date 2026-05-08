// src/components/appointments/appointment-client-view.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getStaffAvailabilityAction, getActiveDaysAction } from "@/lib/actions/availability";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Clock, MoreVertical, Calendar as CalendarIcon, Plus, Search, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScheduleGroupModal } from "@/components/staff/schedule-group-modal";
import { AgendaMenu } from "./agenda-menu";

export function AppointmentClientView({ staff }: { staff: any[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const allAgendas = useMemo(() => {
    return staff.flatMap(professional => 
      (professional.scheduleGroups || []).map((group: any) => ({
        ...group,
        professionalName: professional.name,
        professionalId: professional.id
      }))
    );
  }, [staff]);

  const [selectedAgendaId, setSelectedAgendaId] = useState<string>(allAgendas[0]?.id || "");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentAgenda = allAgendas.find(a => a.id === selectedAgendaId);

  const handleAgendaChange = (id: string) => {
    setSlots([]);
    setActiveDays([]); 
    setSelectedAgendaId(id);
  };

  const handleRefresh = () => {
    setSlots([]); 
    setRefreshKey(prev => prev + 1);
  };
  
  const handleModalClose = (isOpen: boolean) => {
	  if (!isOpen) {
		// Quando o modal fecha, forçamos uma atualização leve 
		// para garantir que o calendário e a timeline estejam sincronizados
		setRefreshKey(prev => prev + 1);
	  }
	};

  // Carrega os dias ativos da agenda selecionada
  useEffect(() => {
    async function loadActiveDays() {
      if (!currentAgenda?.professionalId || !currentAgenda?.id) return;

      try {
        const days = await getActiveDaysAction(currentAgenda.professionalId, currentAgenda.id);
        setActiveDays(days);
      } catch (err) {
        console.error("Erro ao carregar dias ativos");
      }
    }
    loadActiveDays();
  }, [selectedAgendaId, refreshKey, allAgendas]);

  // AJUSTE AQUI: Carrega os slots passando o ID da agenda (groupId)
  useEffect(() => {
    async function loadSlots() {
      if (!currentAgenda?.professionalId || !currentAgenda?.id || !date) return;
      
      setLoading(true);
      try {
        // Agora passamos professionalId, data e o ID da agenda selecionada
        const res = await getStaffAvailabilityAction(
          currentAgenda.professionalId, 
          date, 
          currentAgenda.id
        );
        setSlots(res.slots || []);
      } catch (err) {
        toast.error("Erro ao carregar horários");
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, [selectedAgendaId, date, refreshKey]); // Depende do ID da agenda e da data

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0 border border-zinc-200 rounded-3xl overflow-hidden bg-white shadow-sm font-sans">
      <aside className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/30">
        <div className="p-4 border-b border-zinc-200 bg-white">
          <Calendar
            key={`${selectedAgendaId}-${refreshKey}`} 
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="w-full"
            showOutsideDays={false}
            disabled={(currentDate) => {
              const dayOfWeek = currentDate.getDay();
              if (activeDays.length === 0) return false;
              return !activeDays.includes(dayOfWeek);
            }}
            classNames={{
              day_disabled: "text-zinc-200 opacity-50 cursor-not-allowed bg-transparent",
              day_outside: "invisible",
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest">Agendas</span>
            <div className="flex gap-3 items-center">
              <EyeOff className="h-4 w-4 cursor-pointer hover:text-blue-600 transition-colors" />
              <Search className="h-4 w-4 cursor-pointer hover:text-blue-600 transition-colors" />
              <ScheduleGroupModal staff={staff} variant="icon" onSuccess={handleRefresh} />
            </div>
          </div>

          <div className="space-y-1">
            {allAgendas.map((agenda) => (
              <div
                key={agenda.id}
                onClick={() => handleAgendaChange(agenda.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group border",
                  selectedAgendaId === agenda.id ? "bg-blue-50 border-blue-100 shadow-sm" : "hover:bg-zinc-100 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn("w-2 h-2 rounded-full", selectedAgendaId === agenda.id ? "bg-blue-600" : "bg-zinc-300")} />
                   <div className="flex flex-col">
                      <span className={cn("text-[11px] font-bold uppercase tracking-tight", selectedAgendaId === agenda.id ? "text-blue-700" : "text-zinc-500")}>
                        {agenda.name}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-medium leading-none mt-0.5">
                        {agenda.professionalName}
                      </span>
                   </div>
                </div>
                <AgendaMenu staff={staff} agenda={agenda} onSuccess={handleRefresh} onOpenChange={handleModalClose} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white">
        <header className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <Button className="bg-[#43b5a1] hover:bg-[#369685] text-white font-bold uppercase text-[10px] tracking-widest rounded-md px-6 shadow-sm transition-all active:scale-95">
            Marcar
          </Button>
          <div className="text-center px-4">
             <h2 className="text-xs font-black text-zinc-400 uppercase tracking-tighter truncate max-w-md">
                {date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase() : ""} - {(currentAgenda?.name || "Selecione").toUpperCase()}
             </h2>
          </div>
          <div className="flex gap-4 text-zinc-400 items-center">
            <CalendarIcon className="h-4 w-4 cursor-pointer hover:text-zinc-600" />
            <MoreVertical className="h-4 w-4 cursor-pointer hover:text-zinc-600" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-zinc-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <div key={slot} className="group flex items-center p-4 hover:bg-zinc-50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-[#43b5a1]">
                    <div className="flex items-center gap-6 w-full">
                      <div className="flex items-center gap-3 w-24 shrink-0">
                        <Clock className="h-4 w-4 text-[#43b5a1]" />
                        <span className="text-sm font-black text-zinc-600">{slot}</span>
                      </div>
                      <div className="flex-1 h-8 rounded-lg border border-dashed border-zinc-100 group-hover:border-zinc-200 transition-all flex items-center px-4">
                         <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Disponível</span>
                      </div>
                      <MoreVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-32 text-center px-6">
                  <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-bold uppercase text-[10px] tracking-[0.2em]">Nenhum horário disponível</p>
                  <p className="text-[10px] mt-1 italic">Verifique se o profissional atende neste dia da semana.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}