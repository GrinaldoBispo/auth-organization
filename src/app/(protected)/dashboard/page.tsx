// src/app/(protected)/dashboard/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) redirect("/onboarding");

  // Buscamos os agendamentos de HOJE
  const appointments = await prisma.appointment.findMany({
    where: {
      orgId,
      date: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date()),
      },
      status: { not: "CANCELLED" },
    },
    include: {
      customer: true,
      provider: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Cálculo simples para os cards
  const totalToday = appointments.length;

  return (
    <div className="p-8 h-screen flex flex-col space-y-8">
      {/* Cabeçalho Padronizado */}
      <PageHeader 
        title="Painel de Controle" 
        subtitle="Confira o desempenho e os atendimentos para o dia de hoje."
        icon={<LayoutDashboard className="h-6 w-6" />}
      >
        {/* Espaço para botões de ação rápida se desejar no futuro */}
        <div className="text-[10px] font-black uppercase tracking-widest text-[#43b5a1] bg-[#43b5a1]/10 px-3 py-1 rounded-full">
          Unidade Ativa
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {/* Grid de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Atendimentos Hoje" 
            value={totalToday} 
            icon={<TrendingUp className="h-4 w-4 text-[#43b5a1]" />}
            description="Total agendado para hoje"
          />
          <StatCard 
            title="Clientes Ativos" 
            value="--" // Você pode somar o total de clientes depois
            icon={<Users className="h-4 w-4 text-blue-500" />}
            description="Base total da organização"
          />
        </div>

        {/* Lista de Próximos Horários */}
        <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-700">
              Próximos Horários
            </h2>
            <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-3 py-1 rounded-lg uppercase">
              Tempo Real
            </span>
          </div>
          
          <AppointmentsList appointments={appointments} />
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Card de Estatística (pode mover para outro arquivo depois)
function StatCard({ title, value, icon, description }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-zinc-50 rounded-2xl">
          {icon}
        </div>
        <span className="text-2xl font-black text-zinc-800">{value}</span>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
        <p className="text-[11px] text-zinc-400 mt-1 italic">{description}</p>
      </div>
    </div>
  );
}