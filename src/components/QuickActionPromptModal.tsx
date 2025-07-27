"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, PlusCircle, FileText, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MentionPopover } from './common/MentionPopover';
import { MentionCategory } from '@/data/mentionData';

interface QuickActionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string | null;
}

const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gray-200 text-gray-800 rounded-md px-1 py-0.5 mx-0.5 text-sm">
        {children}
    </span>
);

export const QuickActionPromptModal = ({ isOpen, onClose, actionType }: QuickActionPromptModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isMentionOpen, setIsMentionOpen] = useState(false);

  const actionTitles: { [key: string]: string } = {
    schedule: 'Schedule a Meeting',
    simulate: 'Simulate a Conversation',
    call: 'Generate a Call Script',
    nested: 'Analyze Nested Meetings'
  };
  
  const title = actionType ? actionTitles[actionType] : 'Quick Action';

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setIsMentionOpen(false); // Asegurarse de que el popover se cierre
    }
  }, [isOpen]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.endsWith('@')) {
          setIsMentionOpen(true);
      } else if (isMentionOpen) { // Cerrar si el usuario borra el @ o sigue escribiendo
          setIsMentionOpen(false);
      }
      setPrompt(text);
  };
  
  const handleMentionSelect = (name: string, category: MentionCategory) => {
      const newPrompt = prompt.slice(0, -1) + `@[${name}] `; // Añadir espacio para seguir escribiendo
      setPrompt(newPrompt);
      setIsMentionOpen(false);
  };
  
  const renderPromptWithTags = () => {
    const parts = prompt.split(/(\@\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('@[') && part.endsWith(']')) {
        const tagName = part.substring(2, part.length - 1);
        return <Tag key={i}>@{tagName}</Tag>;
      }
      return <span key={i}>{part}</span>;
    });
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
              
              {/* --- ESTRUCTURA CORREGIDA --- */}
              {/* El Popover ahora envuelve solo el contenido que debe mostrar, no el trigger */}
              <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
                <PopoverTrigger asChild>
                  {/* Este div invisible ancla la posición del Popover al Textarea */}
                  <div className="relative w-full h-0"></div>
                </PopoverTrigger>

                <div className="relative rounded-xl bg-white p-2 transition-colors">
                  <div className="absolute top-2 left-2 p-2 pointer-events-none text-sm whitespace-pre-wrap">
                    {renderPromptWithTags()}
                  </div>
                  <Textarea
                    placeholder="Describe what you want to do... Use '@' to mention contacts or companies."
                    className="w-full bg-transparent border-0 resize-none focus-visible:ring-0 shadow-none p-2 text-sm text-transparent caret-gray-900"
                    rows={4}
                    value={prompt}
                    onChange={handlePromptChange}
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <PlusCircle className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="w-4 h-4 text-gray-500" />
                        </Button>
                    </div>
                    {/* Botón minimalista redondo con borde fino */}
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="rounded-full h-10 w-10 bg-transparent border border-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Send className="w-4 h-4 text-gray-900" />
                    </Button>
                  </div>
                </div>

                <PopoverContent className="w-auto p-0" side="top" align="start">
                    <MentionPopover onSelect={handleMentionSelect} />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/10 text-white/80 hover:bg-black/20 hover:text-white rounded-full"
          >
            <X className="w-5 h-5"/>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};