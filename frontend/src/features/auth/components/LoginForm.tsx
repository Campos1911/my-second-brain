"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { loginSchema, LoginDTO } from "../types";
import { useLogin } from "../hooks/useAuth";

export function LoginForm() {
  const { mutate: login, isPending, isError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginDTO) => login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            {...register("email")}
            type="email"
            placeholder="Seu e-mail"
            className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            {...register("password")}
            type="password"
            placeholder="Sua senha"
            className="w-full bg-background border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>

      {isError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-red-400 text-xs text-center block">
            Credenciais inválidas. Tente novamente.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-600 hover:bg-primary-500 text-primary-foreground py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-70"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
      </button>

      <div className="text-center text-xs text-muted-foreground mt-4">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-primary-500 hover:underline">
          Crie uma agora
        </Link>
      </div>
    </form>
  );
}
