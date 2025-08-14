'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Mail } from 'lucide-react';

export interface MentionOption {
  id: string;
  type: 'contact' | 'user';
  name: string;
  email?: string;
  company?: string;
  role?: string;
  avatar?: string;
}

interface MentionDropdownProps {
  options: MentionOption[];
  isVisible: boolean;
  selectedIndex: number;
  onSelect: (option: MentionOption) => void;
  onClose: () => void;
  position: { top: number; left: number };
  query: string;
}

export const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  ({ options, isVisible, selectedIndex, onSelect, onClose, position, query }, ref) => {
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

    return (
      <div
        ref={dropdownRef}
        className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-64 overflow-y-auto"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <span>Mention someone</span>
            {query && (
              <span className="ml-2 text-blue-600 font-medium">
                "{query}"
              </span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="py-1">
          {options.map((option, index) => (
            <div
              key={option.id}
              className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 border-r-2 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(option)}
            >
              {/* Avatar */}
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback className="text-xs">
                  {option.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {option.name}
                  </span>
                  <Badge 
                    variant={option.type === 'contact' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {option.type === 'contact' ? 'Contact' : 'Team'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  {option.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-32">{option.email}</span>
                    </div>
                  )}
                  {option.company && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate max-w-24">{option.company}</span>
                    </div>
                  )}
                </div>
                
                {option.role && (
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {option.role}
                  </div>
                )}
              </div>

              {/* Type Icon */}
              <div className="ml-2">
                {option.type === 'contact' ? (
                  <User className="w-4 h-4 text-blue-500" />
                ) : (
                  <User className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
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

MentionDropdown.displayName = 'MentionDropdown';

export default MentionDropdown;