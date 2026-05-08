// src/lib/actions/staff.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { staffSchema } from "@/lib/validations/staff";

/**
 * Cria ou Atualiza um membro da equipe (Usuário)
 */
export async function upsertStaffAction(values: unknown) {
  const session = await auth();
  const adminOrgId = session?.user?.orgId;

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
      update: { name, email, username, role },
      create: {
        name,
        email,
        username,
        role,
        password: defaultPassword,
        orgId: adminOrgId,
      },
    });

    revalidatePath("/staff");
    return { success: id ? "Funcionário atualizado!" : "Funcionário cadastrado! Senha padrão: 123456" };
  } catch (error) {
    return { error: "E-mail ou Username já estão em uso." };
  }
}

/**
 * Atualiza os horários do funcionário usando o NOVO MODELO (Groups + Intervals)
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
    // 1. Buscamos se o funcionário já tem um grupo de agenda principal
    const existingGroup = await prisma.staffScheduleGroup.findFirst({
      where: { userId: staffId, orgId }
    });

    if (existingGroup) {
      // 2. Atualiza o grupo existente e seus intervalos
      await prisma.$transaction([
        // Limpa intervalos antigos para evitar duplicidade
        prisma.staffScheduleInterval.deleteMany({ where: { groupId: existingGroup.id } }),
        // Atualiza os dados básicos do grupo
        prisma.staffScheduleGroup.update({
          where: { id: existingGroup.id },
          data: {
            name: data.name,
            slotDuration: data.slotDuration,
            intervals: {
              create: data.intervals // Cria os novos intervalos vindos do formulário
            }
          }
        })
      ]);
    } else {
      // 3. Se não existe, cria o primeiro grupo de agenda do funcionário
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
    return { success: "Agenda da equipe atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao salvar agenda da equipe:", error);
    return { error: "Erro ao salvar horários." };
  }
}