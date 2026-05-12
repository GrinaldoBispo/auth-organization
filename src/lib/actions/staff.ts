"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { staffSchema } from "@/lib/validations/staff";

/**
 * Cria ou Atualiza um membro da equipe (User/Staff)
 */
export async function upsertStaffAction(values: unknown) {
  const session = await auth();
  const adminOrgId = session?.user?.orgId;

  // Proteção: Apenas ADMIN da mesma organização pode gerenciar equipe
  if (!adminOrgId || session?.user?.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  const validatedFields = staffSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const { id, name, email, username, role } = validatedFields.data;

  try {
    const defaultPassword = await hash("123456", 10);

    await prisma.user.upsert({
      where: { id: id || "new-staff" },
      update: { 
        name, 
        email, 
        username, 
        role,
        // Ao atualizar ou criar, garantimos que o usuário está ativo
        active: true 
      },
      create: {
        name,
        email,
        username,
        role,
        password: defaultPassword,
        orgId: adminOrgId,
        active: true,
      },
    });

    revalidatePath("/staff");
    return { success: id ? "Membro da equipe atualizado!" : "Funcionário cadastrado! Senha padrão: 123456" };
  } catch (error) {
    return { error: "E-mail ou Username já estão em uso." };
  }
}

/**
 * Atualiza os horários da equipe (Groups + Intervals)
 */
export async function updateStaffScheduleAction(
  staffId: string, 
  data: { 
    name: string, 
    slotDuration: number, 
    intervals: any[] 
  }
) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId || session?.user?.role !== "ADMIN") {
    return { error: "Não autorizado." };
  }

  try {
    const existingGroup = await prisma.staffScheduleGroup.findFirst({
      where: { userId: staffId, orgId }
    });

    if (existingGroup) {
      await prisma.$transaction([
        prisma.staffScheduleInterval.deleteMany({ where: { groupId: existingGroup.id } }),
        prisma.staffScheduleGroup.update({
          where: { id: existingGroup.id },
          data: {
            name: data.name,
            slotDuration: data.slotDuration,
            intervals: {
              create: data.intervals 
            }
          }
        })
      ]);
    } else {
      await prisma.staffScheduleGroup.create({
        data: {
          name: data.name || "Agenda Padrão",
          userId: staffId,
          orgId: orgId,
          slotDuration: data.slotDuration || 30,
          startDate: new Date(),
          intervals: {
            create: data.intervals
          }
        }
      });
    }

    revalidatePath("/staff");
    return { success: "Agenda da equipe atualizada!" };
  } catch (error) {
    console.error("Erro ao salvar agenda:", error);
    return { error: "Erro ao salvar horários." };
  }
}

/**
 * Ativa/Desativa um membro da equipe (Soft Delete)
 * Usado para bloquear acesso sem perder histórico de agendamentos
 */
export async function toggleStaffActiveAction(id: string, active: boolean) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const orgId = session?.user?.orgId;

  if (!isAdmin || !orgId) return { error: "Não autorizado." };

  try {
    await prisma.user.update({
      where: { id, orgId },
      data: { active }
    });

    revalidatePath("/staff");
    revalidatePath("/settings/staff"); 
    return { success: active ? "Acesso reativado!" : "Acesso desativado com sucesso!" };
  } catch (error) {
    return { error: "Erro ao alterar status do membro da equipe." };
  }
}