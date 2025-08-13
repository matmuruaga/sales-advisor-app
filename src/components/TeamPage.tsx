"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, TrendingUp, Target, DollarSign, Clock, 
  MessageSquare, Calendar, ChevronUp, ChevronDown, Minus,
  Trophy, AlertTriangle, Star, Sparkles, TrendingDown, AlertCircle,
  LayoutGrid, Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockTeamMembers } from '@/data/mockTeamMembers';
import { TeamGraphView } from './team/TeamGraphView';

interface TeamPageProps {
  onMemberSelect: (memberId: string) => void;
}

export const TeamPage = ({ onMemberSelect }: TeamPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'graph'>('cards');

  // Calculate team aggregate metrics
  const teamMetrics = {
    averageQuota: mockTeamMembers.reduce((acc, m) => acc + m.performance.quotaAttainment, 0) / mockTeamMembers.length,
    totalPipeline: mockTeamMembers.reduce((acc, m) => acc + m.performance.pipelineValue, 0),
    averageWinRate: mockTeamMembers.reduce((acc, m) => acc + m.performance.winRate, 0) / mockTeamMembers.length,
    averageVelocity: mockTeamMembers.reduce((acc, m) => acc + m.performance.dealVelocity, 0) / mockTeamMembers.length,
    criticalCount: mockTeamMembers.filter(m => m.performance.status === 'needs-attention').length,
    coachingNeeded: mockTeamMembers.filter(m => m.coachingPriority === 'high').length,
  };

  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.territory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-gray-700 font-semibold';
      case 'good': return 'text-gray-700 font-medium';
      case 'needs-attention': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ChevronDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-amber-500 pl-3';
      case 'medium': return 'border-l-4 border-gray-300 pl-3';
      case 'low': return '';
      default: return '';
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
        <p className="text-sm text-gray-500">{mockTeamMembers.length} team members</p>
      </div>

      {/* Team Overview Metrics */}
      <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Team Quota</p>
                <p className="text-2xl font-bold text-gray-900">{teamMetrics.averageQuota.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">{teamMetrics.averageWinRate.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Trophy className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">${(teamMetrics.totalPipeline / 1000000).toFixed(2)}M</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Velocity</p>
                <p className="text-2xl font-bold text-gray-900">{teamMetrics.averageVelocity.toFixed(1)}d</p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${teamMetrics.criticalCount > 0 ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'} hover:shadow-md transition-shadow`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium ${teamMetrics.criticalCount > 0 ? 'text-amber-700' : 'text-gray-600'}`}>
                  At Risk
                </p>
                <p className={`text-2xl font-bold ${teamMetrics.criticalCount > 0 ? 'text-amber-900' : 'text-gray-900'}`}>
                  {teamMetrics.criticalCount}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${teamMetrics.criticalCount > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${teamMetrics.criticalCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Coaching</p>
                <p className="text-2xl font-bold text-gray-900">{teamMetrics.coachingNeeded}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search team members..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'graph' 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Graph
            </button>
          </div>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Team Members View */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredMembers.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 flex flex-col"
                onClick={() => onMemberSelect(member.id)}
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {/* Strategic Alert Indicator */}
                        {member.performance.quotaAttainment < 80 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.role}</p>
                        <p className="text-xs text-gray-400">{member.territory}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(member.performance.status)}`}>
                      {member.performance.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 flex flex-col flex-1">
                  {/* Strategic Performance Highlight */}
                  <div className="space-y-2 p-2 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium">Quota Attainment</span>
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-bold ${
                          member.performance.quotaAttainment >= 100 ? 'text-purple-700' : 
                          member.performance.quotaAttainment >= 80 ? 'text-indigo-700' : 
                          'text-amber-700'
                        }`}>{member.performance.quotaAttainment}%</span>
                        {getTrendIcon(member.performance.quotaTrend)}
                      </div>
                    </div>
                    <Progress 
                      value={member.performance.quotaAttainment} 
                      className={`h-2 ${member.performance.quotaAttainment < 80 ? '[&>div]:bg-amber-400' : member.performance.quotaAttainment >= 100 ? '[&>div]:bg-purple-400' : '[&>div]:bg-indigo-400'}`}
                    />
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Win Rate</span>
                        <span className={`text-xs font-bold ${
                          member.performance.winRate >= 60 ? 'text-green-600' : 'text-gray-700'
                        }`}>{member.performance.winRate}%</span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Velocity</span>
                        <span className={`text-xs font-bold ${
                          member.performance.dealVelocity <= 30 ? 'text-green-600' : 'text-gray-700'
                        }`}>{member.performance.dealVelocity}d</span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pipeline</span>
                        <span className="text-xs font-bold text-gray-700">${(member.performance.pipelineValue / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Calls</span>
                        <span className="text-xs font-bold text-gray-700">{member.performance.callsConnected}</span>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Insight or Coaching Priority */}
                  {(member.coachingPriority !== 'low' || member.performance.quotaAttainment >= 120 || 
                    (member.performance.quotaTrend === 'up' && member.performance.quotaAttainment >= 90)) && (
                    <div className="flex items-center">
                      {member.coachingPriority === 'high' ? (
                        <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg w-full bg-amber-50 border-l-4 border-amber-400">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">Needs Attention</span>
                        </div>
                      ) : member.performance.quotaAttainment >= 120 ? (
                        <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg w-full bg-purple-50 border border-purple-100">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">Top Performer</span>
                        </div>
                      ) : member.performance.quotaTrend === 'up' && member.performance.quotaAttainment >= 90 ? (
                        <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg w-full bg-green-50 border border-green-100">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Trending Up</span>
                        </div>
                      ) : member.coachingPriority === 'medium' ? (
                        <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg w-full bg-gray-50 border-l-4 border-gray-300">
                          <span className="text-xs text-gray-600">Coaching: </span>
                          <span className="text-xs font-semibold text-gray-700">Medium</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Spacer to push actions to bottom - but less aggressive */}
                  <div className="mt-auto" />
                  
                  {/* Quick Actions - More prominent */}
                  <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle message action
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle 1:1 scheduling
                      }}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      1:1
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TeamGraphView
                members={mockTeamMembers}
                onMemberSelect={onMemberSelect}
                searchTerm={searchTerm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};