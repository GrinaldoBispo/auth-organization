// src/lib/mail.ts

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "system_config" }
  });

  if (!settings) {
    console.error("Configurações SMTP não encontradas.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: Number(settings.smtpPort),
    secure: settings.useSecure, 
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  // ROTA CORRIGIDA PARA /reset-password
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${domain}/reset-password?token=${token}`;

  let htmlBody = settings.emailTemplate;
  htmlBody = htmlBody.replace("{{nome}}", name);
  htmlBody = htmlBody.replace("{{link}}", resetLink);

  try {
    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: email,
      subject: "Redefinição de Senha",
      html: htmlBody,
    });
    console.log(`✅ E-mail enviado com sucesso para: ${email}`);
  } catch (error) {
    console.error("❌ Erro no Nodemailer:", error);
  }
};