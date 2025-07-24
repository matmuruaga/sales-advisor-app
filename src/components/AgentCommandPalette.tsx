import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Search,
  Database,
  Users,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AgentCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ---------- Suggested quick-prompts ---------- */
const suggestedPrompts = [
  "Summarize yesterday's meetings",
  'KPIs for the TechCorp opportunity',
  'Find leads in the fintech sector',
];

/* ---------- Sequential loading messages ---------- */
const loadingSteps = [
  { icon: Search, text: 'Analyzing your request...' },
  { icon: Database, text: 'Accessing meeting database...' },
  { icon: Users, text: 'Reviewing lead profiles involved...' },
  { icon: BarChart3, text: 'Building the result...' },
  { icon: CheckCircle, text: 'Done!' },
];

export function AgentCommandPalette({
  isOpen,
  onClose,
}: AgentCommandPaletteProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  /* ---------- Loading sequence logic ---------- */
  useEffect(() => {
    if (!isProcessing) return;

    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prevStep) => {
        if (prevStep >= loadingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            onClose();
          }, 1200);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing, onClose]);

  const handlePromptSubmit = (text: string) => {
    if (!text || isProcessing) return;
    setPrompt(''); // Clear prompt on submit
    setIsProcessing(true);
  };

  const stopPropagation = (
    e: React.MouseEvent | React.TouchEvent,
  ) => e.stopPropagation();

  /* ---------- Command-palette (prompt) view ---------- */
  const PromptView = () => (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-xl rounded-2xl w-[700px] shadow-2xl ring-1 ring-black/10 flex items-center p-3 space-x-3"
      onClick={stopPropagation}
    >
      <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
      <div className="flex-1 flex flex-col items-start">
        <motion.div className="flex items-center gap-2 mb-2">
          {suggestedPrompts.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-auto text-xxs px-2 py-1 bg-white/50"
                onClick={() => handlePromptSubmit(p)}
              >
                {p}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        <Input
          placeholder="Ask anything to your AI agent..."
          className="w-full bg-transparent border-0 focus-visible:ring-0 text-base p-0 h-auto"
          value={prompt}
          autoFocus
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handlePromptSubmit(prompt);
          }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="rounded-full"
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );

  /* ---------- Full-screen loader view ---------- */
  const LoaderView = () => (
    <motion.div
      key="loader"
      className="w-full h-full flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={loadingStep}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="text-center flex flex-col items-center"
        >
          {React.createElement(loadingSteps[loadingStep].icon, {
            className: 'w-16 h-16 text-gray-800 mb-6',
          })}
          <p className="text-2xl font-semibold text-gray-900">
            {loadingSteps[loadingStep].text}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  /* ---------- Overlay with conditional content ---------- */
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => !isProcessing && onClose()}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <LoaderView />
            ) : (
              /* Prompt view shown when not processing */
              <PromptView />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
