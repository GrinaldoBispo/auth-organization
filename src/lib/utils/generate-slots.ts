// src/lib/utils/generate-slots.ts

import { addMinutes, format, parse, isBefore, isAfter, isEqual } from "date-fns";

export function generateAvailableSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
) {
  const slots: string[] = [];
  
  // Usamos uma data de referência qualquer para manipular as horas
  let current = parse(startTime, "HH:mm", new Date());
  const end = parse(endTime, "HH:mm", new Date());

  // Enquanto o horário atual for antes do fim, adiciona o slot
  while (isBefore(current, end)) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, slotDuration);
  }

  return slots;
}