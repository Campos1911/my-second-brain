// src/features/fitness/components/SetLogRow.tsx

"use client";

import { useState } from "react";
import { SetLog } from "../types";
import { Trash2, Check, Flame, Edit2, Loader2 } from "lucide-react";

interface SetLogRowProps {
  setLog: SetLog;
  index: number;
  onUpdate: (
    setId: string,
    data: { reps: number; weight: number; toFailure: boolean },
  ) => void;
  onDelete: (setId: string) => void;
  isMutating?: boolean;
}

export function SetLogRow({
  setLog,
  index,
  onUpdate,
  onDelete,
  isMutating = false,
}: SetLogRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [reps, setReps] = useState(setLog.reps);
  const [weight, setWeight] = useState(Number(setLog.weight));
  const [toFailure, setToFailure] = useState(setLog.toFailure);

  const handleSave = () => {
    onUpdate(setLog.id, { reps, weight, toFailure });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Identificador de Série */}
        <span className="w-6 h-6 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        {/* Inputs / Visualizadores */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-center text-zinc-100 font-bold focus:outline-none focus:border-purple-500"
              title="Peso"
            />
            <span className="text-xs text-zinc-500">kg</span>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-12 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-center text-zinc-100 font-bold focus:outline-none focus:border-purple-500"
              title="Repetições"
            />
            <span className="text-xs text-zinc-500">reps</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200">
            <span>{Number(setLog.weight)} kg</span>
            <span className="text-zinc-500 text-xs">×</span>
            <span>{setLog.reps} reps</span>
          </div>
        )}
      </div>

      {/* Flag de Falha Muscular e Ações */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isEditing ? (
          <button
            type="button"
            onClick={() => setToFailure(!toFailure)}
            className={`p-1.5 rounded-lg border transition-colors ${toFailure ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-zinc-900 border-zinc-800 text-zinc-600"}`}
          >
            <Flame className="w-4 h-4 fill-current" />
          </button>
        ) : (
          setLog.toFailure && (
            <span className="text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              Falha
            </span>
          )
        )}

        {isEditing ? (
          <button
            onClick={handleSave}
            disabled={isMutating}
            className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors"
          >
            {isMutating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(setLog.id)}
              disabled={isMutating}
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
