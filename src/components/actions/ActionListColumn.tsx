// src/components/actions/ActionListColumn.tsx
"use client";

import { Card } from "@/components/ui/card";
import { availableActions } from "@/data/availableActions";
import { ActionCategory } from "@/data/actionCategories";

interface ActionListColumnProps {
  category: ActionCategory;
  selectedActionId: string | null;
  onActionSelect: (actionId: string) => void;
}

export function ActionListColumn({
  category,
  selectedActionId,
  onActionSelect,
}: ActionListColumnProps) {
  const actions = availableActions[category.id] || [];

  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No actions available for this category yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2">
      {actions.map((action) => {
        const isSelected = selectedActionId === action.id;
        return (
          <Card
            key={action.id}
            onClick={() => onActionSelect(action.id)}
            className={`
              p-3 cursor-pointer transition-all duration-200
              ${isSelected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 border-2'
                : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <action.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}