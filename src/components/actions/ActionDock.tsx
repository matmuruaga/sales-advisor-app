// src/components/actions/ActionDock.tsx
"use client";

import { ActionCategory } from '@/data/actionCategories';
import { DockButton } from './DockButton'; // Importamos el nuevo componente

interface ActionDockProps {
  categories: ActionCategory[];
  activeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export function ActionDock({
  categories,
  activeCategory,
  onCategorySelect,
}: ActionDockProps) {
  return (
    // Este contenedor le da el aspecto de "barra encapsulada"
    <div className="flex items-center space-x-1 border border-gray-200/80 rounded-full p-1.5 bg-white/50 backdrop-blur-sm shadow-sm">
      {categories.map((category) => (
        <DockButton
          key={category.id}
          category={category}
          isActive={activeCategory === category.id}
          onClick={() =>
            onCategorySelect(activeCategory === category.id ? null : category.id)
          }
        />
      ))}
    </div>
  );
}