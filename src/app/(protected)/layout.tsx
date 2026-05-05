// src/app/(protected)/layout.tsx

import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="h-full relative">
      <Sidebar role={session?.user?.role} />
      <main className="md:pl-[280px] h-full">
        {children}
      </main>
    </div>
  );
}