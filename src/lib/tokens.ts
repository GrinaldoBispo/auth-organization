// src/lib/tokens.ts

import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // Expira em 1 hora

  const existingToken = await (prisma as any).passwordResetToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await (prisma as any).passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await (prisma as any).passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
};