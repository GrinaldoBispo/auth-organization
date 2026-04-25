// src/lib/validations/auth.ts

// SenhaSuperSegura@123

import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(8, { message: "Mínimo de 8 caracteres." }),
});

export type LoginInput = z.infer<typeof loginSchema>;