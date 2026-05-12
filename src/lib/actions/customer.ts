// src/lib/actions/customer.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/validations/customer";

/**
 * UPSERT: Cria ou atualiza preservando a unicidade do Telefone
 */
export async function upsertCustomerAction(values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) return { error: "Sessão ou Organização não encontrada." };

  const validatedFields = customerSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { id, name, phone, email } = validatedFields.data;
  const cleanPhone = phone.replace(/\D/g, "");

  try {
    return await prisma.$transaction(async (tx) => {
      // Verifica se o telefone já existe para OUTRO ID
      const existingWithPhone = await tx.customer.findFirst({
        where: { 
          phone: cleanPhone, 
          orgId,
          ...(id && { NOT: { id } }) 
        }
      });

      if (existingWithPhone) {
        return { 
          error: `O número ${phone} já pertence ao cliente "${existingWithPhone.name}".` 
        };
      }

      if (id) {
        await tx.customer.update({
          where: { id, orgId },
          data: { name, phone: cleanPhone, email: email || null, active: true }
        });
      } else {
        await tx.customer.create({
          data: { name, phone: cleanPhone, email: email || null, orgId, active: true }
        });
      }

      revalidatePath("/customers");
      revalidatePath("/appointments");
      return { success: id ? "Cadastro atualizado!" : "Cliente cadastrado com sucesso!" };
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao processar cliente no banco." };
  }
}

/**
 * BUSCA: Filtra apenas clientes ativos
 */
export async function searchCustomersAction(query: string) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId) return [];

  return await prisma.customer.findMany({
    where: {
      orgId,
      active: true, // Garante que não sugerimos clientes deletados/anonimizados
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query.replace(/\D/g, "") } }
      ]
    },
    take: 5,
    orderBy: { name: 'asc' },
  });
}

/**
 * GET BY PHONE: Utilizado no preenchimento automático do Modal
 */
export async function getCustomerByPhoneAction(phone: string) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId || !phone) return null;

  const cleanPhone = phone.replace(/\D/g, "");

  return await prisma.customer.findFirst({
    where: { 
      phone: cleanPhone,
      orgId,
      active: true 
    },
    select: { id: true, name: true, email: true }
  });
}

/**
 * SOFT DELETE: Inativa o cliente (Uso do Usuário)
 */
export async function deleteCustomerAction(id: string) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId) return { error: "Não autorizado" };

  try {
    await prisma.customer.update({
      where: { id, orgId },
      data: { active: false } 
    });

    revalidatePath("/customers");
    return { success: "Cliente inativado com sucesso!" };
  } catch (error) {
    return { error: "Erro ao inativar cliente." };
  }
}

/**
 * ANONIMIZAÇÃO: Apaga dados sensíveis (Uso do Admin - LGPD)
 */
export async function anonymizeCustomerAction(id: string) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN"; 
  const orgId = session?.user?.orgId;

  if (!isAdmin || !orgId) return { error: "Apenas administradores podem realizar esta ação." };

  try {
    await prisma.customer.update({
      where: { id, orgId },
      data: {
        name: "USUÁRIO ANONIMIZADO (LGPD)",
        phone: "00000000000",
        email: `anonimo_${id}@sistema.com.br`,
        active: false,
		anonymizedAt: new Date(),
      }
    });

    revalidatePath("/customers");
    revalidatePath("/appointments");
    return { success: "Dados anonimizados permanentemente." };
  } catch (error) {
    return { error: "Erro ao processar anonimização." };
  }
}