"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Wallet,
  CreditCard,
  Layers,
  Settings,
  RefreshCw,
} from "lucide-react";

import { TransactionList } from "@/features/finance/components/TransactionList";
import { CreateTransactionModal } from "@/features/finance/components/CreateTransactionModal";
import { EditTransactionModal } from "@/features/finance/components/EditTransactionModal";
import { ManageCategoriesModal } from "@/features/finance/components/ManageCategoriesModal";
import { ManageRecurringTransactionsModal } from "@/features/finance/components/ManageRecurringTransactionsModal";
import { MonthSelector } from "@/features/finance/components/MonthSelector";
import { FinanceSummary } from "@/features/finance/components/FinanceSummary";
import { CategoryFilter } from "@/features/finance/components/CategoryFilter";
import { Pagination } from "@/components/Pagination";

import {
  useTransactions,
  useTransactionSummary,
} from "@/features/finance/hooks/useFinance";
import { PaymentMethod, Transaction } from "@/features/finance/types";

const LIMIT_PER_PAGE = 10;

function FinanceDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Estados de controle dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isManageRecurringOpen, setIsManageRecurringOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

  // Estados de data e paginação
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Filtros a partir da URL
  const categoryParam = searchParams.get("categories");
  const selectedCategoryIds = categoryParam
    ? categoryParam.split(",").filter(Boolean)
    : [];

  const paymentMethodParam = searchParams.get(
    "paymentMethod",
  ) as PaymentMethod | null;

  const hasActiveFilters =
    selectedCategoryIds.length > 0 || !!paymentMethodParam;

  // Sincroniza página atual com a URL
  useEffect(() => {
    const pageInUrl = searchParams.get("page");
    if (pageInUrl) {
      setCurrentPage(Number(pageInUrl));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Hooks de busca de dados
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    isError: isTransactionsError,
  } = useTransactions({
    page: currentPage,
    limit: LIMIT_PER_PAGE,
    month: currentMonth,
    year: currentYear,
    categoryIds: selectedCategoryIds,
    paymentMethod: paymentMethodParam || undefined,
  });

  const { data: summaryData, isLoading: isLoadingSummary } =
    useTransactionSummary({
      month: currentMonth,
      year: currentYear,
      categoryIds: selectedCategoryIds,
      paymentMethod: paymentMethodParam || undefined,
    });

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta || { total: 0, page: 1, lastPage: 1 };

  // Manipuladores de Filtros e URL
  const updateUrlParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryChange = (newIds: string[]) => {
    setCurrentPage(1);
    updateUrlParams((params) => {
      if (newIds.length > 0) {
        params.set("categories", newIds.join(","));
      } else {
        params.delete("categories");
      }
      params.set("page", "1");
    });
  };

  const handlePaymentMethodChange = (method: "ALL" | PaymentMethod) => {
    setCurrentPage(1);
    updateUrlParams((params) => {
      if (method !== "ALL") {
        params.set("paymentMethod", method);
      } else {
        params.delete("paymentMethod");
      }
      params.set("page", "1");
    });
  };

  const handleClearAllFilters = () => {
    setCurrentPage(1);
    updateUrlParams((params) => {
      params.delete("categories");
      params.delete("paymentMethod");
      params.set("page", "1");
    });
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentPage(1);
    updateUrlParams((params) => {
      params.set("page", "1");
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams((params) => {
      params.set("page", String(page));
    });
  };

  return (
    <div className="space-y-5 sm:space-y-8 px-2 sm:px-0 py-3 sm:py-0 max-w-7xl mx-auto">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-4 sm:pb-0 sm:border-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Finanças
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie suas receitas, despesas e assinaturas.
          </p>
        </div>

        {/* Agrupamento de ações no mobile: Lado a Lado para economizar altura */}
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex-1 sm:flex-initial">
            <MonthSelector
              selectedDate={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium transition-colors shadow-lg shadow-purple-500/10 active:scale-[0.98] h-[44px] sm:h-auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Resumos Financeiros */}
      <div className="px-1 sm:px-0">
        <FinanceSummary summary={summaryData} isLoading={isLoadingSummary} />
      </div>

      {/* Configurações & Filtros de Categorias */}
      <section className="bg-card/30 border border-border/50 p-3 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Filtros & Painéis
          </h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsManageRecurringOpen(true)}
              className="p-2.5 hover:bg-muted text-muted-foreground hover:text-purple-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Gerenciar Transações Recorrentes"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Recorrências</span>
            </button>

            <button
              onClick={() => setIsManageCategoriesOpen(true)}
              className="p-2.5 hover:bg-muted text-muted-foreground hover:text-purple-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Gerenciar Categorias"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </button>
          </div>
        </div>

        {/* Componente de filtro de categoria */}
        <div className="pt-1 border-t border-border/30">
          <CategoryFilter
            selectedCategoryIds={selectedCategoryIds}
            onChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* Histórico e Listagem de Transações */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-foreground/90 px-1 sm:px-0">
            Transações do Mês
          </h2>

          {/* Filtro por Método de Pagamento - Tipo Segmentado otimizado para toque */}
          <div className="flex items-center gap-1 bg-card/60 border border-border/60 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => handlePaymentMethodChange("ALL")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                !paymentMethodParam
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Todos</span>
            </button>
            <button
              onClick={() => handlePaymentMethodChange("DEBIT")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                paymentMethodParam === "DEBIT"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>Débito</span>
            </button>
            <button
              onClick={() => handlePaymentMethodChange("CREDIT")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                paymentMethodParam === "CREDIT"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Crédito</span>
            </button>
          </div>
        </div>

        {/* Tabela de Transações - Padding reduzido no mobile para priorizar conteúdo */}
        <div className="bg-card/20 border border-border/80 rounded-2xl p-2 sm:p-6 overflow-hidden">
          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
            isError={isTransactionsError}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearAllFilters}
            onEdit={(transaction) => setTransactionToEdit(transaction)}
          />
        </div>

        {/* Paginação */}
        {meta.lastPage > 1 && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              lastPage={meta.lastPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {/* Modais */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditTransactionModal
        isOpen={!!transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        transaction={transactionToEdit}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      <ManageRecurringTransactionsModal
        isOpen={isManageRecurringOpen}
        onClose={() => setIsManageRecurringOpen(false)}
      />
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground text-sm">
          Carregando painel...
        </div>
      }
    >
      <FinanceDashboardContent />
    </Suspense>
  );
}
