// src/app/(protected)/customers/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserSearch, Phone, Mail, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CustomerModal } from "@/components/customers/customer-modal";

export default async function CustomersPage() {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) redirect("/onboarding");

  const customers = await prisma.customer.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header Padronizado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
            Clientes
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Gerencie sua base de contatos para agendamentos.
          </p>
        </div>
        <CustomerModal />
      </div>

      <Separator />

      {/* Grid de Cards Padronizado com a Equipe */}
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-zinc-50/50">
          <div className="bg-white p-4 rounded-full shadow-sm border border-zinc-100 mb-4">
            <UserSearch className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-zinc-900 font-bold text-lg">Nenhum cliente encontrado</p>
          <p className="text-zinc-500 text-sm mt-1">Clique em "Novo Cliente" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {customers.map((customer) => (
            <div 
              key={customer.id} 
              className="group relative p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center"
            >
              {/* Badge de Cliente Ativo */}
              <div className="absolute top-4 right-4">
                <div className="bg-emerald-50 p-1.5 rounded-full">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </div>

              {/* Avatar Grande (Igual Staff) */}
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-2xl font-black text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-4">
                {customer.name.charAt(0).toUpperCase()}
              </div>

              {/* Nome e Tag */}
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-zinc-900 text-lg line-clamp-1">
                  {customer.name}
                </h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Cliente Cadastrado
                </p>
              </div>

              {/* Contatos Padronizados */}
              <div className="w-full pt-4 border-t border-zinc-50 space-y-2 mb-4">
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" /> 
                  <span className="font-medium">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" /> 
                    <span className="truncate max-w-[180px]">{customer.email}</span>
                  </div>
                )}
              </div>

              {/* Ação de Edição (Lápis centralizado igual Staff) */}
              <div className="mt-auto w-full">
                <CustomerModal customer={customer} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}