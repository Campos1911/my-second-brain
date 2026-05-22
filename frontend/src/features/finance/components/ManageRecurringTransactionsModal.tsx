// src/features/finance/components/ManageRecurringTransactionsModal.tsx

"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Play,
  Pause,
  Calendar,
  CreditCard,
  Wallet,
  RefreshCw,
} from "lucide-react";
import {
  useRecurringTransactions,
  useUpdateRecurringTransaction,
  useDeleteRecurringTransaction,
} from "../hooks/useFinance";
import { formatCurrency, parseUTCToLocalDate } from "@/lib/utils";
import { RecurrenceFrequency } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/Pagination";

interface ManageRecurringTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageRecurringTransactionsModal({
  isOpen,
  onClose,
}: ManageRecurringTransactionsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const LIMIT = 5;

  const { data: recurringData, isLoading } = useRecurringTransactions({
    page: currentPage,
    limit: LIMIT,
  });

  const { mutate: updateRecurring, isPending: isUpdating } =
    useUpdateRecurringTransaction();
  const { mutate: deleteRecurring, isPending: isDeleting } =
    useDeleteRecurringTransaction();

  const recurringList = recurringData?.data || [];
  const meta = recurringData?.meta || { total: 0, page: 1, lastPage: 1 };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateRecurring({
      id,
      data: { isActive: !currentStatus },
    });
  };

  const handleDeleteConfirm = (id: string) => {
    deleteRecurring(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
        if (recurringList.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      },
    });
  };

  const translateFrequency = (freq: RecurrenceFrequency) => {
    const translationMap: Record<RecurrenceFrequency, string> = {
      DAILY: "Diário",
      WEEKLY: "Semanal",
      BIWEEKLY: "Quinzenal",
      MONTHLY: "Mensal",
      YEARLY: "Anual",
    };
    return translationMap[freq] || freq;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold">
                  Transações Recorrentes
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listagem */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="space-y-4 py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-xs text-muted-foreground">
                    Buscando transações recorrentes...
                  </p>
                </div>
              ) : recurringList.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border/60 rounded-xl bg-card/20">
                  <RefreshCw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhuma recorrência ativa.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Crie recorrências no menu "Nova Transação" ao lado.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {recurringList.map((item) => {
                      const isConfirming = deleteConfirmId === item.id;
                      const formattedNextDate = parseUTCToLocalDate(
                        item.nextDate,
                      ).toLocaleDateString("pt-BR");
                      const isIncome = item.category?.type === "INCOME";

                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 transition-all ${
                            !item.isActive
                              ? "bg-muted/10 border-border/40 opacity-70"
                              : isConfirming
                                ? "bg-red-950/10 border-red-500/30"
                                : "bg-card hover:bg-muted/20 border-border/80"
                          }`}
                        >
                          {/* Lado Esquerdo: Info da recorrência */}
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  item.isActive
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                                }`}
                              >
                                {translateFrequency(item.frequency)}
                              </span>
                              {item.category && (
                                <span className="bg-muted/40 text-[10px] text-muted-foreground px-2 py-0.5 rounded-md border border-border/60 truncate max-w-32">
                                  {item.category.name}
                                </span>
                              )}
                            </div>

                            <p className="font-semibold text-foreground/95 text-sm sm:text-base break-all line-clamp-1">
                              {item.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Prox. {formattedNextDate}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {item.paymentMethod === "CREDIT" ? (
                                  <>
                                    <CreditCard className="w-3 h-3" /> Crédito
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="w-3 h-3" /> Débito
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Lado Direito: Ações */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                            <div className="text-left sm:text-right">
                              <p
                                className={`font-bold text-sm sm:text-base ${isIncome ? "text-emerald-500" : "text-foreground"}`}
                              >
                                {isIncome ? "+" : "-"}{" "}
                                {formatCurrency(item.amount)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isConfirming ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-red-400 text-xs flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                                    <AlertTriangle className="w-3 h-3" />
                                    Remover?
                                  </span>
                                  <button
                                    onClick={() => handleDeleteConfirm(item.id)}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      "Sim"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-muted hover:bg-muted/80 text-foreground text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleToggleStatus(item.id, item.isActive)
                                    }
                                    disabled={isUpdating}
                                    className={`p-2 rounded-lg transition-colors border ${
                                      item.isActive
                                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                    }`}
                                    title={
                                      item.isActive
                                        ? "Pausar recorrência"
                                        : "Ativar recorrência"
                                    }
                                  >
                                    {item.isActive ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play
                                        className="w-4 h-4"
                                        fill="currentColor"
                                      />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Remover recorrência"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}

              {/* Paginação */}
              <Pagination
                currentPage={currentPage}
                lastPage={meta.lastPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/80 bg-muted/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors text-foreground"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
