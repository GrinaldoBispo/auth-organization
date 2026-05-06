//src/lib/validations/staff.ts

import * as z from "zod";

export const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  username: z.string().min(3, "Username muito curto"),
  role: z.enum(["STAFF", "ADMIN"]).default("STAFF"),
});

export type StaffValues = z.infer<typeof staffSchema>;