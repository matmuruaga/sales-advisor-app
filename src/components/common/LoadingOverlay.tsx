"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bot, FilePlus, CheckCircle } from 'lucide-react';

const loadingSteps = [
  { icon: Search, text: 'Analyzing your request...' },
  { icon: Bot, text: 'Understanding context and intent...' },
  { icon: FilePlus, text: 'Configuring the action...' },
  { icon: CheckCircle, text: 'Done!' },
];

interface LoadingOverlayProps {
  isProcessing: boolean;
  onComplete: () => void;
}

export const LoadingOverlay = ({ isProcessing, onComplete }: LoadingOverlayProps) => {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prevStep) => {
        if (prevStep >= loadingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1000); // Pequeña pausa en el "Done!"
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 1500); // Duración de cada paso

    return () => clearInterval(interval);
  }, [isProcessing, onComplete]);

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
                key={loadingStep}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="text-center flex flex-col items-center"
            >
              {React.createElement(loadingSteps[loadingStep].icon, { className: "w-12 h-12 text-white mb-6" })}
              <p className="text-xl font-semibold text-white">{loadingSteps[loadingStep].text}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};