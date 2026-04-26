// src/lib/actions/admin.ts

"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailConfigSchema, EmailConfigValues } from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

export async function updateEmailConfig(values: EmailConfigValues) {
  try {
    // 1. Verificação de Segurança: Apenas ADMIN pode salvar
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { error: "Acesso negado! Você não tem permissão." };
    }

    // 2. Validação dos campos com Zod
    const validatedFields = emailConfigSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Campos inválidos! Verifique os dados digitados." };
    }

    const data = { ...validatedFields.data };

    // 3. Lógica da Senha (Opcional no Update)
    // Se a senha estiver vazia, removemos para o Prisma não sobrescrever com ""
    const isUpdate = await prisma.systemSettings.findUnique({
      where: { id: "system_config" }
    });

    if (!data.smtpPass || data.smtpPass.trim() === "") {
      delete data.smtpPass;
      
      // Se for a primeira vez criando (não tem no banco) e a senha veio vazia
      if (!isUpdate) {
        return { error: "A senha SMTP é obrigatória no primeiro salvamento." };
      }
    }

    // 4. Execução do Upsert
    await prisma.systemSettings.upsert({
      where: { id: "system_config" },
      update: {
        ...data,
        updatedAt: new Date(), // Força a atualização do timestamp
      },
      create: {
        id: "system_config",
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass || "", // Senha inicial
        fromName: data.fromName || "Sistema",
        fromEmail: data.fromEmail,
        adminNotifyEmail: data.adminNotifyEmail,
        emailTemplate: data.emailTemplate,
        useSecure: data.useSecure ?? false,
      },
    });

    // 5. Limpa o cache da página para mostrar os novos dados
    revalidatePath("/email");
    
    return { success: "Configurações salvas com sucesso!" };

  } catch (error) {
    console.error("[UPDATE_EMAIL_CONFIG_ERROR]:", error);
    return { error: "Erro interno ao salvar no banco de dados." };
  }
}