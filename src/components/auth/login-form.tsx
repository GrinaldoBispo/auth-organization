// src/components/auth/login-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginValues } from "@/lib/validations/auth";
import { useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Social } from "./social";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false, // Mantemos false para controlar o destino via Role
        });

        if (result?.error) {
          // Tratamento de erro específico para credenciais
          if (result.error === "CredentialsSignin") {
            toast.error("E-mail ou senha incorretos.");
          } else {
            toast.error("Ocorreu um erro ao tentar entrar.");
          }
          return;
        }

        toast.success("Login realizado com sucesso!");

        // 1. Atualizamos a sessão para garantir que temos a Role do banco
        const session = await update();

        // 2. Redirecionamento Inteligente
        // Se for ADMIN -> vai para as configurações de e-mail
        // Se for USER -> vai para o dashboard principal
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }

        router.refresh();
      } catch (error) {
        toast.error("Erro inesperado. Tente novamente.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail ou Username</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isPending} 
                    placeholder="exemplo@gmail.com" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-blue-600 hover:underline transition-all"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isPending} 
                    type="password" 
                    placeholder="******" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </Form>

      {/* Divisor Visual */}
      <div className="relative flex items-center justify-center py-2">
        <Separator className="absolute w-full border-zinc-200" />
        <span className="relative bg-white px-2 text-[10px] text-zinc-500 uppercase tracking-wider">
          Ou continue com
        </span>
      </div>

      {/* Botão Social (Google) */}
      <Social />
    </div>
  );
}