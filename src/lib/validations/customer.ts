// src/lib/validations/customer.ts

import * as z from "zod";

export const customerSchema = z.object({
  id: z.string().optional(), // Necessário para o Upsert saber se edita ou cria
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

export type CustomerValues = z.infer<typeof customerSchema>;