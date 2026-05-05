// src/lib/actions/organization.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Ajustado para seu caminho correto
import { onboardingSchema } from "@/lib/validations/organization";
import { revalidatePath } from "next/cache";

export async function createOrganizationAction(values: any) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const validatedFields = onboardingSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { name, type, phone } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cria a organização genérica
      const organization = await tx.organization.create({
        data: {
          name,
          type,
          phone,
          slug: name.toLowerCase().trim().replace(/\s+/g, '-'),
        }
      });

      // 2. Vincula o usuário como ADMIN da unidade
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          orgId: organization.id,
          role: "ADMIN",
        }
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro no onboarding:", error);
    return { error: "Ocorreu um erro ao criar a unidade." };
  }
}