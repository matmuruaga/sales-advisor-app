"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { availableActions } from '@/data/availableActions';
import { Zap, Send, Loader2, CheckCircle } from 'lucide-react';
import { ActionHistoryInstance } from '@/data/actionHistory';
// Usando la ruta de importación correcta
import { ScheduleMeetingForm } from '@/app/actions/forms/ScheduleMeetingForm'; 
import { GenerateProposalForm } from '@/app/actions/forms/GenerateProposalForm';
import { GenerateCallScriptForm } from '@/app/actions/forms/GenerateCallScriptForm';
import { GenerateTeamBriefingForm } from '@/app/actions/forms/GenerateTeamBriefingForm';
import { UpdateCrmOpportunityForm } from '@/app/actions/forms/UpdateCrmOpportunityForm';

interface ActionConfigPanelProps {
  selectedActionId: string | null;
  onExecutionSuccess: (newItem: ActionHistoryInstance) => void;
}

export function ActionConfigPanel({ selectedActionId, onExecutionSuccess }: ActionConfigPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  
  const getActionDetails = () => {
    if (!selectedActionId) return null;
    for (const categoryKey in availableActions) {
      const action = availableActions[categoryKey].find(a => a.id === selectedActionId);
      if (action) return action;
    }
    return null;
  };

  const actionDetails = getActionDetails();

  const handleExecute = () => {
    if (!actionDetails) return;
    setIsExecuting(true);
    setExecutionResult(null);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult({ status: 'success', message: `'${actionDetails.title}' executed successfully!` });
      const newHistoryItem: ActionHistoryInstance = {
        id: `hist-${Date.now()}`,
        actionId: actionDetails.id,
        category: Object.keys(availableActions).find(key => availableActions[key].some(action => action.id === actionDetails.id)) || 'unknown',
        timestamp: new Date().toISOString(),
        status: 'Completed',
        target: 'Simulated Target',
        summary: `Action '${actionDetails.title}' was run successfully.`,
      };
      onExecutionSuccess(newHistoryItem);

      setTimeout(() => { setExecutionResult(null); }, 4000);
    }, 2000);
  };

   const renderForm = () => {
    switch (selectedActionId) {
      case 'schedule-meeting':
        return <ScheduleMeetingForm />;
      case 'generate-proposal':
        return <GenerateProposalForm />;
      case 'generate-call-script':
        return <GenerateCallScriptForm />;
      case 'generate-team-briefing':
        return <GenerateTeamBriefingForm />;

      // 2. Añadir el caso para el último formulario
      case 'update-crm-opportunity':
        return <UpdateCrmOpportunityForm />;
      
      default:
        return <p className="text-sm text-center text-gray-500 p-8">Esta acción no requiere configuración o su formulario aún no ha sido implementado.</p>;
    }
  };


  return (
    // 1. El contenedor principal ahora es RELATIVO para que los hijos absolutos se posicionen respecto a él.
    <Card className="h-full w-full bg-gray-50/50 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!actionDetails ? (
          <motion.div key="placeholder" /* ... */ >
            <div className="text-center text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Select an action to configure it</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key={selectedActionId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            
            {/* 2. La cabecera se posiciona normalmente */}
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <actionDetails.icon className="w-4 h-4 mr-2" />
                Configure: {actionDetails.title}
              </CardTitle>
            </CardHeader>
            
            {/* --- ESTRUCTURA DE SCROLL CON POSICIONAMIENTO ABSOLUTO --- */}
            {/* 3. El contenido del formulario es ABSOLUTO y se estira entre la cabecera y el pie de página */}
            <div className="absolute top-[70px] bottom-[90px] left-0 right-0 overflow-y-auto px-6">
              <div className="pb-6">
                 {renderForm()}
              </div>
            </div>
            
            {/* 4. El pie de página es ABSOLUTO y se ancla a la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 pt-4 border-t px-6 pb-6 bg-gray-50/50 backdrop-blur-sm">
              <Button onClick={handleExecute} disabled={isExecuting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg">
                {isExecuting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isExecuting ? 'Executing...' : 'Execute Action'}
              </Button>
              
              <AnimatePresence>
                {executionResult && (
                  <motion.div /* ... */ className="mt-2 text-xs flex items-center justify-center p-2 rounded-md bg-green-50 text-green-700">
                    <CheckCircle className="w-3.5 h-3.5 mr-2" />
                    {executionResult.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* --- FIN DE LA ESTRUCTURA --- */}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}