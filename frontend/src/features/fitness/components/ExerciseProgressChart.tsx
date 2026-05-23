// src/features/fitness/components/ExerciseProgressChart.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fitnessService } from "../services/fitnessService";
import { Loader2, TrendingUp, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ExerciseProgressChartProps {
  exerciseId: string;
}

export function ExerciseProgressChart({
  exerciseId,
}: ExerciseProgressChartProps) {
  const [metric, setMetric] = useState<"WEIGHT" | "VOLUME">("WEIGHT");

  const { data, isLoading } = useQuery({
    queryKey: ["exercise-progress", exerciseId],
    queryFn: () => fitnessService.getExerciseProgress(exerciseId),
    enabled: !!exerciseId,
  });

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
        <p className="text-xs text-zinc-500">
          Analisando histórico de cargas...
        </p>
      </div>
    );
  }

  const history = data?.history || [];

  if (history.length === 0) {
    return (
      <div className="h-64 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <HelpCircle className="w-8 h-8 text-zinc-600 mb-2" />
        <h4 className="font-bold text-sm text-zinc-400">
          Dados de evolução indisponíveis
        </h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
          Registre séries de execução para o exercício "{data?.exercise.name}"
          em sessões concluídas para ativar o dashboard evolutivo.
        </p>
      </div>
    );
  }

  // Define os valores do eixo Y com base no tipo de métrica
  const points = history.map((item) => ({
    dateStr: new Date(item.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: metric === "WEIGHT" ? item.weight : item.volume,
  }));

  const yValues = points.map((p) => p.value);
  const maxVal = Math.max(...yValues, 10);
  const minVal = Math.min(...yValues, 0);
  const range = maxVal - minVal || 10;

  // Dimensões do Gráfico SVG
  const width = 500;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Mapeia coordenadas x, y estruturadas para o SVG
  const svgPoints = points.map((p, i) => {
    const x = paddingLeft + (i / (points.length - 1 || 1)) * chartWidth;
    const y =
      paddingTop + chartHeight - ((p.value - minVal) / range) * chartHeight;
    return { x, y, value: p.value, dateStr: p.dateStr };
  });

  // Gera o caminho (path) d do SVG para a linha do gráfico
  const linePath = svgPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Gera o caminho para a área preenchida abaixo da linha
  const areaPath =
    svgPoints.length > 0
      ? `${linePath} L ${svgPoints[svgPoints.length - 1]!.x} ${paddingTop + chartHeight} L ${svgPoints[0]!.x} ${paddingTop + chartHeight} Z`
      : "";

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl space-y-4">
      {/* Header do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Gráfico de Desempenho
          </span>
          <h4 className="font-bold text-sm text-zinc-100 truncate mt-0.5">
            {data?.exercise.name}
          </h4>
        </div>

        {/* Seletores de Métrica */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => setMetric("WEIGHT")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              metric === "WEIGHT"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Carga Máxima (kg)
          </button>
          <button
            onClick={() => setMetric("VOLUME")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              metric === "VOLUME"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Volume Total
          </button>
        </div>
      </div>

      {/* Gráfico SVG Dinâmico */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Definições de Gradiente */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade e Eixo Y */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const val = maxVal - ratio * range;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#27272a"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#71717a"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Área Preenchida com Gradiente */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#chartGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Linha do Gráfico */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {/* Pontos Interativos (Bolinhas) */}
          {svgPoints.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#09090b"
                stroke="#a855f7"
                strokeWidth="2.5"
                className="cursor-pointer"
              />
              {/* Data no Eixo X */}
              {(i === 0 ||
                i === svgPoints.length - 1 ||
                points.length <= 5) && (
                <text
                  x={p.x}
                  y={height - 2}
                  fill="#52525b"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.dateStr}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
