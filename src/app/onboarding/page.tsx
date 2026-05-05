// src/app/onboarding/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { Separator } from "@/components/ui/separator";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { orgId: true }
  });

  if (dbUser?.orgId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-[400px] space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo ao Sistema
          </h1>
          <p className="text-sm text-zinc-500">
            Preencha os dados abaixo para configurar sua unidade.
          </p>
        </div>
        
        <Separator />
        
        <OnboardingForm />
      </div>
    </div>
  );
}