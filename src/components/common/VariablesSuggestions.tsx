'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Link, MapPin, FileText, Calculator, Users, Mail } from 'lucide-react';

export interface VariableOption {
  key: string;
  label: string;
  description: string;
  type: 'date' | 'link' | 'text' | 'contact';
  category: 'time' | 'resources' | 'contacts' | 'tools';
  icon: React.ReactNode;
  preview?: string;
}

interface VariablesSuggestionsProps {
  options: VariableOption[];
  isVisible: boolean;
  selectedIndex: number;
  onSelect: (option: VariableOption) => void;
  onClose: () => void;
  position: { top: number; left: number };
  query: string;
}

// Default variable options
const DEFAULT_VARIABLES: VariableOption[] = [
  // Time variables
  {
    key: 'today',
    label: 'Today',
    description: 'Current date',
    type: 'date',
    category: 'time',
    icon: <Calendar className="w-4 h-4" />,
    preview: new Date().toLocaleDateString()
  },
  {
    key: 'tomorrow',
    label: 'Tomorrow',
    description: 'Next day',
    type: 'date',
    category: 'time',
    icon: <Calendar className="w-4 h-4" />,
    preview: new Date(Date.now() + 86400000).toLocaleDateString()
  },
  {
    key: 'next week',
    label: 'Next Week',
    description: 'One week from today',
    type: 'date',
    category: 'time',
    icon: <Calendar className="w-4 h-4" />,
    preview: new Date(Date.now() + 7 * 86400000).toLocaleDateString()
  },
  {
    key: 'next month',
    label: 'Next Month',
    description: 'One month from today',
    type: 'date',
    category: 'time',
    icon: <Calendar className="w-4 h-4" />,
    preview: 'Next month'
  },
  {
    key: 'end of quarter',
    label: 'End of Quarter',
    description: 'Last day of current quarter',
    type: 'date',
    category: 'time',
    icon: <Clock className="w-4 h-4" />,
    preview: 'Q end'
  },

  // Resource variables
  {
    key: 'my calendar',
    label: 'My Calendar',
    description: 'Link to your calendar',
    type: 'link',
    category: 'resources',
    icon: <Calendar className="w-4 h-4" />,
    preview: 'calendar.google.com'
  },
  {
    key: 'meeting room',
    label: 'Meeting Room',
    description: 'Available meeting room',
    type: 'text',
    category: 'resources',
    icon: <MapPin className="w-4 h-4" />,
    preview: 'Conference Room A'
  },
  {
    key: 'product demo',
    label: 'Product Demo',
    description: 'Link to product demo',
    type: 'link',
    category: 'resources',
    icon: <Link className="w-4 h-4" />,
    preview: 'demo.salesadvisor.app'
  },
  {
    key: 'pricing',
    label: 'Pricing Info',
    description: 'Link to pricing page',
    type: 'link',
    category: 'resources',
    icon: <FileText className="w-4 h-4" />,
    preview: 'salesadvisor.app/pricing'
  },
  {
    key: 'proposal template',
    label: 'Proposal Template',
    description: 'Standard proposal template',
    type: 'link',
    category: 'resources',
    icon: <FileText className="w-4 h-4" />,
    preview: 'docs.salesadvisor.app'
  },

  // Tools variables
  {
    key: 'roi calculator',
    label: 'ROI Calculator',
    description: 'Return on investment calculator',
    type: 'link',
    category: 'tools',
    icon: <Calculator className="w-4 h-4" />,
    preview: 'salesadvisor.app/roi'
  },
  {
    key: 'case study',
    label: 'Case Study',
    description: 'Customer success stories',
    type: 'link',
    category: 'tools',
    icon: <FileText className="w-4 h-4" />,
    preview: 'salesadvisor.app/cases'
  },
  {
    key: 'trial signup',
    label: 'Trial Signup',
    description: 'Free trial registration',
    type: 'link',
    category: 'tools',
    icon: <Users className="w-4 h-4" />,
    preview: 'salesadvisor.app/trial'
  },
  {
    key: 'support',
    label: 'Support Contact',
    description: 'Customer support email',
    type: 'contact',
    category: 'contacts',
    icon: <Mail className="w-4 h-4" />,
    preview: 'support@salesadvisor.app'
  }
];

const CATEGORY_COLORS = {
  time: 'bg-blue-100 text-blue-800',
  resources: 'bg-green-100 text-green-800',
  contacts: 'bg-purple-100 text-purple-800',
  tools: 'bg-orange-100 text-orange-800'
};

export const VariablesSuggestions = forwardRef<HTMLDivElement, VariablesSuggestionsProps>(
  ({ options = DEFAULT_VARIABLES, isVisible, selectedIndex, onSelect, onClose, position, query }, ref) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current = dropdownRef.current;
      }
    }, [ref]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      if (isVisible) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isVisible, onClose]);

    if (!isVisible || options.length === 0) {
      return null;
    }

    // Filter options based on query
    const filteredOptions = query 
      ? options.filter(option => 
          option.key.toLowerCase().includes(query.toLowerCase()) ||
          option.label.toLowerCase().includes(query.toLowerCase()) ||
          option.description.toLowerCase().includes(query.toLowerCase())
        )
      : options;

    // Group by category
    const groupedOptions = filteredOptions.reduce((acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {} as Record<string, VariableOption[]>);

    return (
      <div
        ref={dropdownRef}
        className="fixed z-50 w-96 bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-80 overflow-y-auto"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <span>Insert variable</span>
            {query && (
              <span className="ml-2 text-blue-600 font-medium">
                "{query}"
              </span>
            )}
          </div>
        </div>

        {/* Options grouped by category */}
        <div className="py-1">
          {Object.entries(groupedOptions).map(([category, categoryOptions], categoryIndex) => (
            <div key={category}>
              {/* Category header */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {category}
              </div>

              {/* Category options */}
              {categoryOptions.map((option, optionIndex) => {
                const globalIndex = Object.entries(groupedOptions)
                  .slice(0, categoryIndex)
                  .reduce((acc, [, opts]) => acc + opts.length, 0) + optionIndex;

                return (
                  <div
                    key={option.key}
                    className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                      globalIndex === selectedIndex
                        ? 'bg-blue-50 border-r-2 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelect(option)}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <div className="text-gray-600">
                        {option.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          [{option.key}]
                        </span>
                        <Badge 
                          className={`text-xs ${CATEGORY_COLORS[option.category]}`}
                          variant="secondary"
                        >
                          {option.type}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                      
                      {option.preview && (
                        <div className="text-xs text-gray-400 mt-1 font-mono">
                          Preview: {option.preview}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div className="px-3 py-8 text-center text-gray-500">
              <div className="text-sm">No variables found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      </div>
    );
  }
);

VariablesSuggestions.displayName = 'VariablesSuggestions';

export default VariablesSuggestions;