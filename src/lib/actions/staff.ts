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