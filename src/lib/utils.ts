import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePhone(phone: string) {
  // Remove parênteses, espaços e traços, deixando apenas dígitos
  return phone.replace(/\D/g, "");
}