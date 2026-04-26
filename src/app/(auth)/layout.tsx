import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-zinc-50">
      
      {/* Lado Esquerdo: Área do Formulário */}
      <main className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white shadow-2xl z-10">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Lado Direito: Branding e Destaque (Visível apenas em Desktop) */}
      <section className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 p-12 text-white relative overflow-hidden">
        
        {/* Pattern Decorativo (Grid) */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Círculos de brilho decorativos */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm text-center space-y-6">
          <div className="inline-block p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
            {/* Espaço para o LOGO do seu Gestor Financeiro no futuro */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl shadow-lg">
              G
            </div>
          </div>
          
          <h2 className="text-4xl font-extrabold tracking-tight">
            Gestor Financeiro Pro
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Controle suas finanças de onde estiver com segurança de nível bancário e interface intuitiva.
          </p>
        </div>
        
        {/* Rodapé Informativo */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-blue-200/80 text-xs">
          <p>© 2026 Grinaldo Bispo - Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-white cursor-pointer transition-colors">Termos</span>
          </div>
        </div>
      </section>
    </div>
  );
}