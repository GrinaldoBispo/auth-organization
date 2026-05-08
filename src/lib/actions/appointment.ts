// src/lib/actions/appointment.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { appointmentSchema } from "@/lib/validations/appointment";

/**
 * CRIAÇÃO: Localiza/Cria cliente e registra o agendamento
 */
export async function createAppointmentAction(values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId) return { error: "Não autorizado." };

  const validatedFields = appointmentSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { 
    clientName, 
    clientPhone, 
    clientEmail, 
    date, 
    notes, 
    providerId, 
    scheduleGroupId 
  } = validatedFields.data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Verifica se o horário foi ocupado no milissegundo em que o usuário preenchia o form
      const conflict = await tx.appointment.findFirst({
        where: { scheduleGroupId, date, status: { not: "CANCELLED" } }
      });

      if (conflict) return { error: "Este horário acabou de ser ocupado. Por favor, escolha outro." };

      // 2. Busca ou Cria o Cliente (Opção B)
      let customer = await tx.customer.findFirst({
        where: { phone: clientPhone, orgId }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: { name: clientName, phone: clientPhone, email: clientEmail || null, orgId }
        });
      }

      // 3. Cria o Agendamento
      const appointment = await tx.appointment.create({
        data: {
          date,
          notes,
          customerId: customer.id,
          providerId,
          scheduleGroupId,
          orgId,
          status: "SCHEDULED"
        }
      });

      revalidatePath("/appointments");
      return { success: "Agendamento realizado!", id: appointment.id };
    });
  } catch (error) {
    console.error("ERRO CREATE_APPOINTMENT:", error);
    return { error: "Falha ao salvar agendamento." };
  }
}

/**
 * ATUALIZAÇÃO: Valida conflito e altera apenas data/notas
 */
export async function updateAppointmentAction(id: string, values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  
  if (!orgId) return { error: "Não autorizado." };

  const validatedFields = appointmentSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { date, notes, scheduleGroupId } = validatedFields.data;

  try {
    // 1. Validação de conflito (ignora o próprio ID)
    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        scheduleGroupId,
        date,
        status: { not: "CANCELLED" }
      }
    });

    if (conflict) {
      return { error: "O novo horário selecionado já está ocupado por outro agendamento." };
    }

    // 2. Executa o Update
    await prisma.appointment.update({
      where: { id, orgId },
      data: {
        date,
        notes,
        // Mantemos os dados do cliente intactos por segurança
      }
    });

    revalidatePath("/appointments");
    return { success: "Agendamento atualizado com sucesso!" };
  } catch (error) {
    console.error("ERRO UPDATE_APPOINTMENT:", error);
    return { error: "Falha ao atualizar agendamento." };
  }
}