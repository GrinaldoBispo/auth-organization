// src/components/auth/forgot-password-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validations/auth";
import { useState } from "react";
import { forgotPasswordAction } from "@/lib/actions/forgot-password";
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

export function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsPending(true);
    
    // Criamos um FormData para enviar para a Server Action
    const formData = new FormData();
    formData.append("email", values.email);

    const result = await forgotPasswordAction(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || "Link enviado! Verifique a sua caixa de entrada.");
      form.reset();
    }
    setIsPending(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail da conta</FormLabel>
              <FormControl>
                <Input placeholder="exemplo@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A enviar link...
            </>
          ) : (
            "Recuperar Palavra-passe"
          )}
        </Button>
      </form>
    </Form>
  );
}