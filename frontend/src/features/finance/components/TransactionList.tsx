"use client";

import { useDeleteTransaction } from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Trash2,
  Wallet,
  FilterX,
} from "lucide-react";
import { formatCurrency, parseUTCToLocalDate } from "@/lib/utils";
import { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  isError,
  hasActiveFilters,
  onClearFilters,
}: TransactionListProps) {
  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4 sm:mt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-card border border-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 mt-6 text-sm">
        Erro ao carregar transações.
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center p-8 sm:p-12 bg-card/30 border border-dashed border-border rounded-2xl">
        {hasActiveFilters ? (
          <>
            <FilterX className="w-10 h-10 text-purple-500/50 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1 text-center">
              Nenhuma transação encontrada.
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Não existem registros para as categorias selecionadas neste
              período.
            </p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-medium px-4 py-2 rounded-lg transition-colors border border-purple-500/20"
              >
                Limpar Filtros aplicados
              </button>
            )}
          </>
        ) : (
          <>
            <Wallet className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma transação neste mês.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 space-y-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((tx) => {
          const isIncome = tx.category?.type === "INCOME";
          const localNormalizedDate = parseUTCToLocalDate(tx.date);

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-purple-500/30 transition-colors group"
            >
              {/* Lado Esquerdo: Ícone + Textos */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {isIncome ? (
                    <ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm sm:text-base line-clamp-1 break-all">
                    {tx.description}
                  </p>

                  {/* Container de Metadados corrigido com wrap e gap adaptativo */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 sm:mt-0.5 min-w-0">
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                      {localNormalizedDate.toLocaleDateString("pt-BR")}
                    </span>
                    {tx.category && (
                      <>
                        {/* Separador oculto em telas muito pequenas se houver quebra de linha */}
                        <span className="text-muted-foreground text-[10px] hidden xs:inline">
                          •
                        </span>
                        <span
                          title={tx.category.name}
                          className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-medium text-purple-400 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px]"
                        >
                          {tx.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Lado Direito: Valor + Botão Excluir */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-1">
                <span
                  className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                    isIncome ? "text-emerald-500" : "text-foreground"
                  }`}
                >
                  {isIncome ? "+" : "-"} R$ {formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => deleteTx(tx.id)}
                  disabled={isDeleting}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-95 shrink-0"
                  aria-label="Excluir transação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
