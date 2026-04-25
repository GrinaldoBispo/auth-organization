// SenhaSuperSegura@123

// src/lib/validations/auth.ts
import * as z from "zod";

export const loginSchema = z.object({
  // Permitimos login com email ou username
  email: z.string().min(1, "E-mail ou usuário é obrigatório"),
  password: z.string().min(1, "Palavra-passe é obrigatória"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  username: z
    .string()
    .min(3, "O nome de utilizador deve ter pelo menos 3 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "O nome de utilizador não pode conter espaços ou símbolos"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;