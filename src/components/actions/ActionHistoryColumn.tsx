"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { availableActions } from "@/data/availableActions";
import { ActionCategory } from "@/data/actionCategories";
import { Calendar, Filter } from "lucide-react";
import { ActionHistoryInstance } from "@/data/actionHistory";

interface ActionHistoryColumnProps {
  category: ActionCategory;
  history: ActionHistoryInstance[];
  selectedInstanceId: string | null;
  onInstanceSelect: (instanceId: string) => void;
}

export function ActionHistoryColumn({
  category,
  history,
  selectedInstanceId,
  onInstanceSelect,
}: ActionHistoryColumnProps) {
  const filteredHistory = history.filter(inst => inst.category === category.id);

  const getActionTitle = (actionId: string) => {
    for (const cat in availableActions) {
      const action = availableActions[cat].find(a => a.id === actionId);
      if (action) return action.title;
    }
    return "Unknown Action";
  };
  
  return (
    <div className="h-full flex flex-col">
        {/* Filtros */}
        <div className="flex-shrink-0 mb-4 pb-4 border-b border-gray-200/80">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center"><Filter className="w-3 h-3 mr-1.5"/>Filters</h4>
            {/* Aquí iría un componente de calendario real, por ahora es un placeholder */}
            <div className="p-2 border rounded-md text-sm text-gray-700 bg-white/50">
                <Calendar className="w-4 h-4 mr-2 inline-block"/>
                <span>Date Range: Last 30 days</span>
            </div>
        </div>
        
        {/* Lista de Historial */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {filteredHistory.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No history for this category.</p>
        ) : (
            filteredHistory.map((instance) => {
                const isSelected = selectedInstanceId === instance.id;
                return (
                <Card
                    key={instance.id}
                    onClick={() => onInstanceSelect(instance.id)}
                    className={`
                    p-3 cursor-pointer transition-all duration-200
                    ${isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 border-2'
                        : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                    }
                    `}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {getActionTitle(instance.actionId)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                            Target: {instance.target}
                            </p>
                             <p className="text-xxs text-gray-400 mt-1">
                                {new Date(instance.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <Badge variant={instance.status === 'Completed' ? 'default' : 'destructive'} className="text-xxs">
                            {instance.status}
                        </Badge>
                    </div>
                </Card>
                );
            })
        )}
        </div>
    </div>
  );
}