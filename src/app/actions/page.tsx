// src/app/actions/page.tsx
"use client";

import { useState } from 'react';
import { ActionDock } from '@/components/actions/ActionDock';
import { actionCategories } from '@/data/actionCategories';
import { AnimatePresence, motion } from 'framer-motion';

export default function ActionsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    // Usamos el mismo layout general que la HomePage para consistencia
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Aquí iría el AppHeader si lo necesitas en esta página */}
        {/* <AppHeader activeView={'actions'} setActiveView={() => {}} /> */}

        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Action & Automation Hub
        </h1>

        <ActionDock
          categories={actionCategories}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />

        {/* --- Placeholder para el Workspace que se mostrará al seleccionar una categoría --- */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 min-h-[400px]">
                <h2 className="font-semibold">
                  Workspace for: <span className="text-purple-600">{activeCategory}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  (Aquí irán las columnas de acciones y configuración...)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}