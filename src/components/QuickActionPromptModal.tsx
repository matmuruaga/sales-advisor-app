"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X, PlusCircle, FileText, Send, Upload, FileImage, FileVideo, Music, ArrowLeft, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MentionPopover } from './common/MentionPopover';
import { MentionCategory } from '@/data/mentionData';
import { quickActionTemplates, QuickTemplate } from '@/data/quickActionTemplates';
import { QuickActionType } from '@/components/Calendar';
import { LoadingOverlay } from './common/LoadingOverlay';
import { ConversationSimulator } from './ConversationSimulator';

// Importar los formularios existentes
import { ScheduleMeetingForm } from '@/app/actions/forms/ScheduleMeetingForm';
import { GenerateCallScriptForm } from '@/app/actions/forms/GenerateCallScriptForm';
import { GenerateProposalForm } from '@/app/actions/forms/GenerateProposalForm';
import { SimulationConfigForm } from '@/components/actions/forms/SimulationConfigForm';

interface QuickActionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: QuickActionType | null;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string;
  file: File;
}

type ProcessingStep = 'input' | 'processing' | 'result' | 'simulation';

const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gray-200 text-gray-800 rounded-md px-1 py-0.5 mx-0.5 text-sm">
        {children}
    </span>
);

// Componente para vista previa de archivos
const FilePreview = ({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (isImage) return FileImage;
    if (isVideo) return FileVideo;
    if (isAudio) return Music;
    return FileText;
  };

  const FileIcon = getFileIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative">
        {isImage ? (
          <img 
            src={file.preview} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2">
            <FileIcon className="w-6 h-6 text-gray-500 mb-1" />
            <span className="text-xxs text-gray-500 truncate w-full text-center">
              {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center p-1">
            <p className="text-xxs font-medium truncate max-w-full">{file.name}</p>
            <p className="text-xxs opacity-75">{formatFileSize(file.size)}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export const QuickActionPromptModal = ({ isOpen, onClose, actionType }: QuickActionPromptModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('input');
  const [processedData, setProcessedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const actionTitles: { [key: string]: string } = {
    schedule: 'Schedule a Meeting',
    simulate: 'Simulate a Conversation',
    call: 'Generate a Call Script',
    nested: 'Analyze Nested Meetings'
  };
  
  const title = actionType ? actionTitles[actionType] : 'Quick Action';
  const currentTemplates = actionType ? quickActionTemplates[actionType] || [] : [];

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setIsMentionOpen(false);
      setIsTemplateOpen(false);
      setUploadedFiles([]);
      setCurrentStep('input');
      setProcessedData(null);
    }
  }, [isOpen]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.endsWith('@')) {
          setIsMentionOpen(true);
      } else if (isMentionOpen) {
          setIsMentionOpen(false);
      }
      setPrompt(text);
  };
  
  const handleMentionSelect = (name: string, category: MentionCategory) => {
      const newPrompt = prompt.slice(0, -1) + `@[${name}] `;
      setPrompt(newPrompt);
      setIsMentionOpen(false);
  };

  const handleTemplateSelect = (template: QuickTemplate) => {
    setPrompt(template.prompt);
    setIsTemplateOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          preview: e.target?.result as string,
          file: file
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Función para procesar el prompt y generar datos
  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    setCurrentStep('processing');
    
    setTimeout(() => {
      const mockProcessedData = generateMockData(actionType, prompt);
      setProcessedData(mockProcessedData);
      setCurrentStep('result');
    }, 3000);
  };

  // Generar datos mock basados en el tipo de acción y el prompt
  const generateMockData = (type: QuickActionType | null, userPrompt: string) => {
    switch (type) {
      case 'schedule':
        return {
          suggestedTitle: 'Follow-up Demo - TechCorp Integration',
          suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          suggestedTime: '10:00',
          extractedContact: 'María González (CTO, TechCorp)',
          suggestedAgenda: 'Discuss integration details and demonstrate key features based on previous conversation.'
        };
      case 'call':
        return {
          extractedContact: 'CTO Profile',
          callGoal: 'Discovery & Qualification',
          identifiedPainPoints: ['High Operational Costs', 'Complex Integrations'],
          suggestedOpener: 'Hi, I noticed your interest in optimizing operational costs...'
        };
      case 'simulate':
        return {
          targetProfile: 'Skeptical CTO - Enterprise Company',
          scenario: 'Pricing Objections',
          difficulty: 'Advanced',
          suggestedPersonality: 'Data-driven, Budget-conscious',
          context: 'Focus on ROI and implementation complexity concerns'
        };
      default:
        return {
          processedPrompt: userPrompt,
          suggestions: ['Auto-filled based on AI analysis']
        };
    }
  };

  const handleBack = () => {
    if (currentStep === 'simulation') {
      setCurrentStep('result');
    } else {
      setCurrentStep('input');
      setProcessedData(null);
    }
  };

  const handleStartSimulation = () => {
    setCurrentStep('simulation');
  };

  // Renderizar el formulario correspondiente según el tipo de acción
  const renderActionForm = () => {
    switch (actionType) {
      case 'schedule':
        return <ScheduleMeetingForm />;
      case 'call':
        return <GenerateCallScriptForm />;
      case 'simulate':
        return <SimulationConfigForm processedData={processedData} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Form configuration ready for execution</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-700">{JSON.stringify(processedData, null, 2)}</pre>
            </div>
          </div>
        );
    }
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

  // Si estamos en el simulador, mostrarlo
  if (currentStep === 'simulation') {
    return (
      <ConversationSimulator
        participantName={processedData?.targetProfile || 'AI Client'}
        scenario={processedData?.scenario || 'General Conversation'}
        difficulty={processedData?.difficulty || 'Medium'}
        onClose={onClose}
        onBack={handleBack}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (currentStep === 'input') onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {currentStep === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <AnimatePresence>
                    {uploadedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                          {uploadedFiles.map((file) => (
                            <FilePreview
                              key={file.id}
                              file={file}
                              onRemove={() => removeFile(file.id)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative w-full h-0"></div>
                    </PopoverTrigger>

                    <div className="relative rounded-xl border border-gray-300 bg-white p-2 focus-within:border-gray-500 transition-colors">
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
                            <Popover open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <PlusCircle className="w-4 h-4 text-gray-500" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-gray-700 px-2 mb-1">Use a template</p>
                                  {currentTemplates.length > 0 ? (
                                    currentTemplates.map((template, index) => (
                                      <Button 
                                        key={index} 
                                        onClick={() => handleTemplateSelect(template)} 
                                        variant="ghost" 
                                        className="w-full justify-start text-xs font-normal h-auto py-2"
                                      >
                                        <FileText className="w-4 h-4 mr-2"/>
                                        <span className="whitespace-normal text-left">{template.title}</span>
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 px-2 py-2">No templates available for this action</p>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={triggerFileUpload}
                            >
                              <Upload className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="rounded-full h-10 w-10 bg-transparent border border-gray-900 hover:bg-gray-50 transition-colors"
                          onClick={handleSubmit}
                          disabled={!prompt.trim()}
                        >
                          <Send className="w-4 h-4 text-gray-900" />
                        </Button>
                      </div>
                    </div>

                    <PopoverContent className="w-auto p-0" side="top" align="start">
                        <MentionPopover onSelect={handleMentionSelect} />
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )}

              {currentStep === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] flex flex-col"
                >
                  <div className="flex-shrink-0 p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleBack}
                          className="h-8 w-8"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-purple-600" />
                          Configure: {title}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    {renderActionForm()}
                  </div>

                  <div className="flex-shrink-0 p-6 border-t">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                      onClick={actionType === 'simulate' ? handleStartSimulation : undefined}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {actionType === 'simulate' ? 'Start Simulation' : 'Execute Action'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {currentStep === 'input' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="absolute top-4 right-4 bg-black/10 text-white/80 hover:bg-black/20 hover:text-white rounded-full"
            >
              <X className="w-5 h-5"/>
            </Button>
          )}
        </motion.div>
      )}
      
      <LoadingOverlay 
        isProcessing={currentStep === 'processing'}
        onComplete={() => {}}
      />
    </AnimatePresence>
  );
};