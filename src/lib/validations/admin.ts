// src/lib/validations/admin.ts

import * as z from "zod";

export const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "Host é obrigatório"),
  smtpPort: z.string().min(1, "Porta é obrigatória"),
  smtpUser: z.string().min(1, "Usuário é obrigatório"),
  smtpPass: z.string().optional(),
  useSecure: z.boolean().default(false),
  fromName: z.string().min(1, "Nome do remetente é obrigatório"),
  fromEmail: z.string().email("E-mail do remetente inválido"),
  adminNotifyEmail: z.string().email("E-mail de notificação inválido"),
  emailTemplate: z.string().min(10, "O layout do e-mail é obrigatório"), // O campo para o HTML
});

export type EmailConfigValues = z.infer<typeof emailConfigSchema>;