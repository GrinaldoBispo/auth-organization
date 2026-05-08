// src/lib/actions/schedule.ts

"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { scheduleGroupSchema } from "@/lib/validations/schedule";

export async function upsertScheduleGroupAction(values: unknown) {
  const session = await auth();
  const orgId = session?.user?.orgId;

  if (!orgId || session?.user?.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  // 1. Validar campos
  const validatedFields = scheduleGroupSchema.safeParse(values);
  
  if (!validatedFields.success) {
    console.log("ERRO ZOD:", validatedFields.error.flatten());
    return { error: "Dados inválidos. Verifique os campos." };
  }

  const { id, name, userId, startDate, endDate, slotDuration, intervals } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 2. Se for edição, apaga intervalos antigos
      if (id) {
        await tx.staffScheduleInterval.deleteMany({
          where: { groupId: id }
        });
      }

      // 3. Upsert do Grupo
      await tx.staffScheduleGroup.upsert({
        where: { id: id || "new-group" },
        update: {
          name,
          userId,
          startDate: new Date(startDate), // Conversão explícita
          endDate: endDate ? new Date(endDate) : null,
          slotDuration: Number(slotDuration),
          intervals: {
            create: intervals.map(i => ({
                startTime: i.startTime,
                endTime: i.endTime,
                monday: i.monday,
                tuesday: i.tuesday,
                wednesday: i.wednesday,
                thursday: i.thursday,
                friday: i.friday,
                saturday: i.saturday,
                sunday: i.sunday,
            }))
          }
        },
        create: {
          name,
          userId,
          orgId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          slotDuration: Number(slotDuration),
          intervals: {
            create: intervals
          }
        }
      });
    });

    revalidatePath("/staff");
    revalidatePath("/appointments");
    return { success: "Agenda gravada com sucesso!" };
  } catch (error) {
    console.error("ERRO AO GRAVAR:", error);
    return { error: "Erro interno ao salvar no banco." };
  }
}