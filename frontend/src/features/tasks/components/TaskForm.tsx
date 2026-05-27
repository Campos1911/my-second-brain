"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, CreateTaskDTO, Task } from "../types";
import { Loader2 } from "lucide-react";
import { PrioritySelect } from "./PrioritySelect";

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control, // Necessário para gerenciar o componente customizado com o Controller
    formState: { errors },
  } = useForm<CreateTaskDTO>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "MEDIUM",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split("T")[0]
        : "",
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split("T")[0]
        : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Título
        </label>
        <input
          type="text"
          {...register("title")}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors"
          placeholder="Ex: Estudar Next.js"
        />
        {errors.title && (
          <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Descrição (Opcional)
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
          placeholder="Detalhes sobre a tarefa..."
        />
        {errors.description && (
          <p className="text-xs text-rose-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Substituição do select nativo pelo componente customizado */}
      <div>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <PrioritySelect
              value={field.value}
              onChange={field.onChange}
              error={errors.priority?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Data de Início
          </label>
          <input
            type="date"
            {...register("startDate")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
          {errors.startDate && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Data de Término
          </label>
          <input
            type="date"
            {...register("endDate")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
          {errors.endDate && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Salvar Alterações" : "Criar Tarefa"}
        </button>
      </div>
    </form>
  );
}
