"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Plus,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Dumbbell,
} from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "../hooks/useFinance";
import {
  createCategorySchema,
  CreateCategoryDTO,
  Category,
  CategoryType,
} from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageCategoriesModal({
  isOpen,
  onClose,
}: ManageCategoriesModalProps) {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  // Estados locais para controlar exclusões e alternar exibição de criação inline
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryType>("EXPENSE");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryDTO>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { type: "EXPENSE" },
  });

  const onSubmit = (data: CreateCategoryDTO) => {
    createCategory(data, {
      onSuccess: () => {
        reset();
        setShowAddForm(false);
      },
    });
  };

  const handleDeleteInitiate = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteCategory(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
  };

  // Filtragem de categorias locais por tipo de aba ativa
  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  const tabMeta = {
    EXPENSE: {
      label: "Despesas",
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      icon: ArrowDownLeft,
    },
    INCOME: {
      label: "Receitas",
      color: "text-green-400 bg-green-500/10 border-green-500/20",
      icon: ArrowUpRight,
    },
    FITNESS: {
      label: "Fitness",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      icon: Dumbbell,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-foreground">
                  Gerenciar Categorias
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas por tipo */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-muted/40 border-b border-border/60">
              {(Object.keys(tabMeta) as CategoryType[]).map((type) => {
                const Icon = tabMeta[type].icon;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveTab(type);
                      setDeleteConfirmId(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                      activeTab === type
                        ? "bg-background text-foreground shadow-sm border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tabMeta[type].label}
                  </button>
                );
              })}
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Seção do Formulário Inline */}
              <AnimatePresence initial={false}>
                {showAddForm ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nova Categoria de {tabMeta[activeTab].label}
                      </h3>
                      <input
                        type="hidden"
                        value={activeTab}
                        {...register("type")}
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            {...register("name")}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="Ex: Supermercado, Salário..."
                            autoFocus
                          />
                          {errors.name && (
                            <span className="text-red-500 text-[11px] mt-1 block">
                              {errors.name.message}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddForm(false);
                              reset();
                            }}
                            className="px-3 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors text-foreground"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            {isCreating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Salvar"
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => {
                      reset({ type: activeTab });
                      setShowAddForm(true);
                    }}
                    className="w-full py-2.5 border border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/[0.02] text-xs font-medium rounded-xl text-muted-foreground hover:text-purple-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Categoria de {tabMeta[activeTab].label}
                  </button>
                )}
              </AnimatePresence>

              {/* Lista de Categorias do Tipo Ativo */}
              {isLoading ? (
                <div className="space-y-2 py-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-xs text-muted-foreground">
                    Buscando categorias...
                  </p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-card/20">
                  <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhuma categoria criada.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Crie uma para organizar suas finanças.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {filteredCategories.map((category) => {
                      const isConfirming = deleteConfirmId === category.id;
                      return (
                        <motion.li
                          key={category.id}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isConfirming
                              ? "bg-red-950/10 border-red-500/30"
                              : "bg-card hover:bg-muted/20 border-border/80"
                          }`}
                        >
                          <span className="text-sm font-medium text-foreground/95">
                            {category.name}
                          </span>

                          <div className="flex items-center gap-1">
                            {isConfirming ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-red-400 text-xs flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                                  <AlertTriangle className="w-3 h-3" />
                                  Excluir?
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteConfirm(category.id)
                                  }
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "Sim"
                                  )}
                                </button>
                                <button
                                  onClick={handleDeleteCancel}
                                  className="bg-muted hover:bg-muted/80 text-foreground text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDeleteInitiate(category.id)
                                }
                                className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Deletar categoria"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/80 bg-muted/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors text-foreground"
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
