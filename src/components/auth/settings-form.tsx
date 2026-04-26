// src/app/settings/settings-form.tsx

"use client";

import { updateProfile } from "@/lib/actions/update-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SettingsForm({ user }: { user: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function clientAction(formData: FormData) {
    setIsPending(true);
    const result = await updateProfile(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    } else {
      toast.success("Perfil atualizado! A redirecionar...");
      
      // Pequeno delay para o utilizador ler o toast antes de mudar de página
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form action={clientAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Exibido</Label>
        <Input id="name" name="name" defaultValue={user.name || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">@Username</Label>
        <Input id="username" name="username" defaultValue={user.username || ""} />
      </div>

      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="password">Nova Senha</Label>
        <Input id="password" name="password" type="password" placeholder="Deixe em branco para manter" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A guardar...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  );
}