// src/components/auth/onboarding-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingValues } from "@/lib/validations/organization";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Building2, Phone, Briefcase } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrganizationAction } from "@/lib/actions/organization";

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      phone: "",
      type: undefined,
    },
  });

  const onSubmit = (values: OnboardingValues) => {
    startTransition(async () => {
      try {
        const result = await createOrganizationAction(values);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Unidade criada com sucesso!");

        await update();
        
        setTimeout(() => {
           window.location.replace("/dashboard");
        }, 1000);

      } catch (error) {
        toast.error("Erro inesperado. Tente novamente.");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Nome da Unidade */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Unidade / Empresa</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input 
                      {...field} 
                      disabled={isPending} 
                      placeholder="Ex: Barbearia do João" 
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Negócio */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Negócio</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="relative pl-9">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <SelectValue placeholder="Selecione o nicho" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CLINIC">Clínica / Saúde</SelectItem>
                    <SelectItem value="BARBERSHOP">Barbearia</SelectItem>
                    <SelectItem value="SALON">Salão de Beleza</SelectItem>
                    <SelectItem value="OTHER">Outros Serviços</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp de Contato</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input 
                      {...field} 
                      disabled={isPending} 
                      placeholder="(00) 00000-0000" 
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Concluir Configuração"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}