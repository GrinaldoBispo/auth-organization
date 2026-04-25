// src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/auth" // Importa os handlers que definimos no src/auth.ts
export const { GET, POST } = handlers