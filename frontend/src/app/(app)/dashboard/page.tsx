// Exemplo de integração em: src/app/finance/page.tsx (ou na sua página correspondente)
"use client";

import { useState } from "react";
import {
  useTransactions,
  useTransactionSummary,
} from "@/features/finance/hooks/useFinance";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { EditTransactionModal } from "@/features/finance/components/EditTransactionModal";
import { FinanceSummary } from "@/features/finance/components/FinanceSummary";
import { MonthSelector } from "@/features/finance/components/MonthSelector";
import { Transaction } from "@/features/finance/types";

export default function FinancePage() {
  // 1. Estado para controlar qual transação está sendo editada (null = modal fechado)
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

  // Estados de filtro de data padrão (mês/ano atual)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Queries para buscar transações e resumos
  const {
    data: transactionsData,
    isLoading,
    isError,
  } = useTransactions({
    page: 1,
    limit: 50,
    month: currentMonth,
    year: currentYear,
  });

  const { data: summaryData, isLoading: isLoadingSummary } =
    useTransactionSummary({
      month: currentMonth,
      year: currentYear,
    });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Cards de Resumo */}
      <FinanceSummary summary={summaryData} isLoading={isLoadingSummary} />

      {/* Listagem de Transações */}
      <div className="bg-card/30 border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Transações</h2>

        <TransactionList
          transactions={transactionsData?.data || []}
          isLoading={isLoading}
          isError={isError}
          hasActiveFilters={false}
          // 2. Passa a função para capturar a transação que foi clicada
          onEdit={(transaction) => setTransactionToEdit(transaction)}
        />
      </div>

      {/* 3. Renderiza o Modal de Edição na página */}
      <EditTransactionModal
        isOpen={!!transactionToEdit} // Aberto se houver uma transação selecionada
        onClose={() => setTransactionToEdit(null)} // Reseta o estado ao fechar
        transaction={transactionToEdit} // Passa os dados para popular o formulário
      />
    </div>
  );
}
