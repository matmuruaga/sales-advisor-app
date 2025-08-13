// src/components/actions/SmartActionComposer.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  User, 
  Building2, 
  Target, 
  Calendar, 
  Phone,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { enhancedMockContacts } from '@/data/enhancedMockContacts';
import { availableActions } from '@/data/availableActions';
import { quickActionTemplates, recognitionPatterns } from '@/data/quickActionTemplates';

interface SmartActionComposerProps {
  activeCategory: string | null;
  bulkMode: boolean;
  onActionSelect: (actionId: string) => void;
}

interface Suggestion {
  type: 'contact' | 'company' | 'action' | 'template' | 'time' | 'success-tip';
  value: string;
  displayValue: string;
  icon?: React.ElementType;
  score?: number;
  category?: string;
  context?: string;
}

interface ActionPreview {
  title: string;
  description: string;
  successProbability: number;
  estimatedTime: string;
  suggestedTiming: string;
  riskFactors: string[];
  tips: string[];
}

const mockCompanies = [
  'TechCorp', 'InnovateAI', 'DataSolutions', 'StartupABC', 
  'FinanceCorps', 'GlobalTech', 'ClientSuccess', 'TechStartup'
];

export function SmartActionComposer({ activeCategory, bulkMode, onActionSelect }: SmartActionComposerProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate intelligent suggestions based on input
  const generateSuggestions = (value: string): Suggestion[] => {
    const allSuggestions: Suggestion[] = [];
    const lowerValue = value.toLowerCase();

    // Contact suggestions
    const contactMatches = enhancedMockContacts
      .filter(contact => 
        contact.name.toLowerCase().includes(lowerValue) ||
        contact.company.toLowerCase().includes(lowerValue) ||
        contact.role.toLowerCase().includes(lowerValue)
      )
      .slice(0, 3)
      .map(contact => ({
        type: 'contact' as const,
        value: contact.name,
        displayValue: `${contact.name} - ${contact.role} at ${contact.company}`,
        icon: User,
        score: contact.score,
        context: `Status: ${contact.status}, Last contact: ${contact.lastContact}`
      }));

    // Company suggestions
    const companyMatches = mockCompanies
      .filter(company => company.toLowerCase().includes(lowerValue))
      .slice(0, 3)
      .map(company => ({
        type: 'company' as const,
        value: company,
        displayValue: company,
        icon: Building2,
        context: 'Enterprise prospect'
      }));

    // Action type suggestions based on keywords
    if (lowerValue.includes('call') || lowerValue.includes('llamar')) {
      allSuggestions.push({
        type: 'action',
        value: 'call',
        displayValue: 'Schedule Call',
        icon: Phone,
        context: 'Voice conversation'
      });
    }

    if (lowerValue.includes('meeting') || lowerValue.includes('reunion')) {
      allSuggestions.push({
        type: 'action',
        value: 'meeting',
        displayValue: 'Schedule Meeting',
        icon: Calendar,
        context: 'Face-to-face or virtual'
      });
    }

    if (lowerValue.includes('proposal') || lowerValue.includes('propuesta')) {
      allSuggestions.push({
        type: 'action',
        value: 'proposal',
        displayValue: 'Generate Proposal',
        icon: FileText,
        context: 'Customized sales document'
      });
    }

    // Template suggestions
    const templateCategory = lowerValue.includes('call') ? 'call' : 
                           lowerValue.includes('meeting') || lowerValue.includes('schedule') ? 'schedule' :
                           lowerValue.includes('simulate') ? 'simulate' : null;
    
    if (templateCategory && quickActionTemplates[templateCategory]) {
      const templateMatches = quickActionTemplates[templateCategory]
        .filter(template => 
          template.title.toLowerCase().includes(lowerValue) ||
          template.prompt.toLowerCase().includes(lowerValue)
        )
        .slice(0, 2)
        .map(template => ({
          type: 'template' as const,
          value: template.prompt,
          displayValue: template.title,
          icon: Target,
          category: template.category,
          context: 'Pre-configured template'
        }));
      
      allSuggestions.push(...templateMatches);
    }

    // Time suggestions
    if (lowerValue.includes('tomorrow') || lowerValue.includes('mañana')) {
      allSuggestions.push({
        type: 'time',
        value: 'tomorrow',
        displayValue: 'Tomorrow',
        icon: Clock,
        context: 'Next business day'
      });
    }

    if (lowerValue.includes('next week') || lowerValue.includes('proxima semana')) {
      allSuggestions.push({
        type: 'time',
        value: 'next week',
        displayValue: 'Next Week',
        icon: Clock,
        context: 'Following week'
      });
    }

    // AI Success Tips
    if (value.length > 20) {
      allSuggestions.push({
        type: 'success-tip',
        value: 'ai-tip',
        displayValue: 'AI suggests mentioning recent company news',
        icon: Sparkles,
        context: 'Increase engagement by 40%'
      });
    }

    return [...contactMatches, ...companyMatches, ...allSuggestions].slice(0, 6);
  };

  // Generate action preview with AI analysis
  const generateActionPreview = (prompt: string): ActionPreview => {
    const hasContact = recognitionPatterns.names.some(name => 
      prompt.toLowerCase().includes(name.toLowerCase())
    );
    const hasCompany = recognitionPatterns.companies.some(company => 
      prompt.toLowerCase().includes(company.toLowerCase())
    );
    const hasTimeline = recognitionPatterns.timeIndicators.some(time => 
      prompt.toLowerCase().includes(time)
    );

    let successProbability = 65; // Base probability
    const riskFactors: string[] = [];
    const tips: string[] = [];

    // Adjust probability based on context
    if (hasContact && hasCompany) successProbability += 15;
    if (hasTimeline) successProbability += 10;
    if (prompt.includes('$') || prompt.includes('budget')) successProbability += 10;
    
    // Add risk factors
    if (!hasContact) riskFactors.push('No specific contact mentioned');
    if (!hasTimeline) riskFactors.push('No timeline specified');
    if (prompt.length < 20) riskFactors.push('Limited context provided');

    // Add tips
    if (hasContact) tips.push('Reference recent interaction history');
    if (hasCompany) tips.push('Mention relevant industry trends');
    tips.push('Schedule during optimal engagement hours');

    return {
      title: 'AI-Generated Sales Action',
      description: prompt.length > 50 
        ? 'Comprehensive action with detailed context' 
        : 'Quick action - consider adding more details',
      successProbability: Math.min(95, successProbability),
      estimatedTime: '15-30 minutes',
      suggestedTiming: 'Today 2-4 PM (peak engagement)',
      riskFactors,
      tips
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim().length > 2) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }

    // Generate preview for longer inputs
    if (value.trim().length > 10) {
      setActionPreview(generateActionPreview(value));
    } else {
      setActionPreview(null);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'template') {
      setInputValue(suggestion.value);
      setSelectedTemplate(suggestion.displayValue);
    } else if (suggestion.type === 'contact' || suggestion.type === 'company') {
      // Replace or append the suggestion to current input
      setInputValue(prev => {
        if (prev.trim() === '') return suggestion.displayValue;
        return `${prev} ${suggestion.displayValue}`;
      });
    } else {
      setInputValue(prev => `${prev} ${suggestion.displayValue}`);
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // Reset form
    setInputValue('');
    setActionPreview(null);
    setSelectedTemplate(null);
  };

  // Quick action buttons for common tasks
  const quickActions = [
    { label: 'Schedule Demo', icon: Calendar, prompt: 'Schedule a product demo with' },
    { label: 'Follow-up Call', icon: Phone, prompt: 'Schedule follow-up call with' },
    { label: 'Send Proposal', icon: FileText, prompt: 'Generate and send proposal to' },
    { label: 'Team Briefing', icon: Users, prompt: 'Create team briefing for meeting with' }
  ];

  return (
    <div className="space-y-6">
      {/* Smart Composer Card */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Action</h3>
              <p className="text-sm text-gray-500">Describe what you want to accomplish</p>
            </div>
          </div>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              showQuickActions 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Quick Actions
          </button>
        </div>

        {/* Expandable Quick Action Buttons */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(action.prompt + ' ');
                      setShowQuickActions(false);
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <action.icon className="h-4 w-4 text-gray-500" />
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Area */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Example: Schedule demo with María González, CTO at TechCorp, tomorrow 3pm to show how SixthSense improves sales efficiency..."
            className="w-full p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 min-h-[100px] placeholder:text-gray-400"
            rows={4}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
            {inputValue.length}/500
          </div>
        </div>

        {/* Template Badge */}
        {selectedTemplate && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Using template: {selectedTemplate}
            </Badge>
          </div>
        )}

        {/* Autocomplete Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 mt-2 w-full bg-white/90 backdrop-blur-xl rounded-xl shadow-xl ring-1 ring-black/5 border border-white/20 overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full p-3 text-left hover:bg-purple-50/50 transition-colors border-b border-gray-100/50 last:border-0 ${
                    selectedSuggestionIndex === index ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {suggestion.icon && (
                      <div className={`p-1.5 rounded-lg ${
                        suggestion.type === 'contact' ? 'bg-blue-100 text-blue-600' :
                        suggestion.type === 'company' ? 'bg-green-100 text-green-600' :
                        suggestion.type === 'template' ? 'bg-orange-100 text-orange-600' :
                        suggestion.type === 'success-tip' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <suggestion.icon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.displayValue}
                      </div>
                      {suggestion.context && (
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.context}
                        </div>
                      )}
                    </div>
                    {suggestion.score && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.score}/100
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Preview */}
        <AnimatePresence>
          {actionPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-200/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-gray-900">AI Action Analysis</h4>
                <Badge 
                  variant="outline" 
                  className={`ml-auto ${
                    actionPreview.successProbability >= 80 ? 'border-green-200 text-green-700' :
                    actionPreview.successProbability >= 60 ? 'border-yellow-200 text-yellow-700' :
                    'border-red-200 text-red-700'
                  }`}
                >
                  {actionPreview.successProbability}% success probability
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Estimated time: {actionPreview.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Target className="h-3 w-3" />
                    <span>{actionPreview.suggestedTiming}</span>
                  </div>
                </div>
                
                {actionPreview.riskFactors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-medium">Consider:</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {actionPreview.riskFactors.map((risk, idx) => (
                        <li key={idx}>• {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {actionPreview.tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200/30">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-medium">AI Tips for Success:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {actionPreview.tips.map((tip, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-purple-100/50 text-purple-700">
                        {tip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isGenerating}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Generating Action...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Action
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
          
          {bulkMode && (
            <Button variant="outline" onClick={() => onActionSelect('new-action')}>
              Add to Bulk
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}