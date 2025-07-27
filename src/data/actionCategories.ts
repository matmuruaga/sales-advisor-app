// src/data/actionCategories.ts
import { Zap, BarChart3, BotMessageSquare, FileText } from 'lucide-react';

export interface ActionCategory {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const actionCategories: ActionCategory[] = [
  {
    id: 'sales-ops',
    label: 'Sales Ops',
    icon: Zap,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'ai-simulations',
    label: 'AI Simulations',
    icon: BotMessageSquare,
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: FileText,
  },
];