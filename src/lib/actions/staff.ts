// src/lib/actions/staff.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { staffSchema } from "@/lib/validations/staff";

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
        orgId: adminOrgId, // O funcionário herda a empresa do Admin
      },
    });

    revalidatePath("/staff");
    return { success: id ? "Funcionário atualizado!" : "Funcionário cadastrado! Senha padrão: 123456" };
  } catch (error) {
    return { error: "E-mail ou Username já estão em uso." };
  }
}

export async function updateStaffScheduleAction(
  staffId: string, 
  schedules: { dayOfWeek: number, startTime: string, endTime: string, isWorking: boolean }[]
) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId || session?.user?.role !== "ADMIN") {
    return { error: "Não autorizado." };
  }

  try {
    // Usamos um loop de upserts dentro de uma transação para garantir que ou salva tudo ou nada
    await prisma.$transaction(
      schedules.map((schedule) =>
        (prisma as any).staffSchedule.upsert({
          where: {
            userId_dayOfWeek: {
              userId: staffId,
              dayOfWeek: schedule.dayOfWeek,
            },
          },
          update: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isWorking: schedule.isWorking,
          },
          create: {
            userId: staffId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isWorking: schedule.isWorking,
            orgId: orgId,
          },
        })
      )
    );

    revalidatePath("/staff");
    return { success: "Horários atualizados com sucesso!" };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar horários." };
  }
}