// src/lib/validations/appointment.ts

import * as z from "zod";

export const appointmentSchema = z.object({
  clientName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  clientPhone: z.string().min(10, "Informe um telefone válido com DDD"),
  clientEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  
  // Solução "Bulletproof" para o Build:
  // Primeiro transformamos qualquer input em Date, depois validamos se é um objeto Date válido.
  date: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    },
    z.date({ message: "Data e hora são obrigatórias" })
  ),

  notes: z.string().optional(),
  providerId: z.string().min(1, "Profissional não identificado"),
  scheduleGroupId: z.string().min(1, "Agenda não identificada"),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;