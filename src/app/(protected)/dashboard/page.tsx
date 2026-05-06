// src/app/(protected)/dashboard/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, Users, CheckCircle2, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, orgId: true }
  });

  if (dbUser?.role === "ADMIN" && !dbUser?.orgId) redirect("/onboarding");

  // Busca estatísticas básicas da Org (Motor inicial)
  const [appointmentsCount, customersCount] = await Promise.all([
    prisma.appointment.count({ where: { orgId: dbUser?.orgId as string } }),
    prisma.customer.count({ where: { orgId: dbUser?.orgId as string } }),
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase text-zinc-900">
          Painel <span className="text-blue-600">{dbUser?.role}</span>
        </h1>
        <p className="text-zinc-500 font-medium">Bem-vindo à sua central de agendamentos.</p>
      </div>

      {/* Grid de Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm space-y-2">
           <CalendarDays className="h-5 w-5 text-blue-600" />
           <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Agendamentos</p>
           <h3 className="text-3xl font-black">{appointmentsCount}</h3>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm space-y-2">
           <Users className="h-5 w-5 text-emerald-600" />
           <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Clientes</p>
           <h3 className="text-3xl font-black">{customersCount}</h3>
        </div>
        {/* Adicione mais cards conforme necessário */}
      </div>

      <div className="bg-zinc-50 p-12 rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
        <Clock className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Nenhum agendamento para hoje</h2>
        <p className="text-zinc-500 max-w-xs mx-auto mt-2">
          Comece cadastrando um cliente ou criando um novo horário na agenda.
        </p>
      </div>
    </div>
  );
}