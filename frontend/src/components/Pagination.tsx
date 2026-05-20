"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-border bg-card/50 hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm text-muted-foreground px-2">
        Página{" "}
        <span className="font-medium text-foreground">{currentPage}</span> de{" "}
        <span className="font-medium text-foreground">{lastPage}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-2 border border-border bg-card/50 hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
