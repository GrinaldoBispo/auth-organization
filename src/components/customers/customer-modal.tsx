// src/components/customers/customer-modal.tsx

"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerValues } from "@/lib/validations/customer";
import { upsertCustomerAction } from "@/lib/actions/customer";
import { toast } from "sonner";
import { Plus, Loader2, Edit2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface CustomerModalProps {
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
}

export function CustomerModal({ customer }: CustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: customer?.id || "",
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
    },
  });

  // Função para formatar o telefone visualmente enquanto digita
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  useEffect(() => {
    if (customer) {
      form.reset({
        id: customer.id,
        name: customer.name,
        // Aplicamos a máscara ao carregar para edição
        phone: formatPhone(customer.phone),
        email: customer.email || "",
      });
    } else {
      form.reset({ id: "", name: "", phone: "", email: "" });
    }
  }, [customer, open, form]);

	const onSubmit = (values: CustomerValues) => {
		startTransition(async () => {
		  const result = await upsertCustomerAction(values);

		  // Verificação de tipo segura para o TypeScript
		  if ("error" in result && result.error) {
			toast.error(result.error);
		  } else if ("success" in result && result.success) {
			toast.success(result.success);
			setOpen(false);
			if (!customer) form.reset();
		  }
		});
	  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customer ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="João Silva" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="(00) 00000-0000" 
                      disabled={isPending}
                      onChange={(e) => {
                        const masked = formatPhone(e.target.value);
                        field.onChange(masked);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail (Opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="email@exemplo.com" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                customer ? "Salvar Alterações" : "Salvar Cliente"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}