// src/lib/validations/schedule.ts

import * as z from "zod"

export const scheduleGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  userId: z.string().min(1, "Selecione um profissional"),
  slotDuration: z.number().min(1),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  intervals: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }))
})

// GARANTA QUE O TIPO É EXTRAÍDO ASSIM:
export type ScheduleGroupValues = z.infer<typeof scheduleGroupSchema>