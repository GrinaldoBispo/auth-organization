// src/components/shared/page-header.tsx

"use client"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  // Mudamos aqui para aceitar o elemento já renderizado
  icon?: React.ReactNode 
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-6 mb-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Renderiza o ícone diretamente se ele existir */}
            {icon && <div className="text-blue-600">{icon}</div>}
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-sm text-zinc-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
      <Separator className="bg-zinc-100" />
    </div>
  )
}