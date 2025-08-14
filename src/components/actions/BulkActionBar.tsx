// src/components/actions/BulkActionBar.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Copy,
  Trash2,
  Archive,
  Tag,
  Users,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  Calendar,
  Target,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onExecute: () => void;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

const bulkActions: BulkAction[] = [
  {
    id: 'execute',
    label: 'Execute All',
    icon: Play,
    description: 'Run all selected actions immediately',
    requiresConfirmation: true
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    description: 'Schedule all actions for specific time'
  },
  {
    id: 'pause',
    label: 'Pause',
    icon: Pause,
    description: 'Pause all in-progress actions'
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    description: 'Create copies of selected actions'
  },
  {
    id: 'assign',
    label: 'Reassign',
    icon: Users,
    description: 'Assign to different team member'
  },
  {
    id: 'tag',
    label: 'Add Tags',
    icon: Tag,
    description: 'Add labels to selected actions'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Archive completed actions'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Permanently delete selected actions',
    destructive: true,
    requiresConfirmation: true
  }
];

export function BulkActionBar({ selectedCount, onClear, onExecute }: BulkActionBarProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleBulkAction = async (actionId: string, action: BulkAction) => {
    if (action.requiresConfirmation) {
      const confirmed = confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} actions?`);
      if (!confirmed) return;
    }

    setProcessingAction(actionId);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (actionId === 'execute') {
      onExecute();
    }
    
    setProcessingAction(null);
    setShowActionMenu(false);
    
    // Show success feedback
    console.log(`Bulk action completed: ${action.label} on ${selectedCount} actions`);
  };

  const estimatedTime = selectedCount * 2; // 2 minutes per action average
  const estimatedCompleted = new Date(Date.now() + estimatedTime * 60 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/10 border border-white/20 p-4 min-w-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {selectedCount} action{selectedCount !== 1 ? 's' : ''} selected
              </div>
              <div className="text-sm text-gray-500">
                Est. {estimatedTime} min • Complete by {estimatedCompleted}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-700">89%</div>
            <div className="text-green-600">Avg Success</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-700">{estimatedTime}m</div>
            <div className="text-blue-600">Est Time</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-700">$47K</div>
            <div className="text-purple-600">Potential Value</div>
          </div>
        </div>

        {/* Warning for High-Risk Actions */}
        <div className="flex items-center gap-2 p-3 bg-orange-50/50 border border-orange-200/50 rounded-lg mb-4 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <div className="text-orange-700">
            <span className="font-medium">3 actions</span> have low success probability. Consider reviewing before execution.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Primary Execute Button */}
          <Button
            onClick={() => handleBulkAction('execute', bulkActions[0])}
            disabled={processingAction !== null}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {processingAction === 'execute' ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Executing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Execute All ({selectedCount})
              </div>
            )}
          </Button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowActionMenu(!showActionMenu)}
              variant="outline"
              className="px-3"
            >
              <Settings className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>

            {/* Dropdown Menu */}
            {showActionMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-2 right-0 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl ring-1 ring-black/10 border border-white/20 py-2 min-w-[200px]"
              >
                {bulkActions.slice(1).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleBulkAction(action.id, action)}
                    disabled={processingAction !== null}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50/50 transition-colors flex items-center gap-3 ${
                      action.destructive ? 'text-red-600 hover:bg-red-50/50' : 'text-gray-700'
                    } ${processingAction === action.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {processingAction === action.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                    ) : (
                      <action.icon className="h-4 w-4" />
                    )}
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Smart Scheduling Suggestion */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="h-4 w-4 text-purple-600" />
            <span>
              <strong>AI Suggestion:</strong> Execute high-priority actions first for 15% better success rate
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}