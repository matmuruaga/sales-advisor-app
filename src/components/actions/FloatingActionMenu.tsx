"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, Mail, Calendar, FileText, X } from 'lucide-react';

interface FloatingActionMenuProps {
  onAction: (action: string) => void;
}

export function FloatingActionMenu({ onAction }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'call', icon: Phone, label: 'New Call', color: 'bg-green-500' },
    { id: 'email', icon: Mail, label: 'New Email', color: 'bg-blue-500' },
    { id: 'meeting', icon: Calendar, label: 'Schedule Meeting', color: 'bg-purple-500' },
    { id: 'note', icon: FileText, label: 'Add Note', color: 'bg-yellow-500' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20, 
                  scale: 0.8,
                  transition: { delay: (actions.length - index) * 0.05 }
                }}
                onClick={() => {
                  onAction(action.id);
                  setIsOpen(false);
                }}
                className={`${action.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center gap-3 pr-4`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}