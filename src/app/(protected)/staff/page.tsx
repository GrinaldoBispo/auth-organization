// src/app/(protected)/staff/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShieldCheck, UserCog, Mail, UserCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StaffModal } from "@/components/staff/staff-modal";
import { StaffScheduleModal } from "@/components/staff/staff-schedule-modal";

export default async function StaffPage() {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) redirect("/onboarding");

  // Busca todos os usuários da mesma organização
  const staff = await prisma.user.findMany({
    where: { orgId },
	include: { scheduleGroups: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header Centralizado ou Alinhado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
            Minha Equipe
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Gerencie quem pode realizar os atendimentos na sua unidade.
          </p>
        </div>
        <StaffModal />
      </div>

      <Separator />

      {/* Grid de Cards - Aqui resolvemos o problema de ficar "esticado" */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((member) => (
          <div 
            key={member.id} 
            className="group relative p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center"
          >
            {/* Badge de Role no topo do card */}
            <div className="absolute top-4 right-4">
               {member.role === "ADMIN" ? (
                 <div className="bg-red-50 p-1.5 rounded-full" title="Administrador">
                   <ShieldCheck className="h-4 w-4 text-red-500" />
                 </div>
               ) : (
                 <div className="bg-blue-50 p-1.5 rounded-full" title="Staff">
                   <UserCog className="h-4 w-4 text-blue-500" />
                 </div>
               )}
            </div>

            {/* Avatar */}
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-2xl font-black text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-4">
              {member.name?.charAt(0).toUpperCase()}
            </div>

            {/* Informações */}
            <div className="space-y-1 mb-6">
              <h3 className="font-bold text-zinc-900 text-lg line-clamp-1">
                {member.name}
              </h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {member.role === "ADMIN" ? "Administrador" : "Staff / Prestador"}
              </p>
            </div>

            {/* Detalhes de contato/login */}
            <div className="w-full pt-4 border-t border-zinc-50 space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Mail className="h-3 w-3" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <UserCircle className="h-3 w-3" />
                <span>@{member.username}</span>
              </div>
            </div>
			
            {/* Ações do Card centralizadas e sem duplicidade */}
            <div className="mt-auto w-full flex items-center justify-center gap-2">
               <StaffModal staff={member} />
               <StaffScheduleModal 
                  staffId={member.id} 
                  staffName={member.name || ""} 
                  initialSchedules={member.scheduleGroups} 
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}