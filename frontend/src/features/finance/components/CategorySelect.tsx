"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Dumbbell,
  FolderOpen,
} from "lucide-react";
import { Category, CategoryType } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface CategorySelectProps {
  value?: string;
  onChange: (id: string) => void;
  categories: Category[];
  isLoading: boolean;
  error?: string;
}

export function CategorySelect({
  value,
  onChange,
  categories,
  isLoading,
  error,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<"up" | "down">("down");
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcula para qual direção o menu deve abrir baseado no espaço da tela
  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const minDropdownHeight = 260; // 256px de max-h + margem de segurança

      // Se faltar espaço abaixo e houver mais espaço acima, abre para cima
      if (spaceBelow < minDropdownHeight && spaceAbove > spaceBelow) {
        setDirection("up");
      } else {
        setDirection("down");
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Fecha o menu ao clicar fora do componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reseta a busca sempre que fechar/abrir
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const selectedCategory = categories.find((cat) => cat.id === value);

  // Filtra as categorias com base no input de busca
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Agrupa as categorias por tipo
  const groups: Record<CategoryType, Category[]> = {
    EXPENSE: filteredCategories.filter((c) => c.type === "EXPENSE"),
    INCOME: filteredCategories.filter((c) => c.type === "INCOME"),
    FITNESS: filteredCategories.filter((c) => c.type === "FITNESS"),
  };

  const typeMeta = {
    EXPENSE: { label: "Despesas", icon: ArrowDownLeft, color: "text-red-400" },
    INCOME: { label: "Receitas", icon: ArrowUpRight, color: "text-green-400" },
    FITNESS: { label: "Fitness", icon: Dumbbell, color: "text-purple-400" },
  };

  const hasResults = filteredCategories.length > 0;

  // Configuração das animações dependendo da direção do dropdown
  const motionConfig = {
    down: {
      initial: { opacity: 0, y: 4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 4 },
    },
    up: {
      initial: { opacity: 0, y: -4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
    },
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botão Gatilho (Trigger) */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`w-full flex items-center justify-between bg-background border rounded-lg px-3 py-2 text-sm text-left transition-all outline-none focus:ring-2 focus:ring-purple-600/50 ${
          error ? "border-red-500" : "border-border/80 hover:border-border"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={
            selectedCategory ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              {(() => {
                const Meta = typeMeta[selectedCategory.type];
                const Icon = Meta.icon;
                return <Icon className={`w-4 h-4 ${Meta.color}`} />;
              })()}
              {selectedCategory.name}
            </span>
          ) : (
            "Selecione uma categoria..."
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu com posicionamento inteligente */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={motionConfig[direction].initial}
            animate={motionConfig[direction].animate}
            exit={motionConfig[direction].exit}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-64 ${
              direction === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
          >
            {/* Campo de Busca */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/80">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar categoria..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                autoFocus
              />
            </div>

            {/* Listagem */}
            <div className="overflow-y-auto flex-1 py-1 divide-y divide-border/30">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Carregando categorias...
                </div>
              ) : !hasResults ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                  <FolderOpen className="w-6 h-6 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    Nenhuma categoria encontrada
                  </p>
                </div>
              ) : (
                (Object.keys(groups) as CategoryType[]).map((type) => {
                  const groupItems = groups[type];
                  if (groupItems.length === 0) return null;

                  const Meta = typeMeta[type];
                  const Icon = Meta.icon;

                  return (
                    <div key={type} className="p-1">
                      {/* Cabeçalho do Grupo */}
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/10 rounded-md mb-0.5">
                        <Icon className={`w-3 h-3 ${Meta.color}`} />
                        {Meta.label}
                      </div>

                      {/* Itens do Grupo */}
                      <ul className="space-y-0.5">
                        {groupItems.map((category) => {
                          const isSelected = category.id === value;
                          return (
                            <li key={category.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  onChange(category.id);
                                  setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                                  isSelected
                                    ? "bg-purple-600 text-white font-medium"
                                    : "hover:bg-muted text-foreground/90 hover:text-foreground"
                                }`}
                              >
                                <span>{category.name}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 shrink-0" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensagem de Erro */}
      {error && (
        <span className="text-red-500 text-xs mt-1 block">{error}</span>
      )}
    </div>
  );
}
