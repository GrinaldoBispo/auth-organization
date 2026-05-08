// src/components/appointments/agenda-menu.tsx

"use client"

import { useState } from "react"
import { MoreVertical, Edit2, Trash2, Clock, Globe, Ban } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScheduleGroupModal } from "@/components/staff/schedule-group-modal"

interface AgendaMenuProps {
  staff: any[]
  agenda: any
  onSuccess?: () => void
  onOpenChange?: (open: boolean) => void // Definido na interface
}

// ADICIONE onOpenChange AQUI NA DESESTRUTURAÇÃO:
export function AgendaMenu({ staff, agenda, onSuccess, onOpenChange }: AgendaMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleModalOpenChange = (isOpen: boolean) => {
    setModalOpen(isOpen);
    // Agora o TypeScript vai encontrar o onOpenChange corretamente
    if (onOpenChange) onOpenChange(isOpen); 
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button className="p-1 hover:bg-zinc-200 rounded-md transition-colors outline-none opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-3 w-3 text-zinc-400" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-zinc-100 p-1">
          <DropdownMenuItem 
            onSelect={() => handleModalOpenChange(true)}
            className="gap-2 text-zinc-600 cursor-pointer rounded-lg"
          >
            <Edit2 className="h-4 w-4 text-zinc-400" /> 
            Editar agenda
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2 text-zinc-600 cursor-pointer rounded-lg" onSelect={() => setMenuOpen(false)}>
            <Clock className="h-4 w-4" /> Adicionar horário
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-2 text-zinc-600 cursor-pointer rounded-lg" onSelect={() => setMenuOpen(false)}>
            <Ban className="h-4 w-4" /> Excluir/Bloquear horários
          </DropdownMenuItem>

          <DropdownMenuItem className="gap-2 text-zinc-600 cursor-pointer rounded-lg" onSelect={() => setMenuOpen(false)}>
            <Globe className="h-4 w-4" /> Agenda online
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100" />
          
          <DropdownMenuItem 
            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg"
            onSelect={() => setMenuOpen(false)}
          >
            <Trash2 className="h-4 w-4" /> Excluir agenda
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ScheduleGroupModal 
        staff={staff} 
        initialData={agenda} 
        open={modalOpen} 
        onOpenChange={handleModalOpenChange}
        variant="none" 
        onSuccess={onSuccess} 
      />
    </>
  )
}