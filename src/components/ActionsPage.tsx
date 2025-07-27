"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionDock } from '@/components/actions/ActionDock';
import { actionCategories } from '@/data/actionCategories';
import { ActionWorkspace } from './actions/ActionWorkspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
// 1. Importar los nuevos componentes
import { MagicPromptModal } from '@/app/actions/MagicPromptModal';
import { LoadingOverlay } from './common/LoadingOverlay';


export function ActionsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(actionCategories[0].id);
  // 2. Añadir estados para el modal y el loader
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCategoryObject = actionCategories.find(c => c.id === activeCategory);

  const handleExecutePrompt = (prompt: string) => {
    console.log('Executing Magic Prompt:', prompt);
    // Activar la animación de carga
    setIsProcessing(true);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-center items-center flex-shrink-0 space-x-2">
        <ActionDock
          categories={actionCategories}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />
        {/* 3. Botón de la Varita Mágica */}
        <div className="relative">
            <div className="rounded-full bg-gradient-to-br from-purple-200 to-pink-300 p-px shadow-sm hover:shadow-lg transition-shadow">
                <Button onClick={() => setIsPromptOpen(true)} variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                </Button>
            </div>
            <Badge className="absolute -top-1 -right-10 text-xxs bg-purple-500 text-white border-purple-600">Beta</Badge>
        </div>
      </div>

      <div className="flex-1 mt-6 min-h-0">
        <AnimatePresence mode="wait">
          {selectedCategoryObject && (
            <motion.div
              key={selectedCategoryObject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              <ActionWorkspace category={selectedCategoryObject} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Renderizar los componentes modales */}
      <MagicPromptModal 
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onExecute={handleExecutePrompt}
      />
      <LoadingOverlay 
        isProcessing={isProcessing}
        onComplete={() => setIsProcessing(false)}
      />
    </div>
  );
}