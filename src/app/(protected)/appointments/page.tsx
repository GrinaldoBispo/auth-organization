// src/app/(protected)/appointments/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentClientView } from "@/components/appointments/appointment-client-view";

export default async function AppointmentsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) redirect("/onboarding");
  
  const staff = await prisma.user.findMany({
	  where: { orgId },
	  include: { 
		scheduleGroups: {
		  include: { intervals: true } // Importante para o formulário de edição carregar os horários
		} 
	  },
	  orderBy: { name: "asc" },
	});

  return (
    <div className="p-8 h-screen flex flex-col">
      {/* Cabeçalho Padrão Restaurado */}
      <PageHeader 
        title="Agenda de Atendimentos" 
        subtitle="Visualize e gerencie os compromissos da sua unidade."
        icon={<CalendarDays className="h-6 w-6" />}
      >
        <button className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-all">
          <Filter className="h-3 w-3" /> Filtros
        </button>
      </PageHeader>

      <div className="flex-1">
        <AppointmentClientView staff={staff} />
      </div>
    </div>
  );
}