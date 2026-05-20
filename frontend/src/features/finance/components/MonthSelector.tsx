"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ selectedDate, onChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    onChange(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    onChange(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
    );
  };

  const formattedMonth = selectedDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between sm:justify-start gap-4 bg-card/50 border border-border/60 px-4 py-2.5 rounded-xl w-full sm:w-auto">
      <button
        onClick={handlePrevMonth}
        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground active:scale-95"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-semibold capitalize flex-1 sm:flex-none sm:min-w-30 text-center text-foreground">
        {formattedMonth}
      </span>
      <button
        onClick={handleNextMonth}
        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground active:scale-95"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
