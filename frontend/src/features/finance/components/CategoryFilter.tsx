"use client";

import { useCategories } from "../hooks/useFinance";
import { X } from "lucide-react";

interface CategoryFilterProps {
  selectedCategoryIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryFilter({
  selectedCategoryIds,
  onChange,
}: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useCategories();

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onChange(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      onChange([...selectedCategoryIds, categoryId]);
    }
  };

  const handleClearFilters = () => {
    onChange([]);
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-card border border-border rounded-full animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Filtrar por Categoria
        </span>
        {selectedCategoryIds.length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => handleToggleCategory(category.id)}
              className="shrink-0 outline-none"
            >
              {/* Substituído de <Badge> para uma span estilizada com Tailwind */}
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-normal transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-500 hover:bg-purple-500 shadow-md shadow-purple-500/15"
                    : "bg-card hover:bg-white/5 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
