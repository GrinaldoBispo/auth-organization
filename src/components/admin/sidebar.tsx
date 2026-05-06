// src/components/admin/sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  CreditCard, 
  CalendarClock, 
  User,
  ShieldCheck,
  Mail,
  LogOut,
  Users,       // Ícone para Clientes
  UsersRound,  // Ícone para Equipe/Staff
  Server,      // Remova qualquer outra menção a "Server" abaixo desta
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const userRoutes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Agenda", icon: CalendarClock, href: "/appointments" }, // Ajustado para o motor de agenda
    { label: "Clientes", icon: Users, href: "/customers" },           // NOVO LINK
    { label: "Financeiro", icon: Receipt, href: "/transactions" },
    { label: "Perfil", icon: User, href: "/settings" },
  ];

  return (
    <div className="hidden md:flex h-full w-[280px] flex-col fixed inset-y-0 z-50 bg-white border-r border-zinc-200">
      <div className="flex flex-col h-full p-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="font-black text-zinc-900 tracking-tighter uppercase text-lg">
            Finance<span className="text-blue-600">App</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 px-4">
            Menu Principal
          </p>
          <nav className="space-y-1">
            {userRoutes.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-zinc-950 text-white shadow-lg shadow-zinc-200" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <route.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-500" : "text-zinc-400 group-hover:text-zinc-600"
                  )} />
                  <span className="text-sm font-bold tracking-tight">{route.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* SEÇÃO SUPER ADMIN (Gestão Global do SaaS) */}
          {role === "SUPERADMIN" && (
            <div className="mt-8 pt-8 border-t border-zinc-100">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-4 px-4">
                Master Control
              </p>
              <nav className="space-y-1">
                <Link
                  href="/super-admin/organizations"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    pathname === "/super-admin/organizations" ? "bg-purple-50 text-purple-600" : "text-zinc-500 hover:bg-purple-50 hover:text-purple-600"
                  )}
                >
                  <Server className="h-5 w-5" />
                  <span className="text-sm font-bold tracking-tight">Todas as Empresas</span>
                </Link>
              </nav>
            </div>
          )}

          {/* SEÇÃO ADMIN (Aparece para ADMIN e SUPER_ADMIN) */}
          {(role === "ADMIN" || role === "SUPERADMIN") && (
			<div className="mt-8 pt-8 border-t border-zinc-100">
			  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 px-4">
				Administração
			  </p>
			  <nav className="space-y-1">
				{/* Link de Equipe: Essencial para o motor de agendas */}
				<Link
				  href="/staff"
				  className={cn(
					"flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
					pathname === "/staff" ? "bg-red-50 text-red-600" : "text-zinc-500 hover:bg-red-50 hover:text-red-600"
				  )}
				>
				  <UsersRound className="h-5 w-5" />
				  <span className="text-sm font-bold tracking-tight">Minha Equipe</span>
				</Link>

				<Link
				  href="/admin"
				  className={cn(
					"flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
					pathname === "/admin" ? "bg-red-50 text-red-600" : "text-zinc-500 hover:bg-red-50 hover:text-red-600"
				  )}
				>
				  <ShieldCheck className="h-5 w-5" />
				  <span className="text-sm font-bold tracking-tight">Visão Geral</span>
				</Link>
			  </nav>
			</div>
		  )}
        </div>

        {/* Rodapé - Logout */}
        <div className="pt-4 border-t border-zinc-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-red-500" />
            <span className="text-sm font-bold tracking-tight">Sair da conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}