"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-xl flex flex-col items-center"
      >
        <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mb-6 border border-primary-500/30">
          {/* Logo Placeholder */}
          <div className="w-6 h-6 bg-primary-500 rounded-sm" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          {subtitle}
        </p>

        {children}
      </motion.div>
    </main>
  );
}
