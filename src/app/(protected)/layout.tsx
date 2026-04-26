//src/app/(protected)/layout.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");

  // Simulação de verificação de admin (ajuste conforme seu schema)
  const isAdmin = session.user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Simples */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 font-bold text-blue-600 text-xl border-b">
          Gestor Fin.
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/painel" className="block px-4 py-2 text-sm hover:bg-zinc-100 rounded-md">
            Painel Geral
          </Link>
          
          {/* Só mostra o link de E-mail se for Admin */}
          {isAdmin && (
            <Link href="/email" className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-md">
              Configurações de E-mail
            </Link>
          )}

          <Link href="/perfil" className="block px-4 py-2 text-sm hover:bg-zinc-100 rounded-md">
            Meu Perfil
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}