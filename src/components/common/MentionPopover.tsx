"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mentionData, MentionCategory } from '@/data/mentionData';
import { User, Building, FileText, Users, Search } from 'lucide-react';

const categoryIcons: Record<MentionCategory, React.ElementType> = {
  contacts: User,
  companies: Building,
  reports: FileText,
  team: Users,
};

interface MentionPopoverProps {
  onSelect: (name: string, category: MentionCategory) => void;
}

export const MentionPopover = ({ onSelect }: MentionPopoverProps) => {
  const [activeCategory, setActiveCategory] = useState<MentionCategory>('contacts');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(mentionData) as MentionCategory[];
  const items = mentionData[activeCategory].filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex w-[450px] h-64">
      {/* Columna de Categorías */}
      <div className="w-1/3 border-r bg-gray-50/50 p-2">
        <div className="space-y-1">
          {categories.map(cat => {
            // --- CORRECCIÓN AQUÍ ---
            // Asignamos el componente del ícono a una variable con la primera letra en mayúscula
            const Icon = categoryIcons[cat];
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'secondary' : 'ghost'}
                className="w-full justify-start text-xs capitalize"
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchTerm('');
                }}
              >
                {/* Y ahora la usamos como un componente JSX normal */}
                <Icon className="w-4 h-4 mr-2" />
                {cat}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Columna de Items */}
      <div className="w-2/3 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input 
                  placeholder={`Search in ${activeCategory}...`} 
                  className="pl-7 h-8 text-xs" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-2">
                {items.length > 0 ? (
                    items.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => onSelect(item.name, activeCategory)}
                            className="p-2 text-xs rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-500">{item.details}</p>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-xs text-gray-500">No results found.</p>
                )}
            </ScrollArea>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};