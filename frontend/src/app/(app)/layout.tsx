"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Wallet,
  Dumbbell,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Módulos futuros e ativos do Second Brain
  const navigation: NavigationItem[] = [
    { name: "Finanças", href: "/dashboard", icon: Wallet, enabled: true },
    { name: "Academia", href: "/fitness", icon: Dumbbell, enabled: true },
    { name: "Estudos", href: "/studies", icon: GraduationCap, enabled: false },
  ];

  const handleToggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex">
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-zinc-900 border-r border-border p-6 justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-primary-600/10 text-primary-500 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Second Brain
            </span>
          </div>

          {/* Itens de Navegação */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              if (!item.enabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3 py-2.5 text-zinc-600 rounded-xl cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-semibold border border-zinc-700/30">
                      Breve
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "text-primary-500 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/20"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 shrink-0 relative z-10 transition-colors ${isActive ? "text-primary-500" : "group-hover:text-foreground"}`}
                  />
                  <span className="text-sm relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar - Sair */}
        <div className="border-t border-border/60 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* 2. MENU MOBILE */}
      {/* Barra superior fixa */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-border px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-600/10 text-primary-500 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight">Second Brain</span>
        </div>
        <button
          onClick={handleToggleMobileMenu}
          className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Gaveta Lateral Deslizante */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleMobileMenu}
              className="lg:hidden fixed inset-0 bg-black z-40"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-zinc-900 border-r border-border p-6 z-50 flex flex-col justify-between"
            >
              <div className="space-y-8">
                {/* Logo e Botão fechar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-600/10 text-primary-500 rounded-xl">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg">Second Brain</span>
                  </div>
                  <button
                    onClick={handleToggleMobileMenu}
                    className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Itens de Navegação Mobile */}
                <nav className="space-y-1.5">
                  {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    if (!item.enabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between px-3 py-2.5 text-zinc-600 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-semibold border border-zinc-700/30">
                            Breve
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          isActive
                            ? "bg-primary-500/10 text-primary-500 font-semibold border border-primary-500/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Botão Sair Mobile */}
              <div className="border-t border-border/60 pt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
