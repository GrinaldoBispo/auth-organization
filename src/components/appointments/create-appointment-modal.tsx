"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createAppointmentAction, updateAppointmentAction, cancelAppointmentAction } from "@/lib/actions/appointment";
import { getCustomerByPhoneAction } from "@/lib/actions/customer"; // <-- Certifique-se de criar esta action
import { appointmentSchema, AppointmentValues } from "@/lib/validations/appointment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTransition, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
  initialData?: any;
}

export function CreateAppointmentModal({ 
  open, onOpenChange, selectedDate, providerId, scheduleGroupId, onSuccess, appointmentId, initialData 
}: CreateAppointmentModalProps) {
  
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  
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

  // Observa o telefone para busca automática
  const phoneValue = form.watch("clientPhone");

useEffect(() => {
  async function checkCustomer() {
    const cleanPhone = phoneValue?.replace(/\D/g, "");
    
    // 1. Se o telefone tiver o tamanho de um número válido
    if (cleanPhone?.length >= 10) {
      setIsSearching(true);
      try {
        const customer = await getCustomerByPhoneAction(phoneValue);
        
        if (customer) {
          // ENCONTROU: Atualiza os campos automaticamente com os dados do dono do número
          form.setValue("clientName", customer.name);
          form.setValue("clientEmail", customer.email || "");
          setIsExistingCustomer(true);
          toast.info(`Cliente identificado: ${customer.name}`);
        } else {
          // NÃO ENCONTROU: Se for um número novo, limpa os campos para permitir novo cadastro
          // Mas cuidado: só limpa se não for a carga inicial do agendamento
          if (!isEditing) {
            form.setValue("clientName", "");
            form.setValue("clientEmail", "");
          }
          setIsExistingCustomer(false);
        }
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setIsSearching(false);
      }
    }
  }

  checkCustomer();
}, [phoneValue, form, isEditing]); // Adicionado isEditing como dependência

  useEffect(() => {
    if (open) {
      form.reset({
        clientName: initialData?.clientName || "",
        clientPhone: initialData?.clientPhone || "",
        clientEmail: initialData?.clientEmail || "",
        notes: initialData?.notes || "",
        date: selectedDate,
        providerId: providerId || "",
        scheduleGroupId: scheduleGroupId || ""
      });
      // Se já abriu com dados, considera existente para bloquear campos
      setIsExistingCustomer(!!initialData);
    }
  }, [open, initialData, selectedDate, providerId, scheduleGroupId, form]);

  async function onSubmit(values: AppointmentValues) {
    startTransition(async () => {
      const result = isEditing && appointmentId 
        ? await updateAppointmentAction(appointmentId, values)
        : await createAppointmentAction(values);

      if ("success" in result && result.success) {
        toast.success(result.success);
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else if ("error" in result) {
        toast.error(result.error);
      }
    });
  }
  
  async function handleCancel() {
    if (!appointmentId) return;
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      startTransition(async () => {
        const result = await cancelAppointmentAction(appointmentId);
        if (result.success) {
          toast.success(result.success);
          if (onSuccess) onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error);
        }
      });
    }
  }

  // Trava campos se for edição OU se o cliente já existir na base
  const isFieldDisabled = isEditing || isExistingCustomer || isSearching;
  
  // Função de máscara simples no Modal
	const formatPhone = (value: string) => {
	  if (!value) return "";
	  const numbers = value.replace(/\D/g, "");
	  if (numbers.length <= 10) {
		return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	  }
	  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase text-zinc-700 tracking-tight">
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <div className="flex items-center gap-2 text-[11px] text-[#43b5a1] font-bold uppercase tracking-widest">
            <span>{selectedDate.toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>{selectedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            {/* Campo Telefone - Primeiro para gatilhar a busca */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex justify-between">
                      Telefone
                      {isSearching && <Loader2 className="h-3 w-3 animate-spin text-[#43b5a1]" />}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field}
						onChange={(e) => {
						  const masked = formatPhone(e.target.value);
						  field.onChange(masked); // O Zod vai limpar isso no submit graças ao .transform()
						}}
                        className="rounded-xl border-zinc-200 focus:border-[#43b5a1] focus:ring-[#43b5a1]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={isFieldDisabled}
                      className={cn(
                        "rounded-xl border-zinc-200 transition-all",
                        isFieldDisabled && "bg-zinc-50 border-dashed text-zinc-500 opacity-80"
                      )} 
                    />
                  </FormControl>
                  {isFieldDisabled && !isSearching && (
                    <p className="text-[9px] text-zinc-400 italic mt-1">
                      * Cadastro protegido. Alterações apenas na Gestão de Clientes.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Email */}
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={isFieldDisabled}
                      className={cn(
                        "rounded-xl border-zinc-200 transition-all",
                        isFieldDisabled && "bg-zinc-50 border-dashed text-zinc-500 opacity-80"
                      )} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Notas / Procedimento</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes adicionais..." 
                      {...field} 
                      className="rounded-xl border-zinc-200 focus:border-[#43b5a1] focus:ring-[#43b5a1] resize-none h-24" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isPending || isSearching}
                className={cn(
                  "w-full font-bold uppercase py-6 rounded-xl shadow-sm transition-all active:scale-95",
                  isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-[#43b5a1] hover:bg-[#369685]"
                )}
              >
                {isPending ? "Processando..." : isEditing ? "Salvar Alterações" : "Confirmar Agendamento"}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={handleCancel}
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase text-[10px] tracking-[0.2em] transition-colors"
                >
                  Cancelar Agendamento
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}