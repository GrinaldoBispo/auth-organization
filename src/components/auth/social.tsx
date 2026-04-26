// src/components/auth/social.tsx

"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc"; // Instale: npm install react-icons
import { Button } from "@/components/ui/button";

export function Social() {
  const onClick = (provider: "google") => {
    // O callbackUrl garante que o usuário volte para a dashboard após o login
    signIn(provider, {
      callbackUrl: "/dashboard", 
    });
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5 mr-2" />
        Entrar com Google
      </Button>
    </div>
  );
}