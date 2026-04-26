// 

import { redirect } from "next/navigation";

export default function RootPage() {
  // Sempre que alguém cair na raiz, manda para o login
  redirect("/login");
}