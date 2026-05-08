// src/lib/actions/availability.ts

"use server"

import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/utils/generate-slots";

/**
 * Busca os slots disponíveis para um profissional em uma data específica,
 * filtrando opcionalmente por uma agenda (groupId)
 */
export async function getStaffAvailabilityAction(userId: string, date: Date, groupId?: string) {
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  const scheduleGroup = await prisma.staffScheduleGroup.findFirst({
    where: {
      userId,
      // Se o groupId for passado, garantimos que pegamos apenas essa agenda
      ...(groupId ? { id: groupId } : {}), 
      startDate: { lte: date },
      OR: [
        { endDate: null },
        { endDate: { gte: date } }
      ]
    },
    include: {
      intervals: {
        where: {
          [dayName]: true 
        }
      }
    }
  });

  if (!scheduleGroup || scheduleGroup.intervals.length === 0) {
    return { slots: [], message: "Nenhum horário disponível." };
  }

  let allSlots: string[] = [];
  
  scheduleGroup.intervals.forEach((interval) => {
    const intervalSlots = generateAvailableSlots(
      interval.startTime,
      interval.endTime,
      scheduleGroup.slotDuration
    );
    allSlots = [...allSlots, ...intervalSlots];
  });

  return { 
    slots: allSlots.sort(), 
    slotDuration: scheduleGroup.slotDuration 
  };
}

/**
 * Busca os dias ativos de uma AGENDA específica (ou de todas do profissional)
 */
export async function getActiveDaysAction(userId: string, groupId?: string) {
  const scheduleGroups = await prisma.staffScheduleGroup.findMany({
    where: { 
      userId,
      ...(groupId ? { id: groupId } : {}) 
    },
    include: { intervals: true }
  });

  const activeDays = new Set<number>();

  scheduleGroups.forEach(group => {
    group.intervals.forEach(interval => {
      if (interval.sunday) activeDays.add(0);
      if (interval.monday) activeDays.add(1);
      if (interval.tuesday) activeDays.add(2);
      if (interval.wednesday) activeDays.add(3);
      if (interval.thursday) activeDays.add(4);
      if (interval.friday) activeDays.add(5);
      if (interval.saturday) activeDays.add(6);
    });
  });

  return Array.from(activeDays);
}