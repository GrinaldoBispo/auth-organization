// src/components/staff/staff-modal.tsx

"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, StaffValues } from "@/lib/validations/staff";
import { upsertStaffAction } from "@/lib/actions/staff";
import { toast } from "sonner";
import { Plus, Loader2, Edit2, User, Mail, UserCircle, Shield } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StaffModalProps {
  staff?: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    role: "ADMIN" | "STAFF" | "SUPERADMIN";
  };
}

export function StaffModal({ staff }: StaffModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      id: staff?.id || "",
      name: staff?.name || "",
      email: staff?.email || "",
      username: staff?.username || "",
      role: (staff?.role as "ADMIN" | "STAFF") || "STAFF",
    },
  });

  // Sincroniza os dados ao abrir para edição ou novo cadastro
  useEffect(() => {
    if (open) {
      if (staff) {
        form.reset({
          id: staff.id,
          name: staff.name || "",
          email: staff.email || "",
          username: staff.username || "",
          role: (staff.role as "ADMIN" | "STAFF") || "STAFF",
        });
      } else {
        form.reset({ id: "", name: "", email: "", username: "", role: "STAFF" });
      }
    }
  }, [staff, open, form]);

  const onSubmit = (values: StaffValues) => {
    startTransition(async () => {
      const result = await upsertStaffAction(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {staff ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Membro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{staff ? "Editar Membro" : "Novo Membro da Equipe"}</DialogTitle>
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
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input {...field} placeholder="Ex: Dr. Ricardo Silva" className="pl-9" disabled={isPending}/>
                    </div>
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input {...field} type="email" placeholder="ricardo@clinica.com" className="pl-9" disabled={isPending}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário (Login)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input {...field} placeholder="ricardo.silva" className="pl-9" disabled={isPending}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo / Permissão</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="pl-9 relative">
                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff / Prestador</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : staff ? "Salvar Alterações" : "Cadastrar Membro"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}