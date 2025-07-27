// src/components/actions/ActionWorkspace.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActionCategory } from '@/data/actionCategories';
import { ActionListColumn } from './ActionListColumn';
import { ActionConfigPanel } from './ActionConfigPanel';
import { ActionHistoryColumn } from './ActionHistoryColumn';
import { ActionDetailPanel } from './ActionDetailPanel';
import { actionHistory as initialHistory, ActionHistoryInstance } from '@/data/actionHistory';

interface ActionWorkspaceProps {
  category: ActionCategory;
}

type ViewMode = 'create' | 'history';

export function ActionWorkspace({ category }: ActionWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  const [history, setHistory] = useState<ActionHistoryInstance[]>(initialHistory);
  
  useEffect(() => {
    setSelectedActionId(null);
    setSelectedInstanceId(null);
  }, [category, viewMode]);

  const handleExecutionSuccess = (newHistoryItem: ActionHistoryInstance) => {
    setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
  };

  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 h-full flex flex-col">
      {/* --- CÓDIGO RESTAURADO AQUÍ --- */}
      <div className="flex-shrink-0 flex items-center space-x-2 border-b border-gray-200/80 dark:border-white/10 pb-4 mb-4">
        <Button
          variant={viewMode === 'create' ? 'default' : 'ghost'}
          onClick={() => setViewMode('create')}
          size="sm"
          className="rounded-full text-xs px-4"
        >
          Create Action
        </Button>
        <Button
          variant={viewMode === 'history' ? 'default' : 'ghost'}
          onClick={() => setViewMode('history')}
          size="sm"
          className="rounded-full text-xs px-4"
        >
          View History
        </Button>
      </div>
      {/* --- FIN DEL CÓDIGO RESTAURADO --- */}

      <div className="flex-1 min-h-0">
        {viewMode === 'create' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-12 md:col-span-5 lg:col-span-4 h-full">
              <ActionListColumn
                category={category}
                selectedActionId={selectedActionId}
                onActionSelect={setSelectedActionId}
              />
            </div>
            <div className="col-span-12 md:col-span-7 lg:col-span-8 h-full">
              <ActionConfigPanel
                selectedActionId={selectedActionId}
                onExecutionSuccess={handleExecutionSuccess}
              />
            </div>
          </div>
        )}

        {viewMode === 'history' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-12 md:col-span-5 lg:col-span-4 h-full">
              <ActionHistoryColumn
                category={category}
                history={history} 
                selectedInstanceId={selectedInstanceId}
                onInstanceSelect={setSelectedInstanceId}
              />
            </div>
            <div className="col-span-12 md:col-span-7 lg:col-span-8 h-full">
              <ActionDetailPanel instanceId={selectedInstanceId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}