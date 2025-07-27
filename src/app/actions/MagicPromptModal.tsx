"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { promptTemplates } from '@/data/promptTemplates';
import { X, PlusCircle, FileText, Send } from 'lucide-react';

interface MagicPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (prompt: string) => void;
}

export const MagicPromptModal = ({ isOpen, onClose, onExecute }: MagicPromptModalProps) => {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      onExecute(prompt);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Describe the action you want to perform, and the AI agent will configure it for you.
                </p>
              </div>

              {/* Contenedor del prompt sin el anillo de foco violeta */}
              <div className="relative rounded-xl border border-gray-300 bg-white p-2 focus-within:border-gray-500 transition-colors">
                <Textarea
                  placeholder="e.g., Generate a proposal for TechCorp with a value of $50,000..."
                  className="w-full bg-transparent border-0 resize-none focus-visible:ring-0 shadow-none p-2 text-sm text-gray-900 placeholder:text-gray-400"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <PlusCircle className="w-4 h-4 text-gray-500" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700 px-2 mb-1">Use a template</p>
                                {promptTemplates.map(template => (
                                <Button key={template.id} onClick={() => handleTemplateSelect(template.prompt)} variant="ghost" className="w-full justify-start text-xs font-normal h-auto py-2">
                                    <FileText className="w-4 h-4 mr-2"/>
                                    <span className="whitespace-normal text-left">{template.title}</span>
                                </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                  {/* Botón de enviar con nuevo estilo */}
                  <Button onClick={handleSubmit} size="icon" variant="outline" className="h-8 w-8 rounded-lg bg-transparent border border-black text-black hover:bg-gray-100">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 bg-black/10 text-white/80 hover:bg-black/20 hover:text-white rounded-full">
            <X className="w-5 h-5"/>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};