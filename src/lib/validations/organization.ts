// src/lib/validations/organization.ts

import * as z from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(3, "O nome da unidade deve ter pelo menos 3 caracteres"),
  type: z.enum(["CLINIC", "BARBERSHOP", "SALON", "OTHER"]), 
  phone: z.string().min(10, "Informe um telefone válido (com DDD)"),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;