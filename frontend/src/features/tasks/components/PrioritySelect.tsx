"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { TaskPriority } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface PriorityOption {
  value: TaskPriority;
  label: string;
  color: string;
  bg: string;
  dotColor: string;
}

const priorityOptions: PriorityOption[] = [
  {
    value: "LOW",
    label: "Baixa",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  {
    value: "MEDIUM",
    label: "Média",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  {
    value: "HIGH",
    label: "Alta",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
];

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
  error?: string;
}

export function PrioritySelect({
  value,
  onChange,
  error,
}: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOption =
    priorityOptions.find((opt) => opt.value === value) || priorityOptions[1]; // Fallback para MEDIUM

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        Prioridade
      </label>

      {/* Botão Gatilho (Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between bg-zinc-900 border rounded-xl px-4 py-2.5 text-sm transition-all outline-none focus:border-primary-500 ${
          error
            ? "border-rose-500"
            : "border-zinc-800/80 hover:border-zinc-700/50"
        } cursor-pointer`}
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${selectedOption.dotColor}`} />
          <span className="font-medium text-white">{selectedOption.label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown de Opções */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1"
          >
            <ul className="space-y-0.5">
              {priorityOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        isSelected
                          ? "bg-zinc-900 text-white font-medium"
                          : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                      } cursor-pointer`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${option.dotColor}`}
                        />
                        <span>{option.label}</span>
                      </span>

                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exibição de Erro */}
      {error && (
        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
