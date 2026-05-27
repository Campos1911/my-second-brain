"use client";

import { Task, TaskPriority } from "../types";
import { Calendar, Edit2, Trash2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW: { label: "Baixa", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  MEDIUM: { label: "Média", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  HIGH: { label: "Alta", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/50 transition-all duration-200 flex flex-col justify-between gap-4 group"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-white text-base group-hover:text-primary-400 transition-colors line-clamp-1">
            {task.title}
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${priority.bg} ${priority.color} shrink-0`}>
            {priority.label}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formatDate(task.startDate)} - {formatDate(task.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Editar tarefa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
            title="Excluir tarefa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
