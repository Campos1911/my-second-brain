// src/config/env.ts

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url(
      "A variável NEXT_PUBLIC_API_URL deve ser uma URL válida (ex: http://localhost:3333).",
    )
    .min(1, "A variável NEXT_PUBLIC_API_URL é obrigatória."),
});

// Faz a leitura das variáveis expostas
const parseResult = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parseResult.success) {
  console.error(
    "❌ Erro de validação das variáveis de ambiente do Frontend:",
    JSON.stringify(parseResult.error.format(), null, 2),
  );
  throw new Error("Variáveis de ambiente do Frontend ausentes ou incorretas.");
}

export const env = parseResult.data;
