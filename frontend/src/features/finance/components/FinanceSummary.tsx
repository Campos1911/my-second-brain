"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "../types";

interface FinanceSummaryProps {
  transactions: Transaction[];
}

export function FinanceSummary({ transactions }: FinanceSummaryProps) {
  const totals = transactions.reduce(
    (acc, tx) => {
      // Força a conversão do valor para número de forma segura
      const amount = Number(tx.amount) || 0;
      const isIncome = tx.category?.type === "INCOME";

      if (isIncome) {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const balance = totals.income - totals.expense;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card Saldo Disponível */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden p-4 sm:p-6 bg-card border border-border rounded-2xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-muted-foreground mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-medium">
            Saldo Disponível
          </span>
          <div className="p-2 bg-primary-500/10 text-primary-500 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight ${balance >= 0 ? "text-foreground" : "text-rose-500"}`}
          >
            R$ {formatCurrency(balance)}
          </h3>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* Card Entradas */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="p-4 sm:p-6 bg-card border border-border rounded-2xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-muted-foreground mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-medium">Receitas</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-500">
            + R$ {formatCurrency(totals.income)}
          </h3>
        </div>
      </motion.div>

      {/* Card Saídas */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="p-4 sm:p-6 bg-card border border-border rounded-2xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-muted-foreground mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-medium">Despesas</span>
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
            - R$ {formatCurrency(totals.expense)}
          </h3>
        </div>
      </motion.div>
    </div>
  );
}
