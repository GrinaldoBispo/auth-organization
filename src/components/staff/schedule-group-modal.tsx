"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Save, CalendarClock, Loader2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertScheduleGroupAction } from "@/lib/actions/schedule"
import { scheduleGroupSchema, ScheduleGroupValues } from "@/lib/validations/schedule"
import { cn } from "@/lib/utils"

interface ScheduleGroupModalProps {
  staff: any[]
  initialData?: any
  variant?: "default" | "icon" | "menu-item" | "none"
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ScheduleGroupModal({ 
  staff, 
  initialData, 
  variant = "default", 
  onSuccess,
  open: externalOpen,
  onOpenChange: setExternalOpen 
}: ScheduleGroupModalProps) {
  
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Sincroniza o estado de abertura (usa o externo se existir, senão o interno)
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen

  // Função centralizada para mudar o estado de abertura
  const handleOpenChange = (val: boolean) => {
    if (setExternalOpen) {
      setExternalOpen(val)
    } else {
      setInternalOpen(val)
    }
  }

  const formatDate = (date: any) => date ? new Date(date).toISOString().split('T')[0] : ""

  const form = useForm<ScheduleGroupValues>({
  resolver: zodResolver(scheduleGroupSchema) as any, // O 'as any' aqui resolve o conflito de tipos complexos do Zod vs Hook Form no build
  defaultValues: initialData || {
    name: "",
    userId: "",
    slotDuration: 30,
    startDate: new Date().toISOString().split('T')[0],
    intervals: [{ 
      startTime: "08:00", 
      endTime: "12:00", 
      monday: true, 
      tuesday: true, 
      wednesday: true, 
      thursday: true, 
      friday: true, 
      saturday: false, 
      sunday: false 
    }]
  }
})

  // Reseta o formulário quando o modal abre ou os dados iniciais mudam
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData || {
        name: "",
        userId: "",
        slotDuration: 30,
        startDate: new Date().toISOString().split('T')[0],
        intervals: [{ startTime: "08:00", endTime: "12:00", monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }]
      })
      if (initialData) {
        form.setValue("startDate", formatDate(initialData.startDate))
        form.setValue("endDate", formatDate(initialData.endDate))
      }
    }
  }, [initialData, isOpen, form])

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "intervals" })

  function onSubmit(values: ScheduleGroupValues) {
    startTransition(async () => {
      const result = await upsertScheduleGroupAction(values)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        handleOpenChange(false) // Fecha o modal
        router.refresh()
        if (onSuccess) onSuccess()
        if (!initialData) form.reset()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {variant !== "none" && (
        <DialogTrigger asChild>
          {variant === "icon" ? (
            <button className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#43b5a1] text-[#43b5a1] hover:bg-[#43b5a1] hover:text-white transition-all">
              <Plus className="h-4 w-4" />
            </button>
          ) : variant === "menu-item" ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer rounded-sm outline-none transition-colors w-full">
              <Edit2 className="h-4 w-4 text-zinc-400" /> Editar agenda
            </div>
          ) : (
            <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 hover:bg-zinc-50 gap-2 font-bold text-zinc-600 shadow-sm">
              <CalendarClock className="h-4 w-4" /> Grade
            </Button>
          )}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-[95vw] md:max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl outline-none">
        <DialogHeader className="px-8 pt-8 text-left">
          <DialogTitle className="text-lg font-black uppercase tracking-tight">
            {initialData ? "Editar Agenda" : "Configurar Grade de Horários"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-8">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Nome da Agenda</FormLabel>
                    <FormControl><Input placeholder="Ex: Principal" {...field} className="h-9 rounded-lg" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="col-span-4">
                <FormField control={form.control} name="slotDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Duração (min)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="h-9 rounded-lg" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="col-span-4">
                <FormField control={form.control} name="userId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Profissional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="w-full h-9 rounded-lg"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <div className="col-span-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Data Inicial</FormLabel>
                    <FormControl><Input type="date" {...field} className="h-9 rounded-lg" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="col-span-4">
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-zinc-400">Data Final</FormLabel>
                    <FormControl><Input type="date" value={field.value || ""} onChange={field.onChange} className="h-9 rounded-lg" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="relative py-0">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100" /></div>
              <div className="relative flex justify-between items-center bg-white pr-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white pr-2">Turnos</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => append({ startTime: "14:00", endTime: "18:00", monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false })} className="h-7 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-3 custom-scrollbar">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-2 bg-zinc-50 rounded-xl border border-zinc-100 relative group">
                  <div className="flex gap-2 shrink-0">
                    <FormField control={form.control} name={`intervals.${index}.startTime`} render={({ field }) => (<FormControl><Input type="time" {...field} className="h-8 w-24 rounded-md text-xs border-none shadow-none bg-white" /></FormControl>)} />
                    <FormField control={form.control} name={`intervals.${index}.endTime`} render={({ field }) => (<FormControl><Input type="time" {...field} className="h-8 w-24 rounded-md text-xs border-none shadow-none bg-white" /></FormControl>)} />
                  </div>
                  <div className="flex flex-1 justify-between items-center bg-white h-12 px-4 rounded-md border border-zinc-200/50">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, i) => {
                      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
                      return (
                        <FormField key={i} control={form.control} name={`intervals.${index}.${days[i]}`} render={({ field }) => (
                          <FormItem className="flex flex-col items-center">
                            <span className={cn("text-[8px] font-bold", field.value ? "text-blue-600" : "text-zinc-300")}>{label}</span>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-3 w-3 rounded-sm border-zinc-300" /></FormControl>
                          </FormItem>
                        )} />
                      )
                    })}
                  </div>
                  {index > 0 && (<Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-red-500" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>)}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="rounded-xl font-bold text-zinc-500 text-xs">Cancelar</Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 min-w-[140px] text-xs">
                {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <div className="flex items-center gap-2 tracking-tight"><Save className="h-4 w-4" /> SALVAR</div>}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}