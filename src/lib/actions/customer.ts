// src/lib/actions/customer.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/validations/customer";

export async function upsertCustomerAction(values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) return { error: "Sessão ou Organização não encontrada." };

  // Valida os dados com Zod
  const validatedFields = customerSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { id, name, phone, email } = validatedFields.data;

  try {
    await prisma.customer.upsert({
      where: { id: id || "new-id" }, // Se não tem ID, tenta um placeholder que não existe
      update: {
        name,
        phone,
        email: email || null,
      },
      create: {
        name,
        phone,
        email: email || null,
        orgId, // Vincula à empresa do usuário logado
      },
    });

    revalidatePath("/customers");
    return { success: id ? "Cliente atualizado!" : "Cliente criado!" };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao processar cliente no banco." };
  }
}

export async function searchCustomersAction(query: string) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) return [];

  const customers = await prisma.customer.findMany({
    where: {
      orgId,
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 5, // Retorna apenas os 5 primeiros para ser rápido
    orderBy: { name: 'asc' },
  });

  return customers;
}