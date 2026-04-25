// src/app/(auth)/login/page.tsx

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Dados enviados:", data);
    toast.success("Login realizado com sucesso! Redirecionando...");
    setIsLoading(false);
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="nome@exemplo.com"
              type="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <Button disabled={isLoading} className="w-full">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </div>
      </form>
      <div className="relative flex justify-center text-xs uppercase border-t pt-4">
        <span className="bg-background px-2 text-muted-foreground absolute -top-3">Ou continue com</span>
      </div>
      <Button variant="outline" type="button" disabled={isLoading} onClick={() => toast.info("OAuth em breve!")}>
        <Icons.gitHub className="mr-2 h-4 w-4" /> Github
      </Button>
    </div>
  );
}