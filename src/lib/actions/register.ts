// src/lib/actions/register.ts

"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function registerUser(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" };
  }

  const { email, password } = validatedFields.data;
  const hashedPassword = await hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este e-mail já está sendo usado." };
    }

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { success: "Usuário criado com sucesso!" };
  } catch (e) {
    return { error: "Ocorreu um erro ao criar a conta." };
  }
}