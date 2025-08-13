"use client";

import { Brain, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompactAIRecommendationsProps {
  category: string;
  onExpand: () => void;
}

export function CompactAIRecommendations({ category, onExpand }: CompactAIRecommendationsProps) {
  const recommendations = [
    {
      id: '1',
      priority: 'high',
      type: 'urgent',
      title: 'Follow up now',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      id: '2',
      priority: 'medium',
      type: 'opportunity',
      title: '3 hot leads',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: '3',
      priority: 'low',
      type: 'insight',
      title: 'AI insights',
      icon: Brain,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-2 mt-4">
      {recommendations.map((rec) => {
        const Icon = rec.icon;
        return (
          <button
            key={rec.id}
            onClick={onExpand}
            className="w-full p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
          >
            <Icon className={`w-4 h-4 ${rec.color}`} />
            <span className="text-xs text-gray-700 mt-1 block line-clamp-1">
              {rec.title}
            </span>
          </button>
        );
      })}
      
      <div className="pt-2 border-t border-gray-200">
        <div className="flex flex-col items-center gap-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs text-gray-600">AI Active</span>
        </div>
      </div>
    </div>
  );
}