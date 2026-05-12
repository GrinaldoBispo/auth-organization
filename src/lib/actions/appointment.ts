// src/lib/actions/appointment.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { appointmentSchema } from "@/lib/validations/appointment";

export async function createAppointmentAction(values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId) return { error: "Não autorizado." };

  const validatedFields = appointmentSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  // clientPhone já chega aqui apenas com números graças ao transform do Zod
  const { clientName, clientPhone, clientEmail, date, notes, providerId, scheduleGroupId } = validatedFields.data;

  try {
    return await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { phone: clientPhone, orgId }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: { name: clientName, phone: clientPhone, email: clientEmail || null, orgId }
        });
      }

      const conflict = await tx.appointment.findFirst({
        where: { scheduleGroupId, date, status: { not: "CANCELLED" } }
      });
      if (conflict) return { error: "Este horário já foi preenchido." };

      await tx.appointment.create({
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
      revalidatePath("/customers");
      return { success: "Agendamento confirmado!" };
    });
  } catch (error) {
    return { error: "Erro ao processar o agendamento." };
  }
}

export async function updateAppointmentAction(id: string, values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId) return { error: "Não autorizado." };

  const validatedFields = appointmentSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { clientPhone, date, notes, scheduleGroupId } = validatedFields.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const targetCustomer = await tx.customer.findFirst({
        where: { phone: clientPhone, orgId }
      });

      if (!targetCustomer) {
        return { error: "Este número não existe na base. Use um número já cadastrado." };
      }

      const conflict = await tx.appointment.findFirst({
        where: { id: { not: id }, scheduleGroupId, date, status: { not: "CANCELLED" } }
      });
      if (conflict) return { error: "Este horário já está ocupado." };

      await tx.appointment.update({
        where: { id, orgId },
        data: { date, notes, customerId: targetCustomer.id }
      });

      revalidatePath("/appointments");
      revalidatePath("/customers");
      return { success: "Agendamento atualizado!" };
    });
  } catch (error) {
    return { error: "Erro ao atualizar." };
  }
}

export async function cancelAppointmentAction(id: string) {
  const session = await auth();
  const orgId = session?.user?.orgId;
  if (!orgId) return { error: "Não autorizado." };

  try {
    await prisma.appointment.update({
      where: { id, orgId },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/appointments");
    return { success: "Agendamento cancelado!" };
  } catch (error) {
    return { error: "Erro ao cancelar." };
  }
}