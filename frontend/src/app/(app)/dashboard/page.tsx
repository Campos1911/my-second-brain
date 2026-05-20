"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { CreateTransactionModal } from "@/features/finance/components/CreateTransactionModal";
import { MonthSelector } from "@/features/finance/components/MonthSelector";
import { FinanceSummary } from "@/features/finance/components/FinanceSummary";
import { CategoryFilter } from "@/features/finance/components/CategoryFilter";
import { useTransactions } from "@/features/finance/hooks/useFinance";
import { Pagination } from "@/components/Pagination";
import { Plus } from "lucide-react";

// 1. Criamos um componente interno com a lógica da página
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

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Atualiza a URL mantendo um histórico limpo
  const handleCategoryChange = (newIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newIds.length > 0) {
      params.set("categories", newIds.join(","));
    } else {
      params.delete("categories");
    }

    params.set("page", "1"); // Reseta para a página 1 ao mudar de filtro
    setCurrentPage(1);

    // Navega suavemente sem reload completo
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

  // Hook consumindo os filtros dinâmicos e de categoria
  const { data, isLoading, isError } = useTransactions({
    page: currentPage,
    limit: LIMIT_PER_PAGE,
    month: currentMonth,
    year: currentYear,
    categoryIds: selectedCategoryIds,
  });

  const transactions = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

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
      <FinanceSummary transactions={transactions} />

      {/* Componente de Filtro de Categorias */}
      <section className="bg-card/40 border border-border/60 p-4 rounded-2xl">
        <CategoryFilter
          selectedCategoryIds={selectedCategoryIds}
          onChange={handleCategoryChange}
        />
      </section>

      {/* Lista de Transações */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground/80">
          Transações do Mês
        </h2>
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          isError={isError}
          hasActiveFilters={selectedCategoryIds.length > 0}
          onClearFilters={() => handleCategoryChange([])}
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

// 2. Exportamos a página padrão envolvendo o conteúdo em um Suspense boundary
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
