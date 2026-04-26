// src/lib/actions/login.ts

"use server";

import { signIn } from "@/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation"; // Usaremos o redirect padrão

export async function login(values: LoginValues) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" };
  }

  const { email, password } = validatedFields.data;

  try {
    // No Next.js 15/16, para evitar o conflito com try/catch, 
    // desabilitamos o redirect automático do signIn e fazemos manualmente.
    await signIn("credentials", {
      email,
      password,
      redirect: false, // <-- IMPORTANTE: Desativamos o redirect automático aqui
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos!" };
        default:
          return { error: "Algo deu errado no login." };
      }
    }
    return { error: "Erro interno do servidor." };
  }

  // Se chegou aqui, é porque o signIn não deu erro. 
  // Agora fazemos o redirecionamento fora do try/catch!
  redirect("/dashboard");
}