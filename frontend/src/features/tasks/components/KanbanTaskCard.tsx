"use client";

import { useState } from "react";
import { Task, TaskPriority } from "../types";
import { Calendar, Edit2, Trash2, GripVertical } from "lucide-react";

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  LOW: {
    label: "Baixa",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  MEDIUM: {
    label: "Média",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  HIGH: {
    label: "Alta",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

export function KanbanTaskCard({
  task,
  onEdit,
  onDelete,
}: KanbanTaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const priority = priorityConfig[task.priority];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700/50 transition-all duration-200 flex flex-col gap-3 group cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-30 border-primary-500/40 scale-95" : ""
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-zinc-650 shrink-0 group-hover:text-zinc-550 transition-colors" />
          <h4 className="font-semibold text-white text-sm group-hover:text-primary-500 transition-colors line-clamp-1">
            {task.title}
          </h4>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.color} shrink-0`}
        >
          {priority.label}
        </span>
      </div>

      {/* Descrição opcional */}
      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer com Metadados e Ações */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formatDate(task.startDate)} - {formatDate(task.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
            title="Editar tarefa"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 hover:bg-rose-500/10 rounded-md text-zinc-400 hover:text-rose-500 transition-colors"
            title="Excluir tarefa"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
