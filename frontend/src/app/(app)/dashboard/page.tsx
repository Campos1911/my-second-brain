"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { CreateTransactionModal } from "@/features/finance/components/CreateTransactionModal";
import { MonthSelector } from "@/features/finance/components/MonthSelector";
import { FinanceSummary } from "@/features/finance/components/FinanceSummary";
import { CategoryFilter } from "@/features/finance/components/CategoryFilter";
import {
  useTransactions,
  useTransactionSummary,
} from "@/features/finance/hooks/useFinance";
import { Pagination } from "@/components/Pagination";
import { Plus, Wallet, CreditCard, Layers } from "lucide-react";
import { PaymentMethod } from "@/features/finance/types";

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT_PER_PAGE = 10;

  // Ler as categorias vindas da URL (?categories=id1,id2)
  const categoryParam = searchParams.get("categories");
  const selectedCategoryIds = categoryParam
    ? categoryParam.split(",").filter(Boolean)
    : [];

  // Ler o método de pagamento vindo da URL (?paymentMethod=DEBIT)
  const paymentMethodParam = searchParams.get(
    "paymentMethod",
  ) as PaymentMethod | null;

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Sincronização e reset suave de filtros de categoria
  const handleCategoryChange = (newIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newIds.length > 0) {
      params.set("categories", newIds.join(","));
    } else {
      params.delete("categories");
    }

    params.set("page", "1"); // Reseta para a página 1 ao mudar de filtro
    setCurrentPage(1);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Sincronização do filtro de método de pagamento
  const handlePaymentMethodChange = (method: "ALL" | PaymentMethod) => {
    const params = new URLSearchParams(searchParams.toString());

    if (method !== "ALL") {
      params.set("paymentMethod", method);
    } else {
      params.delete("paymentMethod");
    }

    params.set("page", "1"); // Reseta para a página 1 ao mudar de filtro
    setCurrentPage(1);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categories");
    params.delete("paymentMethod");
    params.set("page", "1");
    setCurrentPage(1);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  // Sincroniza página atual caso venha da URL
  useEffect(() => {
    const pageInUrl = searchParams.get("page");
    if (pageInUrl) {
      setCurrentPage(Number(pageInUrl));
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Requisição 1: Listagem de Transações Paginadas
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

  // Requisição 2: Resumo Consolidado (Não Paginado, com os mesmos filtros)
  const { data: summaryData, isLoading: isLoadingSummary } =
    useTransactionSummary({
      month: currentMonth,
      year: currentYear,
      categoryIds: selectedCategoryIds,
      paymentMethod: paymentMethodParam || undefined,
    });

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta || { total: 0, page: 1, lastPage: 1 };
  const hasActiveFilters =
    selectedCategoryIds.length > 0 || !!paymentMethodParam;

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 py-4 sm:py-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Finanças</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie suas receitas e despesas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MonthSelector
            selectedDate={selectedDate}
            onChange={handleDateChange}
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <FinanceSummary summary={summaryData} isLoading={isLoadingSummary} />

      {/* Componente de Filtro de Categorias */}
      <section className="bg-card/40 border border-border/60 p-4 rounded-2xl">
        <CategoryFilter
          selectedCategoryIds={selectedCategoryIds}
          onChange={handleCategoryChange}
        />
      </section>

      {/* Lista de Transações */}
      <section>
        {/* Cabeçalho de Transações com Filtro por Forma de Pagamento */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground/80">
            Transações do Mês
          </h2>

          {/* Filtro Rápido - Payment Method Tabs */}
          <div className="flex items-center gap-1 bg-card border border-border/80 p-1 rounded-xl w-full sm:w-auto self-start sm:self-center">
            <button
              onClick={() => handlePaymentMethodChange("ALL")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !paymentMethodParam
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Todos
            </button>
            <button
              onClick={() => handlePaymentMethodChange("DEBIT")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paymentMethodParam === "DEBIT"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Débito
            </button>
            <button
              onClick={() => handlePaymentMethodChange("CREDIT")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                paymentMethodParam === "CREDIT"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Crédito
            </button>
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          isLoading={isLoadingTransactions}
          isError={isTransactionsError}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAllFilters}
        />

        {/* Adicionando Componente de Paginação */}
        <Pagination
          currentPage={currentPage}
          lastPage={meta.lastPage}
          onPageChange={handlePageChange}
        />
      </section>

      {/* Modais */}
      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Carregando painel...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
