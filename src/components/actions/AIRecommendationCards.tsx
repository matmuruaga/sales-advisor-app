// src/components/actions/AIRecommendationCards.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  User,
  Building2,
  Calendar,
  Phone,
  MessageSquare,
  FileText,
  ChevronRight,
  X,
  Star,
  AlertCircle,
  CheckCircle,
  Zap,
  Brain,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { enhancedMockContacts } from '@/data/enhancedMockContacts';

interface AIRecommendationCardsProps {
  activeCategory: string | null;
}

interface AIRecommendation {
  id: string;
  type: 'urgent-action' | 'optimization' | 'opportunity' | 'insight' | 'timing' | 'template';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  category: string;
  contact?: string;
  company?: string;
  actionType?: 'call' | 'meeting' | 'email' | 'proposal';
  suggestedTiming?: string;
  reasoningPoints: string[];
  estimatedValue?: string;
  successProbability?: number;
  tags: string[];
  dismissed?: boolean;
  implemented?: boolean;
}

// Generate dynamic AI recommendations based on context
const generateRecommendations = (activeCategory: string | null): AIRecommendation[] => {
  const baseRecommendations: AIRecommendation[] = [
    {
      id: 'urgent-followup-innovateai',
      type: 'urgent-action',
      title: 'Critical Follow-up Required',
      description: 'Carlos Ruiz from InnovateAI has been waiting 3 days for your response on the $150K proposal.',
      priority: 'high',
      confidence: 94,
      impact: 'high',
      category: 'sales-ops',
      contact: 'Carlos Ruiz',
      company: 'InnovateAI',
      actionType: 'call',
      suggestedTiming: 'Today before 5 PM',
      reasoningPoints: [
        'Deal value: $150K with 6-week implementation timeline',
        'Contact has high engagement score (89/100)',
        'Competitor evaluation ends this week',
        'Previous conversations showed strong buying intent'
      ],
      estimatedValue: '$150,000',
      successProbability: 87,
      tags: ['urgent', 'high-value', 'competitor-threat']
    },
    {
      id: 'timing-optimization-techcorp',
      type: 'timing',
      title: 'Optimal Demo Timing Identified',
      description: 'María González is most active on LinkedIn Tuesday-Wednesday afternoons. Perfect time for demo scheduling.',
      priority: 'medium',
      confidence: 78,
      impact: 'medium',
      category: 'sales-ops',
      contact: 'María González',
      company: 'TechCorp',
      actionType: 'meeting',
      suggestedTiming: 'Tuesday or Wednesday 2-4 PM',
      reasoningPoints: [
        'Contact activity patterns show 40% higher engagement on these days',
        'Company has budget approval meetings on Thursdays',
        'Technical team availability aligns with afternoon slots',
        'No competing vendor meetings scheduled'
      ],
      successProbability: 76,
      tags: ['timing', 'demo', 'engagement']
    },
    {
      id: 'opportunity-datasolutions',
      type: 'opportunity',
      title: 'Expansion Opportunity Detected',
      description: 'DataSolutions just received Series B funding. Perfect timing to propose enterprise upgrade.',
      priority: 'high',
      confidence: 85,
      impact: 'high',
      category: 'analytics',
      company: 'DataSolutions',
      contact: 'Ana López',
      actionType: 'proposal',
      suggestedTiming: 'Within 2 weeks',
      reasoningPoints: [
        'Series B funding of $25M announced last week',
        'Company growing from 50 to 150 employees in Q1',
        'Current contract value: $60K, expansion potential: $200K+',
        'VP Sales mentioned scaling challenges in last call'
      ],
      estimatedValue: '$200,000+',
      successProbability: 82,
      tags: ['expansion', 'funding', 'scaling']
    },
    {
      id: 'insight-competitive-threat',
      type: 'insight',
      title: 'Competitive Threat Analysis',
      description: 'Microsoft Sales Copilot evaluation detected at 3 of your top prospects. Differentiation strategy needed.',
      priority: 'high',
      confidence: 91,
      impact: 'high',
      category: 'analytics',
      reasoningPoints: [
        'TechCorp CTO researched Microsoft Sales Copilot last week',
        'GlobalTech mentioned "Microsoft ecosystem integration" in requirements',
        'FinanceCorps has existing Office 365 enterprise license',
        'Your emotional AI capabilities are key differentiator'
      ],
      tags: ['competitive', 'microsoft', 'differentiation']
    },
    {
      id: 'template-optimization',
      type: 'template',
      title: 'Template Performance Insight',
      description: 'Your "Cold Outreach - CTO" template has 23% lower success rate. AI suggests improvements.',
      priority: 'medium',
      confidence: 88,
      impact: 'medium',
      category: 'ai-simulations',
      reasoningPoints: [
        'Template success rate: 67% vs industry average: 73%',
        'Technical jargon reduces engagement by 15%',
        'Personalization level is 34% below optimal',
        'Subject line testing shows 28% improvement potential'
      ],
      tags: ['template', 'optimization', 'cto-outreach']
    },
    {
      id: 'simulation-practice',
      type: 'optimization',
      title: 'Practice Session Recommended',
      description: 'You have 3 enterprise demos this week. AI simulation can improve your success rate by 15%.',
      priority: 'medium',
      confidence: 83,
      impact: 'medium',
      category: 'ai-simulations',
      suggestedTiming: 'Before first demo',
      reasoningPoints: [
        'Enterprise deals average $300K in your pipeline',
        'Demo success rate improves 15% after practice sessions',
        'Complex multi-stakeholder scenarios need rehearsal',
        'Objection handling skills can be strengthened'
      ],
      successProbability: 85,
      tags: ['practice', 'enterprise', 'demo-prep']
    }
  ];

  // Filter by active category if specified
  if (activeCategory) {
    return baseRecommendations.filter(rec => rec.category === activeCategory);
  }

  return baseRecommendations;
};

export function AIRecommendationCards({ activeCategory }: AIRecommendationCardsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const recs = generateRecommendations(activeCategory);
    setRecommendations(recs.filter(r => !dismissedCards.has(r.id)));
  }, [activeCategory, dismissedCards]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent-action': return AlertCircle;
      case 'opportunity': return TrendingUp;
      case 'optimization': return Target;
      case 'insight': return Brain;
      case 'timing': return Clock;
      case 'template': return FileText;
      default: return Sparkles;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent-action': return 'bg-red-100 text-red-600 border-red-200';
      case 'opportunity': return 'bg-green-100 text-green-600 border-green-200';
      case 'optimization': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'insight': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'timing': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'template': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'email': return MessageSquare;
      case 'proposal': return FileText;
      default: return Target;
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedCards(prev => new Set(prev).add(id));
    if (expandedCard === id) {
      setExpandedCard(null);
    }
  };

  const handleImplement = (recommendation: AIRecommendation) => {
    // Simulate implementing the recommendation
    console.log('Implementing recommendation:', recommendation.title);
    // You could trigger the appropriate action creation flow here
  };

  const handleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ring-1 ring-black/5 text-center">
        <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h4 className="font-medium text-gray-900 mb-2">All Caught Up!</h4>
        <p className="text-sm text-gray-500">
          No urgent AI recommendations at the moment. Great work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg ring-1 ring-black/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <p className="text-xs text-gray-500">
          Powered by sales intelligence • {recommendations.length} active insights
        </p>
      </div>

      {/* Recommendation Cards */}
      <AnimatePresence>
        {recommendations.map((rec, index) => {
          const TypeIcon = getTypeIcon(rec.type);
          const ActionIcon = rec.actionType ? getActionIcon(rec.actionType) : null;
          const isExpanded = expandedCard === rec.id;
          
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDismiss(rec.id)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                </div>

                {/* Title and Description */}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {rec.description}
                  </p>
                </div>

                {/* Contact/Company Info */}
                {(rec.contact || rec.company) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {rec.contact && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{rec.contact}</span>
                      </div>
                    )}
                    {rec.company && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{rec.company}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Metrics */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm">
                    {rec.successProbability && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{rec.successProbability}% success</span>
                      </div>
                    )}
                    {rec.estimatedValue && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Target className="h-3 w-3" />
                        <span>{rec.estimatedValue}</span>
                      </div>
                    )}
                    {rec.suggestedTiming && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span>{rec.suggestedTiming}</span>
                      </div>
                    )}
                  </div>

                  {ActionIcon && (
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <ActionIcon className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleImplement(rec)}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Implement
                  </Button>
                  <Button
                    onClick={() => handleExpand(rec.id)}
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50/30">
                      {/* AI Reasoning */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <h5 className="font-medium text-gray-900">AI Reasoning</h5>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {rec.reasoningPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {rec.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Feedback Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                        <div className="text-xs text-gray-500">Was this helpful?</div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-green-100 rounded-full transition-colors">
                            <ThumbsUp className="h-3 w-3 text-gray-400 hover:text-green-600" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded-full transition-colors">
                            <ThumbsDown className="h-3 w-3 text-gray-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* AI Learning Notice */}
      <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 backdrop-blur-md rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Zap className="h-3 w-3 text-purple-600" />
          <span>AI learns from your actions to improve recommendations</span>
        </div>
      </div>
    </div>
  );
}