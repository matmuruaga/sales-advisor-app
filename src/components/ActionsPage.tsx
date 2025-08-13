"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionDock } from '@/components/actions/ActionDock';
import { actionCategories } from '@/data/actionCategories';
import { ActionWorkspace } from './actions/ActionWorkspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  LayoutGrid, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react';
// Import refactored components
import { SmartActionComposer } from './actions/SmartActionComposer';
import { ActionTemplatesGallery } from './actions/ActionTemplatesGallery';
import { EnhancedTemplatesGallery } from './actions/EnhancedTemplatesGallery';
import { ActiveActionsDashboard } from './actions/ActiveActionsDashboard';
import { SuccessMetricsPanel } from './actions/SuccessMetricsPanel';
import { AIRecommendationCards } from './actions/AIRecommendationCards';
import { EnhancedAIRecommendations } from './actions/EnhancedAIRecommendations';
import { CompactAIRecommendations } from './actions/CompactAIRecommendations';
import { BulkActionBar } from './actions/BulkActionBar';
import { MagicPromptModal } from '@/app/actions/MagicPromptModal';
import { LoadingOverlay } from './common/LoadingOverlay';
import { FloatingActionMenu } from './actions/FloatingActionMenu';

export function ActionsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(actionCategories[0].id);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'enhanced' | 'legacy'>('enhanced');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // New states for progressive disclosure
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAISidebarCollapsed, setIsAISidebarCollapsed] = useState(false);

  const selectedCategoryObject = actionCategories.find(c => c.id === activeCategory);

  const handleExecutePrompt = (prompt: string) => {
    console.log('Executing Magic Prompt:', prompt);
    setIsProcessing(true);
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'for', selectedActions.length, 'items');
    setSelectedActions([]);
    setIsBulkMode(false);
  };

  const handleFloatingAction = (action: string) => {
    console.log('Floating action:', action);
    // Handle floating menu actions
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with filters and view toggle */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center flex-shrink-0 mb-6"
          >
            <div className="flex items-center space-x-2">
              <ActionDock
                categories={actionCategories}
                activeCategory={activeCategory}
                onCategorySelect={setActiveCategory}
              />
              {/* Magic Wand Button */}
              <div className="relative">
                <div className="rounded-full bg-gradient-to-br from-purple-200 to-pink-300 p-px shadow-sm hover:shadow-lg transition-shadow">
                  <Button onClick={() => setIsPromptOpen(true)} variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                  </Button>
                </div>
                <Badge className="absolute -top-1 -right-10 text-xxs bg-purple-500 text-white border-purple-600">AI</Badge>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isFocusMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                  viewMode === 'enhanced' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Enhanced
              </button>
              <button
                onClick={() => setViewMode('legacy')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                  viewMode === 'legacy' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Classic
              </button>
              {viewMode === 'enhanced' && !isFocusMode && (
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`ml-2 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                    isBulkMode 
                      ? 'bg-purple-100 text-purple-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Bulk Mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'enhanced' ? (
            <motion.div
              key="enhanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {/* Enhanced View with Progressive Disclosure */}
              {isFocusMode ? (
                // Focus Mode - Only Action Composer
                <div className="flex justify-center items-start pt-12">
                  <div className="w-full max-w-4xl">
                    <SmartActionComposer 
                      category={activeCategory || 'all'}
                      onActionCreate={(action) => console.log('Action created:', action)}
                    />
                    
                    <button
                      onClick={() => setIsFocusMode(false)}
                      className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Exit Focus Mode
                    </button>
                    
                    <FloatingActionMenu onAction={handleFloatingAction} />
                  </div>
                </div>
              ) : (
                // Normal Mode with Progressive Disclosure
                <div className={`grid ${isAISidebarCollapsed ? 'grid-cols-12' : 'grid-cols-12'} gap-6 h-full`}>
                  {/* Main Content Area */}
                  <div className={`${isAISidebarCollapsed ? 'col-span-11' : 'col-span-12 lg:col-span-8'} space-y-6 overflow-y-auto pr-2`}>
                    {/* Always Visible: Smart Action Composer */}
                    <SmartActionComposer 
                      category={activeCategory || 'all'}
                      onActionCreate={(action) => console.log('Action created:', action)}
                    />
                    
                    {/* Progressive Disclosure: Advanced Tools */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl p-4">
                      <button
                        onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Advanced Tools</span>
                          <Badge variant="secondary" className="text-xs">
                            Templates • Active Actions • Performance
                          </Badge>
                        </div>
                        {showAdvancedTools ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {showAdvancedTools && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 space-y-6">
                              {/* Enhanced Templates Gallery with UX improvements */}
                              <EnhancedTemplatesGallery 
                                category={activeCategory || 'all'}
                                onTemplateSelect={(template) => console.log('Template selected:', template)}
                              />
                              
                              {/* Active Actions Dashboard */}
                              <ActiveActionsDashboard 
                                category={activeCategory || 'all'}
                                isBulkMode={isBulkMode}
                                selectedActions={selectedActions}
                                onSelectionChange={setSelectedActions}
                              />
                              
                              {/* Success Metrics Panel */}
                              <SuccessMetricsPanel category={activeCategory || 'all'} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Collapsible AI Sidebar */}
                  <div className={`${isAISidebarCollapsed ? 'col-span-1' : 'col-span-12 lg:col-span-4'} relative`}>
                    {isAISidebarCollapsed ? (
                      // Collapsed Sidebar
                      <div className="bg-white/70 backdrop-blur-md rounded-xl p-2 h-full">
                        <button
                          onClick={() => setIsAISidebarCollapsed(false)}
                          className="w-full flex flex-col items-center justify-center gap-2 py-4"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                          <span className="writing-mode-vertical text-sm font-medium text-gray-700"
                                style={{ writingMode: 'vertical-rl' }}>
                            AI Assistant
                          </span>
                        </button>
                        
                        {/* Compact AI Recommendations */}
                        <CompactAIRecommendations 
                          category={activeCategory || 'all'}
                          onExpand={() => setIsAISidebarCollapsed(false)}
                        />
                      </div>
                    ) : (
                      // Expanded Sidebar
                      <div className="space-y-4 overflow-y-auto">
                        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                            <button
                              onClick={() => setIsAISidebarCollapsed(true)}
                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                          
                          {/* Enhanced AI Recommendations with Gradients */}
                          <EnhancedAIRecommendations 
                            category={activeCategory || 'all'}
                            onRecommendationApply={(rec) => console.log('Applying recommendation:', rec)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Legacy View */
            selectedCategoryObject && (
              <motion.div
                key={selectedCategoryObject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <ActionWorkspace category={selectedCategoryObject} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
      
      {/* Bulk Action Bar */}
      {viewMode === 'enhanced' && isBulkMode && selectedActions.length > 0 && !isFocusMode && (
        <BulkActionBar
          selectedCount={selectedActions.length}
          onExecute={() => handleBulkAction('execute')}
          onSchedule={() => handleBulkAction('schedule')}
          onDuplicate={() => handleBulkAction('duplicate')}
          onReassign={() => handleBulkAction('reassign')}
          onDelete={() => handleBulkAction('delete')}
          onCancel={() => {
            setSelectedActions([]);
            setIsBulkMode(false);
          }}
        />
      )}

      {/* Modals */}
      <MagicPromptModal 
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onExecute={handleExecutePrompt}
      />
      <LoadingOverlay 
        isProcessing={isProcessing}
        onComplete={() => setIsProcessing(false)}
      />
    </div>
  );
}