// src/lib/actions/availability.ts

"use server"

import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/utils/generate-slots";
import { startOfDay, endOfDay, format } from "date-fns";

/**
 * Busca os slots de tempo e cruza com agendamentos existentes,
 * trazendo dados completos do cliente para possibilitar edição.
 */
export async function getStaffAvailabilityAction(userId: string, date: Date, groupId?: string) {
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  // 1. Busca a configuração da agenda (Grade)
  const scheduleGroup = await prisma.staffScheduleGroup.findFirst({
    where: {
      userId,
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

  // 2. Busca agendamentos com dados completos do Customer e Notas
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      scheduleGroupId: scheduleGroup.id,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: {
        notIn: ["CANCELLED"]
      }
    },
    include: {
      customer: {
        select: { 
          name: true,
          phone: true,   // Adicionado para edição
          email: true    // Adicionado para edição
        }
      }
    }
  });

  // 3. Gera todos os horários teóricos
  let allTimeSlots: string[] = [];
  
  scheduleGroup.intervals.forEach((interval) => {
    const intervalSlots = generateAvailableSlots(
      interval.startTime,
      interval.endTime,
      scheduleGroup.slotDuration
    );
    allTimeSlots = [...allTimeSlots, ...intervalSlots];
  });

  // 4. Cruza horários com dados ricos para o modal
  const finalSlots = allTimeSlots.sort().map((time) => {
    const appointment = existingAppointments.find(
      (app) => format(new Date(app.date), "HH:mm") === time
    );

    return {
      time,
      available: !appointment,
      clientName: appointment?.customer.name || null,
      clientPhone: appointment?.customer.phone || null, // Novo campo
      clientEmail: appointment?.customer.email || null, // Novo campo
      notes: appointment?.notes || null,               // Novo campo
      appointmentId: appointment?.id || null
    };
  });

  return { 
    slots: finalSlots, 
    slotDuration: scheduleGroup.slotDuration 
  };
}

/**
 * Busca os dias ativos (mantido para o funcionamento do calendário)
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