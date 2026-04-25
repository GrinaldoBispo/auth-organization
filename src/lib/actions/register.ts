// src/lib/actions/register.ts

"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export async function registerUser(values: any) {
  const { email, password } = values;
  const hashedPassword = await hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: "Erro ao criar usuário." };
  }
}