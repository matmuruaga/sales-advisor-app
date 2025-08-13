// src/components/actions/EnhancedTemplatesGallery.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Phone, 
  MessageSquare,
  Target,
  Zap,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Play,
  RefreshCw,
  GraduationCap,
  Sparkles,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { quickActionTemplates } from '@/data/quickActionTemplates';

interface EnhancedTemplatesGalleryProps {
  category?: string;
  onTemplateSelect?: (template: any) => void;
}

interface TemplateCard {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  successRate: number;
  avgTime: string;
  icon: React.ElementType;
  tags: string[];
  prompt: string;
  usageCount: number;
  lastUsed?: string;
  timesSaved?: number;
}

// Enhanced template data
const enhancedTemplates: TemplateCard[] = [
  {
    id: 'demo-cto',
    title: 'Demo Meeting with CTO',
    description: 'High-value technical demonstration for decision makers',
    category: 'schedule',
    difficulty: 'intermediate',
    successRate: 89,
    avgTime: '25 min',
    icon: Calendar,
    tags: ['demo', 'technical', 'c-level'],
    prompt: 'Prepare a technical demo for a CTO...',
    usageCount: 156,
    lastUsed: '2 hours ago',
    timesSaved: 45
  },
  {
    id: 'follow-up-urgent',
    title: 'Follow-up Call - High Priority',
    description: 'Urgent follow-up for hot prospects with budget',
    category: 'schedule',
    difficulty: 'beginner',
    successRate: 94,
    avgTime: '15 min',
    icon: Target,
    tags: ['follow-up', 'urgent', 'budget'],
    prompt: 'Schedule urgent follow-up...',
    usageCount: 203,
    lastUsed: '1 day ago',
    timesSaved: 30
  },
  {
    id: 'cold-outreach-cto',
    title: 'Cold Outreach - CTO',
    description: 'Technical cold call script for CTOs',
    category: 'call',
    difficulty: 'advanced',
    successRate: 67,
    avgTime: '20 min',
    icon: Phone,
    tags: ['cold-call', 'technical', 'cto'],
    prompt: 'Cold call script for CTO...',
    usageCount: 78,
    lastUsed: '5 hours ago',
    timesSaved: 25
  },
  {
    id: 'pricing-objection',
    title: 'Pricing Objection Call',
    description: 'Handle price concerns with value-based messaging',
    category: 'call',
    difficulty: 'intermediate',
    successRate: 82,
    avgTime: '35 min',
    icon: TrendingUp,
    tags: ['objection', 'pricing', 'value'],
    prompt: 'Handle pricing objections...',
    usageCount: 134,
    lastUsed: '1 hour ago',
    timesSaved: 40
  }
];

export function EnhancedTemplatesGallery({ category = 'all', onTemplateSelect }: EnhancedTemplatesGalleryProps) {
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Filter templates
  const filteredTemplates = enhancedTemplates.filter(template => {
    if (category !== 'all' && template.category !== category) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return template.title.toLowerCase().includes(term) ||
             template.description.toLowerCase().includes(term);
    }
    return true;
  });

  // Get success rating with visual indicators
  const getSuccessRating = (rate: number) => {
    if (rate >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', dots: 5 };
    if (rate >= 80) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', dots: 4 };
    if (rate >= 70) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', dots: 3 };
    return { label: 'Needs Practice', color: 'text-red-600', bg: 'bg-red-50', dots: 2 };
  };

  // Get smart CTA based on usage patterns
  const getSmartCTA = (template: TemplateCard) => {
    const lastUsedHours = template.lastUsed?.includes('hour') ? 
      parseInt(template.lastUsed) : 
      template.lastUsed?.includes('day') ? parseInt(template.lastUsed) * 24 : 100;

    if (lastUsedHours < 24 && template.usageCount > 100) {
      return { text: 'Use Again', icon: RefreshCw, color: 'from-blue-600 to-cyan-600' };
    }
    if (template.successRate >= 90) {
      return { text: 'Recommended', icon: Star, color: 'from-purple-600 to-pink-600' };
    }
    if (template.successRate < 70) {
      return { text: 'Practice First', icon: GraduationCap, color: 'from-yellow-600 to-orange-600' };
    }
    if (template.usageCount < 10) {
      return { text: 'Try Template', icon: Play, color: 'from-green-600 to-teal-600' };
    }
    return { text: 'Use Template', icon: Play, color: 'from-purple-600 to-blue-600' };
  };

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  // Compact Template Card Component
  const CompactTemplateCard = ({ template, index }: { template: TemplateCard; index: number }) => {
    const rating = getSuccessRating(template.successRate);
    const cta = getSmartCTA(template);
    const isExpanded = expandedCards.has(template.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
      >
        {/* Compact View - Always Visible */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                <template.icon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                  {template.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {/* Success Indicator Dots */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i < rating.dots ? rating.color.replace('text-', 'bg-') : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${rating.color}`}>
                    {rating.label}
                  </span>
                  {template.successRate > 85 && (
                    <Badge className="text-xs py-0 px-1.5 bg-green-50 text-green-700 border-green-200">
                      +{template.successRate - 75}% avg
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleCardExpansion(template.id)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Progressive Disclosure - Level 2 (Expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {template.description}
                  </p>

                  {/* Simplified Metrics */}
                  <div className="flex items-center gap-4 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">{template.avgTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">{template.timesSaved}min saved</span>
                    </div>
                    {template.lastUsed && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{template.lastUsed}</span>
                      </div>
                    )}
                  </div>

                  {/* Smart CTA */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onTemplateSelect?.(template)}
                      size="sm"
                      className={`flex-1 bg-gradient-to-r ${cta.color} hover:shadow-lg text-white transition-all`}
                    >
                      <cta.icon className="h-3.5 w-3.5 mr-1.5" />
                      {cta.text}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-3"
                      onClick={() => console.log('Preview:', template)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with View Toggle */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Smart Templates</h3>
              <p className="text-xs text-gray-500">AI-optimized for success</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded ${
                viewMode === 'compact' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              } transition-all`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('expanded')}
              className={`p-1.5 rounded ${
                viewMode === 'expanded' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              } transition-all`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className={`grid gap-3 ${
        viewMode === 'compact' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredTemplates.map((template, index) => (
          <CompactTemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 text-center">
          <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No templates found</p>
        </div>
      )}
    </div>
  );
}