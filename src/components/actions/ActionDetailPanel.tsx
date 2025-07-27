"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { actionHistory } from '@/data/actionHistory';
// 1. Importar los nuevos componentes
import { AiSummary } from '@/app/actions/forms/AiSummary';
import { InteractivePrompt } from '@/app/actions/forms/InteractivePrompt';

interface ActionDetailPanelProps {
  instanceId: string | null;
}

export function ActionDetailPanel({ instanceId }: ActionDetailPanelProps) {
  const instance = actionHistory.find(inst => inst.id === instanceId);

  // Estado de 'placeholder' si no hay ninguna instancia seleccionada
  if (!instance) {
    return (
      <Card className="h-full w-full bg-gray-50/50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Select a past action to view its details</p>
        </div>
      </Card>
    );
  }

  return (
    // 2. El Card ahora es un flex container vertical
    <Card className="h-full w-full bg-gray-50/50 flex flex-col overflow-hidden">
      <motion.div
        key={instance.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full"
      >
        {/* 3. El área de resumen ocupa el espacio superior y tiene su propio scroll si es necesario */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AiSummary instance={instance} />
        </div>
        
        {/* 4. El prompt interactivo se ancla en la parte inferior */}
        <div className="flex-shrink-0">
          <InteractivePrompt />
        </div>
      </motion.div>
    </Card>
  );
}