// src/components/actions/EnhancedAIRecommendations.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Sparkles,
  Clock,
  Target,
  Users,
  Calendar,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EnhancedAIRecommendationsProps {
  category: string;
  onRecommendationApply?: (rec: any) => void;
}

interface AIRecommendation {
  id: string;
  type: 'urgent' | 'opportunity' | 'optimization' | 'insight';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  action: string;
  reasoning: string;
  icon: React.ElementType;
  gradient: string;
}

const aiRecommendations: AIRecommendation[] = [
  {
    id: 'ai-1',
    type: 'urgent',
    priority: 'high',
    title: 'Optimal Demo Timing Identified',
    description: 'Maria González is most active on LinkedIn Tuesday-Wednesday afternoons',
    confidence: 87,
    impact: '87% success rate',
    action: 'Schedule for Tuesday 2-4 PM',
    reasoning: 'Based on engagement patterns and past meeting success',
    icon: Clock,
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  {
    id: 'ai-2',
    type: 'opportunity',
    priority: 'high',
    title: 'Expansion Opportunity Detected',
    description: 'DataSolutions just received Series B funding',
    confidence: 82,
    impact: '$200,000+ potential',
    action: 'Reach out with enterprise proposal',
    reasoning: 'Funding news + current usage patterns indicate expansion readiness',
    icon: TrendingUp,
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'ai-3',
    type: 'optimization',
    priority: 'medium',
    title: 'Template Performance Insight',
    description: 'Your "Cold Outreach - CTO" template has 23% lower success rate',
    confidence: 91,
    impact: 'Improve by 15-20%',
    action: 'Use "Technical Discovery" template instead',
    reasoning: 'A/B testing shows better engagement with softer approach',
    icon: Target,
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'ai-4',
    type: 'insight',
    priority: 'low',
    title: 'Competitive Threat Analysis',
    description: 'Microsoft Sales Copilot detected at 3 prospects',
    confidence: 78,
    impact: 'Differentiation needed',
    action: 'Emphasize AI coaching features',
    reasoning: 'Win/loss analysis shows AI coaching as key differentiator',
    icon: Brain,
    gradient: 'from-purple-500/20 to-pink-500/20'
  }
];

export function EnhancedAIRecommendations({ category, onRecommendationApply }: EnhancedAIRecommendationsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return AlertCircle;
      case 'opportunity': return TrendingUp;
      case 'optimization': return Target;
      case 'insight': return Brain;
      default: return Info;
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Assistant Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-xl rounded-xl p-4 border border-purple-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg shadow-purple-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Intelligence</h3>
              <p className="text-xs text-gray-600">Real-time insights & recommendations</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-purple-300">
            4 insights
          </Badge>
        </div>
      </div>

      {/* AI Recommendation Cards */}
      <div className="space-y-3">
        {aiRecommendations.map((rec, index) => {
          const Icon = rec.icon;
          const isExpanded = expandedCard === rec.id;

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative bg-gradient-to-r ${rec.gradient} backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Card Content */}
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                      <Icon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {rec.title}
                        </h4>
                        <Badge className={`text-xs py-0 px-1.5 ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : rec.id)}
                    className="p-1 hover:bg-white/50 rounded transition-colors"
                  >
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </button>
                </div>

                {/* Confidence & Impact */}
                <div className="flex items-center gap-4 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-3 rounded-full ${
                            i < Math.floor(rec.confidence / 20) 
                              ? 'bg-purple-500' 
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 ml-1">{rec.confidence}% confidence</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-gray-700 font-medium">{rec.impact}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-white/30">
                        <div className="bg-white/40 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-700">
                            <span className="font-medium">AI Reasoning:</span> {rec.reasoning}
                          </p>
                        </div>
                        <Button
                          onClick={() => onRecommendationApply?.(rec)}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                          {rec.action}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Status Footer */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-600">AI actively analyzing</span>
          </div>
          <span className="text-purple-600 font-medium">Last update: 2 min ago</span>
        </div>
      </div>
    </div>
  );
}