// src/components/appointments/create-appointment-modal.tsx

"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createAppointmentAction, updateAppointmentAction } from "@/lib/actions/appointment";
import { appointmentSchema, AppointmentValues } from "@/lib/validations/appointment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";

const emptyValues = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  notes: "",
};

interface CreateAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  providerId?: string;
  scheduleGroupId?: string;
  onSuccess?: () => void;
  appointmentId?: string | null;
  initialData?: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    notes?: string;
  } | null;
}

export function CreateAppointmentModal({ 
  open, 
  onOpenChange, 
  selectedDate, 
  providerId, 
  scheduleGroupId,
  onSuccess,
  appointmentId,
  initialData
}: CreateAppointmentModalProps) {
  
  const [isPending, startTransition] = useTransition();
  const isEditing = !!appointmentId;

  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: { 
      ...emptyValues,
      date: selectedDate,
      providerId: providerId || "",
      scheduleGroupId: scheduleGroupId || ""
    }
  });

  // LOGICA DE LIMPEZA E PREENCHIMENTO
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        // Se for EDIÇÃO, carrega os dados do Wesley (ou de quem for)
        form.reset({
          clientName: initialData.clientName,
          clientPhone: initialData.clientPhone,
          clientEmail: initialData.clientEmail || "",
          notes: initialData.notes || "",
          date: selectedDate,
          providerId: providerId || "",
          scheduleGroupId: scheduleGroupId || ""
        });
      } else {
        // SE FOR NOVO (LIVRE), força o reset para vazio para não vir lixo da última vez
        form.reset({
          ...emptyValues,
          date: selectedDate,
          providerId: providerId || "",
          scheduleGroupId: scheduleGroupId || ""
        });
      }
    }
  }, [open, isEditing, initialData, selectedDate, providerId, scheduleGroupId, form]);

  async function onSubmit(values: AppointmentValues) {
    if (!providerId || !scheduleGroupId) {
      toast.error("Selecione uma agenda antes de salvar.");
      return;
    }

	startTransition(async () => {
	  let result;
	  
	  if (isEditing && appointmentId) {
		result = await updateAppointmentAction(appointmentId, values);
	  } else {
		result = await createAppointmentAction(values);
	  }

	  // AJUSTE AQUI: Verificamos 'error' primeiro ou usamos a checagem 'in'
	  if ('success' in result && result.success) {
		toast.success(result.success);
		form.reset(); 
		if (onSuccess) onSuccess();
		onOpenChange(false);
	  } else if ('error' in result) {
		toast.error(result.error || "Erro ao processar agendamento.");
	  }
	});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-700">
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-[#43b5a1] font-bold">
            <span>{selectedDate.toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>{selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome do Cliente</FormLabel>
                  <FormControl>
                    {/* REMOVIDO DISABLED PARA PERMITIR EDITAR NOME */}
                    <Input placeholder="Ex: João Silva" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Telefone</FormLabel>
                    <FormControl>
                        {/* REMOVIDO DISABLED PARA PERMITIR EDITAR TELEFONE */}
                        <Input placeholder="(00) 00000-0000" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-mail</FormLabel>
                    <FormControl>
                        <Input placeholder="Opcional" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Observações / Procedimento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes do atendimento..." {...field} className="rounded-xl resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isPending}
                className={cn(
                    "w-full font-bold uppercase py-6 rounded-xl transition-all",
                    isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-[#43b5a1] hover:bg-[#369685]"
                )}
              >
                {isPending ? "Processando..." : isEditing ? "Salvar Alterações" : "Confirmar Agendamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}