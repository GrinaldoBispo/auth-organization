// src/lib/actions/register.ts

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, RegisterValues } from "@/lib/validations/auth";

export async function registerAction(values: RegisterValues) {
  // 1. Validar os campos no servidor
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dados inválidos!" };
  }

  const { email, password, name, username } = validatedFields.data;

  try {
    // 2. Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Este e-mail já está sendo utilizado." };
    }

    // 3. Verificar se o username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return { error: "Este nome de utilizador já existe." };
    }

    // 4. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Criar o usuário (padrão ROLE: USER)
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: "USER" // Todo registro novo começa como usuário comum
      },
    });

    return { success: "Conta criada com sucesso!" };

  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return { error: "Erro ao criar conta no banco de dados." };
  }
}