// src/lib/actions/forgot-password.ts

"use server";

import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail"; // Importando o novo motor de envio

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "O e-mail é obrigatório." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Por segurança, não confirmamos se o e-mail existe ou não para evitar "pesca" de usuários
    // Mas internamente, só enviamos se o usuário existir
    if (!user) {
      return { success: "Se o e-mail existir, um link de recuperação foi enviado!" };
    }

    // 1. Gera o Token e salva no banco (PasswordResetToken)
    const resetToken = await generatePasswordResetToken(email);

    // 2. Disparo REAL do e-mail usando os dados do Supabase + Nodemailer
    // Passamos o e-mail, o token gerado e o nome do usuário para o template
    await sendPasswordResetEmail(
      user.email!,
      resetToken.token,
      user.name || "Usuário"
    );

    return { success: "Se o e-mail existir, um link de recuperação foi enviado!" };
    
  } catch (error) {
    console.error("ERRO_FORGOT_PASSWORD:", error);
    return { error: "Erro ao processar solicitação de recuperação." };
  }
}