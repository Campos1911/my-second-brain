"use client";

import { useDeleteTransaction } from "../hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
}

export function TransactionList({
  transactions,
  isLoading,
  isError,
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
      <div className="mt-6 flex flex-col items-center justify-center p-8 sm:p-12 bg-card/30 border border-dashed border-border rounded-2xl">
        <Wallet className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground text-center">
          Nenhuma transação neste mês.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 space-y-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((tx) => {
          const isIncome = tx.category?.type === "INCOME";

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-primary-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-2">
                <div
                  className={`p-2 rounded-full shrink-0 ${isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                >
                  {isIncome ? (
                    <ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base line-clamp-1">
                    {tx.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <span
                  className={`font-semibold text-sm sm:text-base ${isIncome ? "text-emerald-500" : "text-foreground"}`}
                >
                  {isIncome ? "+" : "-"} R$ {formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => deleteTx(tx.id)}
                  disabled={isDeleting}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-95"
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
