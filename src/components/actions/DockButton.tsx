// src/components/actions/DockButton.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActionCategory } from '@/data/actionCategories';

interface DockButtonProps {
  category: ActionCategory;
  isActive: boolean;
  onClick: () => void;
}

export const DockButton = ({ category, isActive, onClick }: DockButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative h-auto rounded-full px-3 py-1.5 text-xs flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${isActive
          ? 'border-2 border-purple-400 text-purple-700 bg-purple-50'
          // Borde transparente para mantener el mismo tamaño y evitar saltos de layout
          : 'border-2 border-gray-300/50 text-gray-600 hover:bg-gray-100/80 hover:border-gray-400/50'
        }
      `}
    >
      {/* El icono siempre es visible y no se encoge */}
      <category.icon className="w-4 h-4 flex-shrink-0" />

      {/* El texto aparece y desaparece con animación */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto', marginLeft: '0.5rem' }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden whitespace-nowrap"
          >
            {category.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
};