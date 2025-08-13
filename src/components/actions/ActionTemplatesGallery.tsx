// src/components/actions/ActionTemplatesGallery.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Phone, 
  MessageSquare, 
  FileText, 
  Users, 
  Target, 
  Zap,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { quickActionTemplates } from '@/data/quickActionTemplates';

interface ActionTemplatesGalleryProps {
  activeCategory: string | null;
  bulkMode: boolean;
  onActionSelect: (actionId: string) => void;
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
}

// Enhanced template data with metadata
const templateCategories = {
  schedule: {
    name: 'Meeting & Scheduling',
    icon: Calendar,
    color: 'blue',
    description: 'Templates for scheduling calls, demos, and meetings'
  },
  call: {
    name: 'Call Scripts',
    icon: Phone,
    color: 'green',
    description: 'Proven scripts for different call scenarios'
  },
  simulate: {
    name: 'Practice Simulations',
    icon: MessageSquare,
    color: 'purple',
    description: 'Role-play scenarios for skill development'
  },
  nested: {
    name: 'Complex Scenarios',
    icon: Users,
    color: 'orange',
    description: 'Multi-stakeholder and advanced situations'
  }
};

const enhancedTemplates: TemplateCard[] = [
  // Schedule templates
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
    prompt: quickActionTemplates.schedule[0].prompt,
    usageCount: 156,
    lastUsed: '2 hours ago'
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
    prompt: quickActionTemplates.schedule[1].prompt,
    usageCount: 203,
    lastUsed: '1 day ago'
  },
  {
    id: 'discovery-new-lead',
    title: 'Discovery Meeting - New Lead',
    description: 'First meeting to understand prospect needs',
    category: 'schedule',
    difficulty: 'beginner',
    successRate: 76,
    avgTime: '30 min',
    icon: Search,
    tags: ['discovery', 'new-lead', 'needs'],
    prompt: quickActionTemplates.schedule[2].prompt,
    usageCount: 89,
    lastUsed: '3 days ago'
  },
  
  // Call templates
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
    prompt: quickActionTemplates.call[0].prompt,
    usageCount: 78,
    lastUsed: '5 hours ago'
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
    prompt: quickActionTemplates.call[2].prompt,
    usageCount: 134,
    lastUsed: '1 hour ago'
  },
  {
    id: 'competitive-displacement',
    title: 'Competitive Displacement',
    description: 'Win against competitors like Gong, Salesforce',
    category: 'call',
    difficulty: 'advanced',
    successRate: 71,
    avgTime: '45 min',
    icon: Zap,
    tags: ['competitive', 'displacement', 'gong'],
    prompt: quickActionTemplates.call[3].prompt,
    usageCount: 92,
    lastUsed: '4 hours ago'
  },
  
  // Simulation templates
  {
    id: 'skeptical-cto-sim',
    title: 'Skeptical CTO - Technical Objections',
    description: 'Practice handling technical pushback',
    category: 'simulate',
    difficulty: 'advanced',
    successRate: 85,
    avgTime: '40 min',
    icon: MessageSquare,
    tags: ['simulation', 'technical', 'objections'],
    prompt: quickActionTemplates.simulate[0].prompt,
    usageCount: 67,
    lastUsed: '6 hours ago'
  },
  {
    id: 'budget-cfo-sim',
    title: 'Budget-Conscious CFO',
    description: 'Practice ROI conversations with finance leaders',
    category: 'simulate',
    difficulty: 'intermediate',
    successRate: 79,
    avgTime: '30 min',
    icon: Target,
    tags: ['simulation', 'cfo', 'roi'],
    prompt: quickActionTemplates.simulate[1].prompt,
    usageCount: 54,
    lastUsed: '2 days ago'
  },
  {
    id: 'friendly-vp-sim',
    title: 'Friendly VP Sales - Demo',
    description: 'Practice demos with receptive audiences',
    category: 'simulate',
    difficulty: 'beginner',
    successRate: 92,
    avgTime: '25 min',
    icon: Star,
    tags: ['simulation', 'demo', 'friendly'],
    prompt: quickActionTemplates.simulate[2].prompt,
    usageCount: 121,
    lastUsed: '1 day ago'
  }
];

export function ActionTemplatesGallery({ activeCategory, bulkMode, onActionSelect }: ActionTemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates based on selected criteria
  const filteredTemplates = enhancedTemplates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (difficultyFilter !== 'all' && template.difficulty !== difficultyFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        template.title.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryData = templateCategories[category as keyof typeof templateCategories];
    if (!categoryData) return 'bg-gray-100 text-gray-700';
    
    switch (categoryData.color) {
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
      case 'orange': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUseTemplate = (template: TemplateCard) => {
    // Simulate using the template
    console.log('Using template:', template.title);
    if (bulkMode) {
      onActionSelect(template.id);
    }
  };

  const handlePreviewTemplate = (template: TemplateCard) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Action Templates Library</h3>
            <p className="text-sm text-gray-500">Proven templates to accelerate your workflow</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            {Object.entries(templateCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ring-1 ring-black/5 hover:shadow-xl hover:ring-purple-200/50 transition-all duration-300 group"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                  <template.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              
              {bulkMode && (
                <button
                  onClick={() => onActionSelect(template.id)}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-gray-400 hover:text-purple-600" />
                </button>
              )}
            </div>

            {/* Template Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{template.successRate}%</div>
                <div className="text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{template.avgTime}</div>
                <div className="text-gray-500">Avg Time</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{template.usageCount}</div>
                <div className="text-gray-500">Times Used</div>
              </div>
            </div>

            {/* Tags and Difficulty */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getDifficultyColor(template.difficulty)}>
                {template.difficulty}
              </Badge>
              {template.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{template.tags.length - 2} more</span>
              )}
            </div>

            {/* Last Used */}
            {template.lastUsed && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <Clock className="h-3 w-3" />
                Last used {template.lastUsed}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleUseTemplate(template)}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Play className="h-3 w-3 mr-1" />
                Use Template
              </Button>
              <Button
                onClick={() => handlePreviewTemplate(template)}
                size="sm"
                variant="outline"
                className="px-3"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate.title}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">{selectedTemplate.description}</p>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Template Prompt:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedTemplate.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>{selectedTemplate.successRate}% success rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{selectedTemplate.avgTime} average time</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleUseTemplate(selectedTemplate);
                      setShowPreview(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Use This Template
                  </Button>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg ring-1 ring-black/5">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search terms to find relevant templates.
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setDifficultyFilter('all');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}