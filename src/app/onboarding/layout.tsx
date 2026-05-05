// src/app/onboarding/layout.tsx (Crie se não existir)

import { SessionProvider } from "next-auth/react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}