// src/components/actions/ActiveActionsDashboard.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Target,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Filter,
  Search,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ActiveActionsDashboardProps {
  bulkMode: boolean;
  selectedActions: string[];
  onActionSelect: (actionId: string) => void;
}

interface ActiveAction {
  id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'pending' | 'scheduled' | 'waiting' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'call' | 'meeting' | 'email' | 'proposal' | 'follow-up' | 'simulation';
  assignee: string;
  contact?: string;
  company?: string;
  dueDate: string;
  progress: number;
  successProbability: number;
  estimatedTime: string;
  timeSpent?: string;
  createdAt: string;
  lastUpdate: string;
  tags: string[];
  aiInsights?: {
    nextBestAction: string;
    riskLevel: 'low' | 'medium' | 'high';
    optimizationTips: string[];
  };
}

// Mock active actions data
const mockActiveActions: ActiveAction[] = [
  {
    id: 'action-1',
    title: 'Demo with TechCorp CTO',
    description: 'Product demonstration focusing on AI capabilities and integration',
    status: 'scheduled',
    priority: 'high',
    type: 'meeting',
    assignee: 'You',
    contact: 'María González',
    company: 'TechCorp',
    dueDate: '2025-01-15T15:00:00',
    progress: 85,
    successProbability: 87,
    estimatedTime: '45 min',
    createdAt: '2025-01-12T10:00:00',
    lastUpdate: '2025-01-13T14:30:00',
    tags: ['demo', 'c-level', 'technical'],
    aiInsights: {
      nextBestAction: 'Send technical documentation 24h before meeting',
      riskLevel: 'low',
      optimizationTips: ['Mention recent AI industry trends', 'Prepare for technical objections']
    }
  },
  {
    id: 'action-2',
    title: 'Follow-up Call - InnovateAI',
    description: 'Urgent follow-up regarding $150K budget discussion',
    status: 'in-progress',
    priority: 'critical',
    type: 'call',
    assignee: 'You',
    contact: 'Carlos Ruiz',
    company: 'InnovateAI',
    dueDate: '2025-01-14T10:00:00',
    progress: 60,
    successProbability: 94,
    estimatedTime: '30 min',
    timeSpent: '15 min',
    createdAt: '2025-01-11T09:00:00',
    lastUpdate: '2025-01-13T16:45:00',
    tags: ['follow-up', 'budget', 'urgent'],
    aiInsights: {
      nextBestAction: 'Confirm implementation timeline preferences',
      riskLevel: 'low',
      optimizationTips: ['Reference previous conversation about team size', 'Discuss competitor comparisons']
    }
  },
  {
    id: 'action-3',
    title: 'Proposal Generation - DataSolutions',
    description: 'Custom proposal with pricing for 50-person team',
    status: 'pending',
    priority: 'medium',
    type: 'proposal',
    assignee: 'You',
    contact: 'Ana López',
    company: 'DataSolutions',
    dueDate: '2025-01-16T17:00:00',
    progress: 25,
    successProbability: 76,
    estimatedTime: '2 hours',
    createdAt: '2025-01-13T11:00:00',
    lastUpdate: '2025-01-13T11:00:00',
    tags: ['proposal', 'pricing', 'custom'],
    aiInsights: {
      nextBestAction: 'Research competitor pricing for similar team sizes',
      riskLevel: 'medium',
      optimizationTips: ['Include ROI calculator', 'Add implementation timeline']
    }
  },
  {
    id: 'action-4',
    title: 'Practice Session - Objection Handling',
    description: 'Simulation for handling pricing objections',
    status: 'waiting',
    priority: 'low',
    type: 'simulation',
    assignee: 'You',
    dueDate: '2025-01-17T09:00:00',
    progress: 0,
    successProbability: 85,
    estimatedTime: '40 min',
    createdAt: '2025-01-12T15:00:00',
    lastUpdate: '2025-01-12T15:00:00',
    tags: ['practice', 'objections', 'skills'],
    aiInsights: {
      nextBestAction: 'Schedule practice session before next pricing call',
      riskLevel: 'low',
      optimizationTips: ['Focus on value-based messaging', 'Practice competitor comparisons']
    }
  },
  {
    id: 'action-5',
    title: 'Team Briefing - GlobalTech Deal',
    description: 'Prepare internal team for enterprise presentation',
    status: 'completed',
    priority: 'medium',
    type: 'meeting',
    assignee: 'Sarah Johnson',
    company: 'GlobalTech',
    dueDate: '2025-01-13T14:00:00',
    progress: 100,
    successProbability: 92,
    estimatedTime: '30 min',
    timeSpent: '25 min',
    createdAt: '2025-01-10T08:00:00',
    lastUpdate: '2025-01-13T14:30:00',
    tags: ['briefing', 'enterprise', 'team']
  }
];

export function ActiveActionsDashboard({ bulkMode, selectedActions, onActionSelect }: ActiveActionsDashboardProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Filter and sort actions
  const filteredActions = mockActiveActions
    .filter(action => {
      if (statusFilter !== 'all' && action.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && action.priority !== priorityFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          action.title.toLowerCase().includes(term) ||
          action.description.toLowerCase().includes(term) ||
          action.contact?.toLowerCase().includes(term) ||
          action.company?.toLowerCase().includes(term) ||
          action.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'success':
          return b.successProbability - a.successProbability;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'waiting': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Clock;
      case 'meeting': return Calendar;
      case 'email': return Target;
      case 'proposal': return FileDocument;
      case 'follow-up': return TrendingUp;
      case 'simulation': return Play;
      default: return Target;
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffHours < 48) return 'Tomorrow';
    return date.toLocaleDateString();
  };

  const handleActionToggle = (actionId: string) => {
    setExpandedAction(expandedAction === actionId ? null : actionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Active Actions Dashboard</h3>
            <p className="text-sm text-gray-500">Track and manage your ongoing sales activities</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'In Progress', count: filteredActions.filter(a => a.status === 'in-progress').length, color: 'blue' },
            { label: 'Scheduled', count: filteredActions.filter(a => a.status === 'scheduled').length, color: 'purple' },
            { label: 'Critical', count: filteredActions.filter(a => a.priority === 'critical').length, color: 'red' },
            { label: 'Due Today', count: filteredActions.filter(a => formatDueDate(a.dueDate).includes('h')).length, color: 'orange' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="all">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="waiting">Waiting</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="progress">Progress</option>
            <option value="success">Success Rate</option>
          </select>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.map((action, index) => {
          const TypeIcon = getTypeIcon(action.type);
          const isExpanded = expandedAction === action.id;
          const isSelected = selectedActions.includes(action.id);
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-300 ${
                isSelected ? 'ring-purple-200 bg-purple-50/20' : 'hover:shadow-xl hover:ring-gray-200/50'
              }`}
            >
              {/* Main Action Row */}
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {/* Bulk Selection */}
                  {bulkMode && (
                    <button
                      onClick={() => onActionSelect(action.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isSelected ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* Type Icon */}
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TypeIcon className="h-5 w-5 text-gray-600" />
                  </div>

                  {/* Action Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {action.title}
                      </h4>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {action.description}
                    </p>
                    
                    {/* Contact/Company Info */}
                    {(action.contact || action.company) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {action.contact && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{action.contact}</span>
                          </div>
                        )}
                        {action.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>{action.company}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress and Metrics */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {action.successProbability}%
                      </div>
                      <div className="text-gray-500">Success</div>
                    </div>
                    
                    <div className="text-center min-w-[60px]">
                      <div className="font-semibold text-blue-600">
                        {formatDueDate(action.dueDate)}
                      </div>
                      <div className="text-gray-500">Due</div>
                    </div>
                    
                    <div className="text-center min-w-[80px]">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mb-1">
                        <div 
                          className="h-2 bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${action.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">{action.progress}%</div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleActionToggle(action.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      {/* AI Insights */}
                      {action.aiInsights && (
                        <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-purple-600" />
                            <h5 className="font-medium text-gray-900">AI Insights</h5>
                            <Badge 
                              variant="outline"
                              className={
                                action.aiInsights.riskLevel === 'low' ? 'border-green-200 text-green-700' :
                                action.aiInsights.riskLevel === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-red-200 text-red-700'
                              }
                            >
                              {action.aiInsights.riskLevel} risk
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-3">
                            <strong>Next best action:</strong> {action.aiInsights.nextBestAction}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {action.aiInsights.optimizationTips.map((tip, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tip}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Time Info</div>
                          <div>Estimated: {action.estimatedTime}</div>
                          {action.timeSpent && <div>Spent: {action.timeSpent}</div>}
                        </div>
                        
                        <div>
                          <div className="text-gray-500 mb-1">Created</div>
                          <div>{new Date(action.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            by {action.assignee}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-gray-500 mb-1">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {action.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        {action.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {action.status === 'in-progress' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredActions.length === 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg ring-1 ring-black/5">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active actions found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or create new actions to get started.
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for file document icon (since it's not in lucide-react)
const FileDocument = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);