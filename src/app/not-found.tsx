// src/app/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 px-4">
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <FileQuestion className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-zinc-900">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-800">Página não encontrada</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Ops! Parece que o caminho que você tentou acessar não existe ou foi movido.
          </p>
        </div>

        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/">
            Voltar para o Início
          </Link>
        </Button>
      </div>
    </div>
  );
}