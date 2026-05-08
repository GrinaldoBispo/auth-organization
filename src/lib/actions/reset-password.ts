// src/lib/actions/reset-password.ts

"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";

export const resetPasswordAction = async (values: any, token: string | null) => {
  if (!token) return { error: "Token ausente!" };

  // 1. Valida os campos (Zod)
  const validatedFields = resetPasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Campos inválidos!" };

  const { password } = validatedFields.data;

  // 2. Busca o token no banco
  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  });

  if (!existingToken) return { error: "Token inválido!" };

  // 3. Verifica se expirou
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "O token expirou!" };

  // 4. Busca o usuário dono do e-mail
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) return { error: "E-mail não existe!" };

  // 5. Criptografa a nova senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // 6. Atualiza o usuário e remove o token em uma transação
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      }),
    ]);

    return { success: "Senha atualizada com sucesso!" };
  } catch (error) {
    return { error: "Erro ao atualizar senha." };
  }
};