"use client";

import { useState } from "react";
import { Task, TaskStatus } from "../types";
import { KanbanTaskCard } from "./KanbanTaskCard";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveTask: (id: string, status: TaskStatus) => void;
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onEdit,
  onDelete,
  onMoveTask,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const borderColors: Record<TaskStatus, string> = {
    TODO: "border-t-zinc-700",
    IN_PROGRESS: "border-t-amber-500/80",
    DONE: "border-t-emerald-500/80",
  };

  const headerTextColors: Record<TaskStatus, string> = {
    TODO: "text-zinc-300",
    IN_PROGRESS: "text-amber-400",
    DONE: "text-emerald-400",
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[285px] sm:min-w-[310px] bg-zinc-950/20 border border-zinc-900 rounded-2xl flex flex-col max-h-[70vh] transition-all snap-start ${
        isDragOver
          ? "bg-zinc-900/30 border-primary-500/25 shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/10 scale-[1.01]"
          : ""
      }`}
    >
      {/* Coluna Header */}
      <div
        className={`px-4 py-3 border-b border-zinc-900 border-t-4 ${borderColors[status]} rounded-t-2xl flex items-center justify-between shrink-0`}
      >
        <span
          className={`font-bold text-xs uppercase tracking-wider ${headerTextColors[status]}`}
        >
          {title}
        </span>
        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-bold">
          {tasks.length}
        </span>
      </div>

      {/* Lista de Cards da Coluna */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 no-scrollbar min-h-[160px]">
        {tasks.length === 0 ? (
          <div className="h-full min-h-[140px] flex items-center justify-center py-6 text-center border border-dashed border-zinc-900 rounded-xl">
            <span className="text-xs text-zinc-600">
              Nenhuma tarefa nesta etapa
            </span>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
