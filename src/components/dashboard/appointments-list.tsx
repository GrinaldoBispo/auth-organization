// src/components/dashboard/appointments-list.tsx

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Phone } from "lucide-react";

interface AppointmentsListProps {
  appointments: any[];
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
        <p className="text-sm italic">Nenhum agendamento para hoje.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((app) => (
        <div 
          key={app.id} 
          className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Hora */}
            <div className="flex flex-col items-center justify-center bg-white h-12 w-12 rounded-xl shadow-sm border border-zinc-100">
              <span className="text-xs font-bold text-[#43b5a1]">
                {format(new Date(app.date), "HH:mm")}
              </span>
            </div>

            {/* Dados do Cliente */}
            <div>
              <p className="font-bold text-zinc-700">{app.customer.name}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                <Phone className="h-3 w-3" />
                <span>{app.customer.phone}</span>
                {app.provider?.name && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-[#43b5a1] font-medium">Profissional: {app.provider.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status ou Notas rápidas */}
          <div className="hidden sm:block text-right">
             <span className="text-[10px] uppercase tracking-widest font-black text-zinc-300">
                {app.status}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
}