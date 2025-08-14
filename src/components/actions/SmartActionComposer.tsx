// src/components/actions/SmartActionComposer.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Users,
  Mail,
  PhoneCall,
  Briefcase,
  UserPlus,
  AtSign,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseActions } from '@/hooks/useSupabaseActions';
import { useSupabaseContacts } from '@/hooks/useSupabaseContacts';
import { type Action, type ActionTemplate } from '@/lib/supabase';
import MentionDropdown, { type MentionOption } from '@/components/common/MentionDropdown';
import VariablesSuggestions, { type VariableOption } from '@/components/common/VariablesSuggestions';
import { resolveVariables } from '@/lib/promptTemplates';

interface SmartActionComposerProps {
  category?: string;
  onActionCreate?: (action: Action) => void;
}

interface Suggestion {
  type: 'contact' | 'company' | 'action' | 'template' | 'time' | 'success-tip';
  value: string;
  displayValue: string;
  icon?: React.ElementType;
  score?: number;
  category?: string;
  context?: string;
  id?: string;
  data?: any;
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

export function SmartActionComposer({ category, onActionCreate }: SmartActionComposerProps) {
  const { 
    createAction, 
    generateActionFromPrompt, 
    createActionFromTemplate, 
    templates, 
    loading: actionsLoading, 
    error: actionsError 
  } = useSupabaseActions()
  
  const { 
    contacts, 
    companies, 
    loading: contactsLoading 
  } = useSupabaseContacts()

  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]) 
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Mentions system state
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [mentionOptions, setMentionOptions] = useState<MentionOption[]>([])
  const [activeMentions, setActiveMentions] = useState<Array<{id: string, type: 'contact' | 'user', name: string, email?: string, company?: string}>>([])
  
  // Variables system state
  const [showVariables, setShowVariables] = useState(false)
  const [variableQuery, setVariableQuery] = useState('')
  const [variablePosition, setVariablePosition] = useState({ top: 0, left: 0 })
  const [selectedVariableIndex, setSelectedVariableIndex] = useState(0)
  const [activeVariables, setActiveVariables] = useState<Array<{key: string, value: string, type: 'date' | 'link' | 'text'}>>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const variableDropdownRef = useRef<HTMLDivElement>(null);

  // Generate mention options from contacts and team members
  const generateMentionOptions = useCallback((query: string): MentionOption[] => {
    const lowerQuery = query.toLowerCase();
    const contactOptions: MentionOption[] = (contacts || [])
      .filter(contact => {
        const fullName = contact?.full_name?.toLowerCase() || '';
        const email = contact?.email?.toLowerCase() || '';
        const company = contact?.company?.name?.toLowerCase() || '';
        return fullName.includes(lowerQuery) || email.includes(lowerQuery) || company.includes(lowerQuery);
      })
      .slice(0, 8)
      .map(contact => ({
        id: contact.id,
        type: 'contact' as const,
        name: contact.full_name || 'Unknown',
        email: contact.email || undefined,
        company: contact.company?.name || undefined,
        role: contact.role_title || undefined
      }));
    
    // TODO: Add team members here when available
    const teamOptions: MentionOption[] = [];
    
    return [...contactOptions, ...teamOptions];
  }, [contacts]);

  // Detect mentions (@) and variables ([]) in input
  const detectMentionsAndVariables = useCallback((value: string, cursorPosition: number) => {
    // Detect @ mentions
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find @ mentions
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const newlineIndex = textAfterAt.indexOf('\n');
      
      const endIndex = Math.min(
        spaceIndex === -1 ? Infinity : spaceIndex,
        newlineIndex === -1 ? Infinity : newlineIndex,
        textAfterAt.length
      );
      
      if (endIndex === textAfterAt.length && !afterCursor.startsWith(' ')) {
        const query = textAfterAt;
        setMentionQuery(query);
        setMentionOptions(generateMentionOptions(query));
        setShowMentions(true);
        setSelectedMentionIndex(0);
        
        // Calculate position for dropdown
        if (inputRef.current) {
          const textArea = inputRef.current;
          const rect = textArea.getBoundingClientRect();
          const style = getComputedStyle(textArea);
          const fontSize = parseInt(style.fontSize);
          const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
          
          // Estimate cursor position (simplified)
          const lines = beforeCursor.split('\n');
          const currentLine = lines.length - 1;
          const charInLine = lines[lines.length - 1].length;
          
          setMentionPosition({
            top: rect.top + (currentLine + 1) * lineHeight + 8,
            left: rect.left + Math.min(charInLine * 8, rect.width - 320) // Estimate char width
          });
        }
        return;
      }
    }
    
    // Find [ variables
    const lastBracketIndex = beforeCursor.lastIndexOf('[');
    if (lastBracketIndex !== -1) {
      const textAfterBracket = beforeCursor.substring(lastBracketIndex + 1);
      const closeBracketIndex = textAfterBracket.indexOf(']');
      
      if (closeBracketIndex === -1) {
        const query = textAfterBracket;
        setVariableQuery(query);
        setShowVariables(true);
        setSelectedVariableIndex(0);
        
        // Calculate position for dropdown
        if (inputRef.current) {
          const textArea = inputRef.current;
          const rect = textArea.getBoundingClientRect();
          const style = getComputedStyle(textArea);
          const fontSize = parseInt(style.fontSize);
          const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
          
          const lines = beforeCursor.split('\n');
          const currentLine = lines.length - 1;
          const charInLine = lines[lines.length - 1].length;
          
          setVariablePosition({
            top: rect.top + (currentLine + 1) * lineHeight + 8,
            left: rect.left + Math.min(charInLine * 8, rect.width - 380)
          });
        }
        return;
      }
    }
    
    // Hide dropdowns if no matches
    setShowMentions(false);
    setShowVariables(false);
  }, [generateMentionOptions]);

  // Extract mentions and variables from text
  const extractMentionsAndVariables = useCallback((text: string) => {
    // Extract mentions
    const mentions: Array<{id: string, type: 'contact' | 'user', name: string, email?: string, company?: string}> = [];
    const mentionMatches = text.match(/@\[([^\]]+)\]\(([^)]+)\)/g);
    if (mentionMatches) {
      mentionMatches.forEach(match => {
        const result = match.match(/@\[([^\]]+)\]\(([^)]+)\)/);
        if (result) {
          const [, name, id] = result;
          const contact = contacts?.find(c => c.id === id);
          if (contact) {
            mentions.push({
              id: contact.id,
              type: 'contact',
              name: contact.full_name || name,
              email: contact.email || undefined,
              company: contact.company?.name || undefined
            });
          }
        }
      });
    }
    
    // Extract and resolve variables
    const variables = resolveVariables(text);
    
    setActiveMentions(mentions);
    setActiveVariables(variables);
    
    return { mentions, variables };
  }, [contacts]);

  // Generate intelligent suggestions based on input
  const generateSuggestions = useCallback((value: string): Suggestion[] => {
    try {
      const allSuggestions: Suggestion[] = []
      const lowerValue = value.toLowerCase()

    // Contact suggestions (with null-safe validation)
    const contactMatches = (contacts || [])
      .filter(contact => 
        contact?.full_name?.toLowerCase().includes(lowerValue) ||
        (contact?.company?.name && contact.company.name.toLowerCase().includes(lowerValue)) ||
        (contact?.role_title && contact.role_title.toLowerCase().includes(lowerValue))
      )
      .slice(0, 3)
      .map(contact => ({
        type: 'contact' as const,
        value: contact.full_name,
        displayValue: `${contact.full_name}${contact.role_title ? ` - ${contact.role_title}` : ''}${contact.company?.name ? ` at ${contact.company.name}` : ''}`,
        icon: User,
        score: contact.score,
        context: `Status: ${contact.status}, Score: ${contact.score}/100`,
        id: contact.id,
        data: contact
      }))

    // Company suggestions (with null-safe validation)
    const companyMatches = (companies || [])
      .filter(company => company?.name?.toLowerCase().includes(lowerValue))
      .slice(0, 3)
      .map(company => ({
        type: 'company' as const,
        value: company.name,
        displayValue: company.name,
        icon: Building2,
        context: `Industry: ${company.industry_id || 'Unknown'}, Size: ${company.employee_count || 'Unknown'}`,
        id: company.id,
        data: company
      }))

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
    let templateType: Action['type'] | null = null
    if (lowerValue.includes('call') || lowerValue.includes('llamar')) templateType = 'call'
    else if (lowerValue.includes('email') || lowerValue.includes('correo')) templateType = 'email'
    else if (lowerValue.includes('meeting') || lowerValue.includes('reunion')) templateType = 'meeting'
    else if (lowerValue.includes('proposal') || lowerValue.includes('propuesta')) templateType = 'proposal'
    else if (lowerValue.includes('demo')) templateType = 'demo'
    else if (lowerValue.includes('task') || lowerValue.includes('tarea')) templateType = 'task'
    
    const templateMatches = (templates || [])
      .filter(template => 
        template && 
        (!templateType || template.type === templateType) &&
        (template.name?.toLowerCase().includes(lowerValue) ||
         template.description?.toLowerCase().includes(lowerValue) ||
         template.tags?.some(tag => tag?.toLowerCase().includes(lowerValue)))
      )
      .slice(0, 3)
      .map(template => ({
        type: 'template' as const,
        value: template.name,
        displayValue: template.name,
        icon: Target,
        category: template.category || template.type,
        context: `${template.type} template • Used ${template.usage_count} times`,
        id: template.id,
        data: template
      }))
      
    allSuggestions.push(...templateMatches)

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

      return [...contactMatches, ...companyMatches, ...allSuggestions].slice(0, 6)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return []
    }
  }, [contacts, companies, templates])

  // Generate action preview with AI analysis
  const generateActionPreview = useCallback((prompt: string): ActionPreview => {
    try {
      const lowerPrompt = prompt.toLowerCase()
    
    const hasContact = selectedContact || (contacts || []).some(contact => 
      contact?.full_name && lowerPrompt.includes(contact.full_name.toLowerCase())
    )
    const hasCompany = selectedCompany || (companies || []).some(company => 
      company?.name && lowerPrompt.includes(company.name.toLowerCase())
    )
    const hasTimeline = /\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|this week|mañana|hoy|próxima semana)\b/.test(lowerPrompt)
    
    let successProbability = 65 // Base probability
    const riskFactors: string[] = []
    const tips: string[] = []
    
    // Adjust probability based on context
    if (hasContact && hasCompany) successProbability += 15
    if (hasTimeline) successProbability += 10
    if (prompt.includes('$') || lowerPrompt.includes('budget') || lowerPrompt.includes('price')) successProbability += 10
    if (selectedTemplate) successProbability += 5
    
    // Add risk factors
    if (!hasContact) riskFactors.push('No specific contact mentioned')
    if (!hasTimeline) riskFactors.push('No timeline specified')
    if (prompt.length < 20) riskFactors.push('Limited context provided')
    
    // Add tips based on selected data
    if (selectedContact) {
      tips.push(`Reference ${selectedContact.full_name}'s recent activity`)
      if (selectedContact.score > 70) tips.push('High-score contact - prioritize this action')
    }
    if (selectedCompany) {
      tips.push(`Mention industry trends for ${selectedCompany.industry_id || 'their sector'}`)
    }
    if (selectedTemplate) {
      tips.push(`Using proven template with ${selectedTemplate.usage_count} successful uses`)
    }
    tips.push('Schedule during optimal engagement hours')
    
      return {
        title: 'AI-Generated Sales Action',
        description: prompt.length > 50 
          ? 'Comprehensive action with detailed context' 
          : 'Quick action - consider adding more details',
        successProbability: Math.min(95, successProbability),
        estimatedTime: selectedTemplate?.avg_completion_time ? `${selectedTemplate.avg_completion_time} minutes` : '15-30 minutes',
        suggestedTiming: 'Today 2-4 PM (peak engagement)',
        riskFactors,
        tips
      }
    } catch (error) {
      console.error('Error generating action preview:', error)
      return {
        title: 'AI-Generated Sales Action',
        description: 'Error generating preview',
        successProbability: 50,
        estimatedTime: '15-30 minutes',
        suggestedTiming: 'Today',
        riskFactors: ['Preview generation failed'],
        tips: []
      }
    }
  }, [contacts, companies, selectedContact, selectedCompany, selectedTemplate])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setInputValue(value);
    
    // Detect mentions and variables at cursor position
    detectMentionsAndVariables(value, cursorPosition);
    
    // Extract mentions and variables from the full text
    extractMentionsAndVariables(value);
    
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

  // Handle mention selection
  const handleMentionSelect = useCallback((mention: MentionOption) => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
    
    // Find the @ position before cursor
    const beforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = value.substring(0, lastAtIndex);
      const afterCursor = value.substring(cursorPos);
      const mentionText = `@[${mention.name}](${mention.id})`;
      const newValue = beforeAt + mentionText + ' ' + afterCursor;
      
      setInputValue(newValue);
      setShowMentions(false);
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newCursorPos = beforeAt.length + mentionText.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  }, []);
  
  // Handle variable selection
  const handleVariableSelect = useCallback((variable: VariableOption) => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
    
    // Find the [ position before cursor
    const beforeCursor = value.substring(0, cursorPos);
    const lastBracketIndex = beforeCursor.lastIndexOf('[');
    
    if (lastBracketIndex !== -1) {
      const beforeBracket = value.substring(0, lastBracketIndex);
      const afterCursor = value.substring(cursorPos);
      const variableText = `[${variable.key}]`;
      const newValue = beforeBracket + variableText + ' ' + afterCursor;
      
      setInputValue(newValue);
      setShowVariables(false);
      
      // Set cursor position after the variable
      setTimeout(() => {
        const newCursorPos = beforeBracket.length + variableText.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    if (suggestion.type === 'template' && suggestion.data) {
      setSelectedTemplate(suggestion.data)
      setInputValue(suggestion.data.description || suggestion.displayValue)
    } else if (suggestion.type === 'contact' && suggestion.data) {
      setSelectedContact(suggestion.data)
      setInputValue(prev => {
        const contactMention = `${suggestion.data.full_name}${suggestion.data.company?.name ? ` from ${suggestion.data.company.name}` : ''}`
        if (prev.trim() === '') return `Create action for ${contactMention}: `
        return prev.includes(suggestion.data.full_name) ? prev : `${prev} ${contactMention}`
      })
    } else if (suggestion.type === 'company' && suggestion.data) {
      setSelectedCompany(suggestion.data)
      setInputValue(prev => {
        const companyMention = suggestion.data.name
        if (prev.trim() === '') return `Create action for ${companyMention}: `
        return prev.includes(companyMention) ? prev : `${prev} ${companyMention}`
      })
    } else {
      setInputValue(prev => `${prev} ${suggestion.displayValue}`)
    }
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle mentions dropdown navigation
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionOptions.length - 1 ? prev + 1 : prev
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (mentionOptions[selectedMentionIndex]) {
          handleMentionSelect(mentionOptions[selectedMentionIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    
    // Handle variables dropdown navigation
    if (showVariables) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedVariableIndex(prev => prev + 1);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedVariableIndex(prev => prev > 0 ? prev - 1 : 0);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Get the default variable options since we don't pass custom ones
        const defaultVariables = [
          { key: 'today', label: 'Today', description: 'Current date', type: 'date' as const, category: 'time' as const, icon: <Calendar className="w-4 h-4" /> },
          { key: 'tomorrow', label: 'Tomorrow', description: 'Next day', type: 'date' as const, category: 'time' as const, icon: <Calendar className="w-4 h-4" /> },
          { key: 'next week', label: 'Next Week', description: 'One week from today', type: 'date' as const, category: 'time' as const, icon: <Calendar className="w-4 h-4" /> },
          // ... other default variables would be here
        ];
        if (defaultVariables[selectedVariableIndex]) {
          handleVariableSelect(defaultVariables[selectedVariableIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowVariables(false);
        return;
      }
    }
    
    // Handle regular suggestions navigation
    if (showSuggestions) {
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
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim()) return
    
    try {
      setIsGenerating(true)
      setError(null)
      
      // Use the new Claude API endpoint
      const response = await fetch('/api/generate-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: inputValue,
          userId: 'temp-user-id', // TODO: Get from auth context
          mentions: activeMentions,
          contacts: contacts || [],
          templates: (templates || []).map(t => t.name)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate action');
      }
      
      const result = await response.json();
      
      if (result.success && result.action && onActionCreate) {
        onActionCreate(result.action)
      }
      
      // Reset form
      setInputValue('')
      setActionPreview(null)
      setSelectedTemplate(null)
      setSelectedContact(null)
      setSelectedCompany(null)
      setActiveMentions([])
      setActiveVariables([])
      
    } catch (error) {
      console.error('Error creating action:', error)
      setError(error instanceof Error ? error.message : 'Failed to create action. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [inputValue, activeMentions, contacts, templates, onActionCreate])

  // Quick action buttons for common tasks
  const quickActions = [
    { label: 'Schedule Demo', icon: Calendar, type: 'demo' as Action['type'], prompt: 'Schedule a product demo with' },
    { label: 'Follow-up Call', icon: PhoneCall, type: 'call' as Action['type'], prompt: 'Schedule follow-up call with' },
    { label: 'Send Email', icon: Mail, type: 'email' as Action['type'], prompt: 'Send follow-up email to' },
    { label: 'Create Proposal', icon: FileText, type: 'proposal' as Action['type'], prompt: 'Generate and send proposal to' },
    { label: 'Schedule Meeting', icon: Users, type: 'meeting' as Action['type'], prompt: 'Schedule meeting with' },
    { label: 'Create Task', icon: Briefcase, type: 'task' as Action['type'], prompt: 'Create task for' }
  ]

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(action.prompt + ' ')
                      setShowQuickActions(false)
                      // Find matching template for this action type
                      const matchingTemplate = (templates || []).find(t => t?.type === action.type)
                      if (matchingTemplate) {
                        setSelectedTemplate(matchingTemplate)
                      }
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
            placeholder="Try typing: Schedule demo with @María González [tomorrow] to show [product demo]..."
            className="w-full p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 min-h-[100px] placeholder:text-gray-400"
            rows={4}
          />
          
          {/* Character Count and Help */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-gray-400">
            <div className="hidden sm:flex items-center gap-2">
              <span>@ for mentions</span>
              <span>•</span>
              <span>[ ] for variables</span>
            </div>
            <span>{inputValue.length}/500</span>
          </div>
        </div>

        {/* Selected Context Badges */}
        {(selectedTemplate || selectedContact || selectedCompany || activeMentions.length > 0 || activeVariables.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTemplate && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Template: {selectedTemplate.name}
              </Badge>
            )}
            {selectedContact && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Contact: {selectedContact.full_name}
              </Badge>
            )}
            {selectedCompany && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Company: {selectedCompany.name}
              </Badge>
            )}
            {activeMentions.map((mention, index) => (
              <Badge key={`mention-${index}`} variant="secondary" className="bg-blue-100 text-blue-700">
                <AtSign className="w-3 h-3 mr-1" />
                {mention.name}
              </Badge>
            ))}
            {activeVariables.map((variable, index) => (
              <Badge key={`variable-${index}`} variant="secondary" className="bg-orange-100 text-orange-700">
                <Hash className="w-3 h-3 mr-1" />
                {variable.key} = {variable.value}
              </Badge>
            ))}
          </div>
        )}

        {/* Mentions Dropdown */}
        <MentionDropdown
          ref={mentionDropdownRef}
          options={mentionOptions}
          isVisible={showMentions}
          selectedIndex={selectedMentionIndex}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentions(false)}
          position={mentionPosition}
          query={mentionQuery}
        />
        
        {/* Variables Dropdown */}
        <VariablesSuggestions
          ref={variableDropdownRef}
          options={[]} // Will use default options from the component
          isVisible={showVariables}
          selectedIndex={selectedVariableIndex}
          onSelect={handleVariableSelect}
          onClose={() => setShowVariables(false)}
          position={variablePosition}
          query={variableQuery}
        />

        {/* Autocomplete Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && !showMentions && !showVariables && (
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
            disabled={!inputValue.trim() || isGenerating || actionsLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                {selectedTemplate ? 'Creating from Template...' : 'Generating Action...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {selectedTemplate ? 'Create from Template' : 'Generate Action'}
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {(actionsError || error) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error creating action</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{actionsError || error}</p>
          </div>
        )}

        {/* Loading States */}
        {(actionsLoading || contactsLoading) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin h-4 w-4 border-2 border-blue-300 border-t-blue-700 rounded-full" />
              <span className="text-sm">Loading data...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}