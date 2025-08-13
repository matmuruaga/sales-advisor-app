// src/app/actions/page.tsx
"use client";

import { useState } from 'react';
import { ActionDock } from '@/components/actions/ActionDock';
import { actionCategories } from '@/data/actionCategories';
import { AnimatePresence, motion } from 'framer-motion';
import { SmartActionComposer } from '@/components/actions/SmartActionComposer';
import { ActionTemplatesGallery } from '@/components/actions/ActionTemplatesGallery';
import { ActiveActionsDashboard } from '@/components/actions/ActiveActionsDashboard';
import { SuccessMetricsPanel } from '@/components/actions/SuccessMetricsPanel';
import { AIRecommendationCards } from '@/components/actions/AIRecommendationCards';
import { CompactAIRecommendations } from '@/components/actions/CompactAIRecommendations';
import { FloatingActionMenu } from '@/components/actions/FloatingActionMenu';
import { BulkActionBar } from '@/components/actions/BulkActionBar';
import { 
  Sparkles, 
  Target, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  BarChart3,
  Brain,
  Plus,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function ActionsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'compose' | 'templates' | 'active' | 'metrics'>('compose');
  const [bulkMode, setBulkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showSecondaryFeatures, setShowSecondaryFeatures] = useState(false);

  const handleBulkActionToggle = (actionId: string) => {
    setSelectedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      setSidebarCollapsed(true);
      setShowSecondaryFeatures(false);
    } else {
      setSidebarCollapsed(false);
    }
  };

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'schedule':
        setViewMode('templates');
        setShowSecondaryFeatures(true);
        break;
      case 'call':
        setViewMode('active');
        setShowSecondaryFeatures(true);
        break;
      case 'proposal':
        setViewMode('templates');
        setShowSecondaryFeatures(true);
        break;
      case 'brief':
        setViewMode('templates');
        setShowSecondaryFeatures(true);
        break;
      case 'analytics':
        setViewMode('metrics');
        setShowSecondaryFeatures(true);
        break;
      default:
        console.log('Action:', action);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className={`mx-auto transition-all duration-300 ${focusMode ? 'max-w-4xl' : 'max-w-7xl'} px-4 md:px-6 lg:px-8 py-6 space-y-6`}>
        
        {/* Streamlined Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Action Intelligence Hub
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create AI-powered sales actions with smart assistance
            </p>
          </div>
          
          {/* Simplified Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Stats - Condensed */}
            <div className={`hidden md:flex items-center gap-3 text-sm transition-all duration-300 ${focusMode ? 'opacity-50 scale-95' : ''}`}>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>12 done</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="h-4 w-4" />
                <span>3.2h saved</span>
              </div>
            </div>

            {/* Focus Mode Toggle */}
            <button
              onClick={toggleFocusMode}
              className={`p-2 rounded-full transition-all ${
                focusMode
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              } backdrop-blur-sm border border-gray-200/50`}
              title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              {focusMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progressive Action Categories */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ActionDock
                categories={actionCategories}
                activeCategory={activeCategory}
                onCategorySelect={setActiveCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Layout */}
        <div className={`grid transition-all duration-300 ${
          focusMode 
            ? 'grid-cols-1' 
            : sidebarCollapsed 
              ? 'grid-cols-1 lg:grid-cols-4' 
              : 'grid-cols-1 lg:grid-cols-3'
        } gap-6`}>
          
          {/* Primary Action Area */}
          <div className={`${focusMode ? 'col-span-1' : sidebarCollapsed ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            
            {/* Main Action Composer */}
            <motion.div
              layout
              transition={{ duration: 0.3 }}
            >
              <SmartActionComposer 
                activeCategory={activeCategory}
                bulkMode={bulkMode}
                onActionSelect={handleBulkActionToggle}
              />
            </motion.div>

            {/* Secondary Features - Progressive Disclosure */}
            <AnimatePresence>
              {!focusMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Expandable Secondary Tools */}
                  <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 ring-1 ring-black/5">
                    <button
                      onClick={() => setShowSecondaryFeatures(!showSecondaryFeatures)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Advanced Tools</span>
                        <span className="text-xs text-gray-500">Templates • Analytics • Bulk Actions</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${showSecondaryFeatures ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showSecondaryFeatures && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-200/50"
                        >
                          {/* Compact Tool Selector */}
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            <button
                              onClick={() => setViewMode('templates')}
                              className={`p-3 rounded-xl text-center transition-all ${
                                viewMode === 'templates'
                                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Target className="h-4 w-4 mx-auto mb-1" />
                              <span className="text-xs font-medium">Templates</span>
                            </button>
                            <button
                              onClick={() => setViewMode('active')}
                              className={`p-3 rounded-xl text-center transition-all ${
                                viewMode === 'active'
                                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Zap className="h-4 w-4 mx-auto mb-1" />
                              <span className="text-xs font-medium">Active</span>
                            </button>
                            <button
                              onClick={() => setViewMode('metrics')}
                              className={`p-3 rounded-xl text-center transition-all ${
                                viewMode === 'metrics'
                                  ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <BarChart3 className="h-4 w-4 mx-auto mb-1" />
                              <span className="text-xs font-medium">Metrics</span>
                            </button>
                            <button
                              onClick={() => setBulkMode(!bulkMode)}
                              className={`p-3 rounded-xl text-center transition-all ${
                                bulkMode
                                  ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Plus className="h-4 w-4 mx-auto mb-1" />
                              <span className="text-xs font-medium">Bulk</span>
                            </button>
                          </div>

                          {/* Secondary Content */}
                          <AnimatePresence mode="wait">
                            {viewMode === 'templates' && (
                              <motion.div
                                key="templates"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ActionTemplatesGallery 
                                  activeCategory={activeCategory}
                                  bulkMode={bulkMode}
                                  onActionSelect={handleBulkActionToggle}
                                />
                              </motion.div>
                            )}
                            
                            {viewMode === 'active' && (
                              <motion.div
                                key="active"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ActiveActionsDashboard 
                                  bulkMode={bulkMode}
                                  selectedActions={selectedActions}
                                  onActionSelect={handleBulkActionToggle}
                                />
                              </motion.div>
                            )}
                            
                            {viewMode === 'metrics' && (
                              <motion.div
                                key="metrics"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SuccessMetricsPanel />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bulk Action Bar */}
            <AnimatePresence>
              {bulkMode && selectedActions.length > 0 && (
                <BulkActionBar
                  selectedCount={selectedActions.length}
                  onClear={() => setSelectedActions([])}
                  onExecute={() => console.log('Execute bulk actions:', selectedActions)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Smart AI Sidebar */}
          <AnimatePresence>
            {!focusMode && (
              <motion.div
                layout
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className={`${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-1'} relative`}
              >
                {/* Sidebar Toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="absolute top-4 -left-3 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm hover:bg-white transition-colors"
                >
                  {sidebarCollapsed ? (
                    <ChevronLeft className="h-3 w-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-600" />
                  )}
                </button>

                <AnimatePresence mode="wait">
                  {!sidebarCollapsed ? (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AIRecommendationCards activeCategory={activeCategory} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collapsed"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CompactAIRecommendations activeCategory={activeCategory} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Action Menu - Available in focus mode */}
        <FloatingActionMenu 
          onActionSelect={handleFloatingAction}
          isVisible={focusMode}
        />
      </div>
    </div>
  );
}