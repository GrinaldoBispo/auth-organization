// src/lib/validations/admin.ts

import * as z from "zod";

export const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "Obrigatório"),
  smtpPort: z.string().min(1, "Obrigatório"),
  smtpUser: z.string().min(1, "Obrigatório"),
  smtpPass: z.string().optional().or(z.literal("")), // Permite opcional ou string vazia
  useSecure: z.boolean(), // Remova o default aqui para forçar a obrigatoriedade no formulário
  fromName: z.string().min(1, "Obrigatório"),
  fromEmail: z.string().email("E-mail inválido"),
  adminNotifyEmail: z.string().email("E-mail inválido"),
  emailTemplate: z.string().min(1, "Obrigatório"),
});

export type EmailConfigValues = z.infer<typeof emailConfigSchema>;