// src/features/fitness/components/SessionDetailModal.tsx

"use client";

import { useActiveSessionDetail } from "../hooks/useFitness";
import { X, Calendar, Clock, Dumbbell, Loader2 } from "lucide-react";
import { parseUTCToLocalDate } from "@/lib/utils";
import { SetLog } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
}: SessionDetailModalProps) {
  const { data: session, isLoading } = useActiveSessionDetail(sessionId);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end?: string | null) => {
    if (!end) return "Em andamento";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes} minutos`;
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
            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden text-zinc-100 z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold">Resumo do Treino</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Sessão arquivada</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-xs text-zinc-500">
                    Recuperando detalhes...
                  </p>
                </div>
              ) : !session ? (
                <p className="text-center text-zinc-500 text-sm">
                  Dados indisponíveis.
                </p>
              ) : (
                <>
                  {/* Cards de Info Rápida */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/40 border border-zinc-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold mb-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        Data do Treino
                      </div>
                      <span className="text-sm font-bold text-zinc-200">
                        {parseUTCToLocalDate(
                          session.startedAt,
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="bg-zinc-950/40 border border-zinc-800/60 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        Tempo Decorrido
                      </div>
                      <span className="text-sm font-bold text-zinc-200">
                        {getDuration(session.startedAt, session.finishedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes do Plano */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Exercícios & Cargas
                    </span>

                    <div className="space-y-3.5">
                      {/* Agrupa as séries de forma totalmente tipada */}
                      {(() => {
                        const logsMap = (session.setLogs || []).reduce<
                          Record<string, { name: string; sets: SetLog[] }>
                        >((acc, log) => {
                          const exerciseId = log.exerciseId;
                          if (!acc[exerciseId]) {
                            acc[exerciseId] = {
                              name: log.exercise?.name || "Exercício",
                              sets: [],
                            };
                          }

                          const currentItem = acc[exerciseId];
                          if (currentItem) {
                            currentItem.sets.push(log);
                          }

                          return acc;
                        }, {});

                        const items = Object.values(logsMap);

                        if (items.length === 0) {
                          return (
                            <div className="text-center py-6 text-xs text-zinc-500 italic">
                              Nenhuma série registrada nesta sessão.
                            </div>
                          );
                        }

                        return items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-zinc-950/30 border border-zinc-800/80 p-3.5 rounded-xl space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <Dumbbell className="w-4 h-4 text-purple-400" />
                              <span className="font-bold text-sm text-zinc-200">
                                {item.name}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {item.sets.map((set, setIdx) => (
                                <span
                                  key={set.id}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                                    set.toFailure
                                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                      : "bg-zinc-900 border-zinc-800/80 text-zinc-300"
                                  }`}
                                >
                                  S{setIdx + 1}: {Number(set.weight)}kg ×{" "}
                                  {set.reps}
                                </span>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 text-sm font-semibold rounded-xl transition-colors text-zinc-300 cursor-pointer"
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
