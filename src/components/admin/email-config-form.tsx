// src/components/admin/email-config-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { emailConfigSchema, EmailConfigValues } from "@/lib/validations/admin";
import { updateEmailConfig } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Loader2, Mail, Server, Layout } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface EmailConfigFormProps {
  initialData: any; // Recebe os dados do servidor
}

export function EmailConfigForm({ initialData }: EmailConfigFormProps) {
  const [isPending, startTransition] = useTransition();

  // DEFINIÇÃO DOS VALORES PADRÃO BASEADOS NO BANCO:
	const form = useForm<EmailConfigValues>({
		// O 'as any' aqui remove o bloqueio do TypeScript que impede o build
		resolver: zodResolver(emailConfigSchema) as any, 
		defaultValues: {
		  smtpHost: initialData?.smtpHost || "",
		  smtpPort: initialData?.smtpPort || "",
		  smtpUser: initialData?.smtpUser || "",
		  smtpPass: "", 
		  // O !! garante que se vier null/undefined do banco, vira false
		  useSecure: !!initialData?.useSecure, 
		  fromName: initialData?.fromName || "",
		  fromEmail: initialData?.fromEmail || "",
		  adminNotifyEmail: initialData?.adminNotifyEmail || "",
		  emailTemplate: initialData?.emailTemplate || "",
		},
	  });

  const onSubmit = (values: EmailConfigValues) => {
    startTransition(() => {
      updateEmailConfig(values).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          // Opcional: Limpar o campo de senha após salvar com sucesso
          form.setValue("smtpPass", ""); 
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção SMTP */}
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-md flex items-center gap-2 text-zinc-700 font-semibold">
                <Server className="w-4 h-4 text-blue-600" />
                Servidor de Envio (SMTP)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField control={form.control} name="smtpHost" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-zinc-500">HOST SMTP</FormLabel>
                      <FormControl><Input placeholder="smtp.gmail.com" {...field} disabled={isPending}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="smtpPort" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500">PORTA</FormLabel>
                    <FormControl><Input placeholder="587" {...field} disabled={isPending}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="smtpUser" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500">USUÁRIO (E-MAIL)</FormLabel>
                  <FormControl><Input placeholder="seu-email@gmail.com" {...field} disabled={isPending}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="smtpPass" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500">SENHA SMTP</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    {initialData?.smtpPass 
                      ? "Já existe uma senha salva. Deixe em branco para manter a atual." 
                      : "Insira a senha ou Token de App do seu e-mail."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="useSecure" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 bg-zinc-50 rounded-md border">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">Usar conexão segura (SSL/TLS)</FormLabel>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Seção Remetente */}
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-md flex items-center gap-2 text-zinc-700 font-semibold">
                <Mail className="w-4 h-4 text-blue-600" />
                Identificação de E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField control={form.control} name="fromName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500">NOME DO REMETENTE</FormLabel>
                  <FormControl><Input placeholder="Ex: Gestor Financeiro" {...field} disabled={isPending}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fromEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500">E-MAIL DO REMETENTE</FormLabel>
                  <FormControl><Input placeholder="contato@empresa.com" {...field} disabled={isPending}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="adminNotifyEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500">E-MAIL DE NOTIFICAÇÃO (ADMIN)</FormLabel>
                  <FormControl><Input placeholder="admin@empresa.com" {...field} disabled={isPending}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {/* SEÇÃO 3: Layout de Envio (HTML) */}
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-md flex items-center gap-2 text-zinc-700 font-semibold">
              <Layout className="w-4 h-4 text-blue-600" />
              Layout Base de Envio (HTML)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FormField control={form.control} name="emailTemplate" render={({ field }) => (
              <FormItem>
                <FormDescription className="mb-2">
                  Insira o código HTML para o corpo dos e-mails. Use as tags <code>{"{{nome}}"}</code> e <code>{"{{link}}"}</code> para substituição dinâmica.
                </FormDescription>
                <FormControl>
                  <Textarea 
                    {...field} 
                    disabled={isPending}
                    className="font-mono text-sm min-h-[300px] bg-zinc-50 focus-visible:ring-blue-600"
                    placeholder="<html><body>Olá {{nome}}, clique em {{link}}</body></html>"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isPending} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 transition-all"
          >
            {isPending ? (
              <Loader2 className="animate-spin mr-2 w-4 h-4" />
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}