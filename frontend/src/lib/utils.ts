import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário core para mesclar classes do Tailwind.
 * Essencial para o shadcn/ui e componentes customizados.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Converte uma string de data UTC do banco de dados para um objeto Date local,
 * mantendo o dia, mês e ano exatos informados pelo banco, anulando distorções de fuso horário.
 */
export function parseUTCToLocalDate(dateInput: string | Date): Date {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return new Date();
  }

  // Cria um objeto Date com as informações puras de UTC transpostas para o fuso local
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0, // Zera as horas para evitar distorções adicionais
  );
}
