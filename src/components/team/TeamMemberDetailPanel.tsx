"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockTeamMembers } from '@/data/mockTeamMembers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  X, TrendingUp, TrendingDown, Minus, Target, Trophy, Clock,
  Phone, Mail, MessageSquare, Calendar, DollarSign, Activity,
  Star, AlertTriangle, Lightbulb, CheckCircle, XCircle,
  ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';

interface TeamMemberDetailPanelProps {
  memberId: string;
  onClose: () => void;
}

export const TeamMemberDetailPanel = ({ memberId, onClose }: TeamMemberDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('performance');
  const member = mockTeamMembers.find(m => m.id === memberId);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'good': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'needs-attention': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-amber-700 font-semibold';
      case 'medium': return 'text-gray-600 font-medium';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 z-[59] pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl pointer-events-auto z-[60]"
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white">
            <h2 className="text-lg font-semibold">Team Member Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Member Info Section */}
            <div className="p-4 border-b">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-semibold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.territory}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={getStatusColor(member.performance.status)}>
                      {member.performance.status}
                    </Badge>
                    {member.coachingPriority !== 'low' && (
                      <Badge variant="outline" className={`text-xs ${member.coachingPriority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {member.coachingPriority} priority
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Quota</p>
                        <p className="text-lg font-bold">{member.performance.quotaAttainment}%</p>
                      </div>
                      {getTrendIcon(member.performance.quotaTrend)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Win Rate</p>
                        <p className="text-lg font-bold">{member.performance.winRate}%</p>
                      </div>
                      <Trophy className="w-4 h-4 text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-4 py-3 space-y-2 border-b">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
              <TabsList className="grid w-full grid-cols-3 px-4">
                <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
                <TabsTrigger value="coaching" className="text-xs">Coaching</TabsTrigger>
                <TabsTrigger value="insights" className="text-xs">AI Insights</TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="performance" className="px-4 pb-4 mt-4">
                  {/* Performance Metrics */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Current Quarter Performance</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Quota Attainment</span>
                            <span className="font-semibold">{member.performance.quotaAttainment}%</span>
                          </div>
                          <Progress 
                            value={member.performance.quotaAttainment} 
                            className={`h-2 ${member.performance.quotaAttainment < 80 ? '[&>div]:bg-amber-400' : member.performance.quotaAttainment >= 100 ? '[&>div]:bg-purple-400' : '[&>div]:bg-indigo-400'}`}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Win Rate</span>
                              <span className="font-medium">{member.performance.winRate}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Deal Velocity</span>
                              <span className="font-medium">{member.performance.dealVelocity} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Pipeline Value</span>
                              <span className="font-medium">${(member.performance.pipelineValue / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Activities</span>
                              <span className="font-medium">{member.performance.activitiesCompleted}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Calls Connected</span>
                              <span className="font-medium">{member.performance.callsConnected}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Meetings Booked</span>
                              <span className="font-medium">{member.performance.meetingsBooked}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Trends */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Activity Trends</h4>
                      <div className="space-y-2">
                        {member.activityTrends.map((activity, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                            <span className="text-sm text-gray-600">{activity.type}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{activity.value}</span>
                              {getTrendIcon(activity.trend)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Achievements */}
                    {member.recentAchievements && member.recentAchievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Recent Achievements</h4>
                        <div className="space-y-2">
                          {member.recentAchievements.map((achievement, i) => (
                            <div key={i} className="flex items-center space-x-2 p-2 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
                              <Star className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-700">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="coaching" className="px-4 pb-4 mt-4">
                  {/* Coaching Information */}
                  <div className="space-y-4">
                    {/* Coaching Priority */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Coaching Priority</h4>
                      <div className={`p-3 rounded-lg border ${
                        member.coachingPriority === 'high' ? 'border-l-4 border-amber-500 bg-amber-50/50' :
                        member.coachingPriority === 'medium' ? 'border-l-4 border-gray-300 bg-gray-50' :
                        'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {member.coachingPriority.charAt(0).toUpperCase() + member.coachingPriority.slice(1)} Priority
                          </span>
                          <span className={getPriorityBadgeColor(member.coachingPriority)}>
                            {member.coachingPriority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Strengths</h4>
                      <div className="space-y-2">
                        {member.coachingInfo.strengths.map((strength, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-sm text-gray-700">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Areas for Improvement</h4>
                      <div className="space-y-2">
                        {member.coachingInfo.improvements.map((improvement, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <span className="text-sm text-gray-700">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Last Coaching Session */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Last Coaching Session</h4>
                      <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <CardContent className="p-3">
                          <p className="text-sm text-gray-600 mb-1">{member.coachingInfo.lastSession}</p>
                          <p className="text-xs text-gray-500">Next session scheduled in 3 days</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Recommended Actions</h4>
                      <div className="space-y-2">
                        {member.coachingInfo.recommendedActions.map((action, i) => (
                          <div key={i} className="flex items-start space-x-2 p-2 bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-100">
                            <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5" />
                            <span className="text-sm text-gray-700">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="px-4 pb-4 mt-4">
                  {/* AI Insights */}
                  <div className="space-y-4">
                    {/* AI Summary */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                        <span className="text-purple-700">AI Performance Analysis</span>
                      </h4>
                      <Card className="bg-purple-50/50 border-purple-200">
                        <CardContent className="p-3">
                          <p className="text-sm text-gray-700">
                            {member.aiInsights.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Predicted Outcomes */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Predicted Outcomes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Q4 Quota Achievement</span>
                          <span className="text-sm font-medium">{member.aiInsights.predictedQuota}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Pipeline Conversion</span>
                          <span className="text-sm font-medium">{member.aiInsights.pipelineConversion}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Risk Factors</h4>
                      <div className="space-y-2">
                        {member.aiInsights.riskFactors.map((risk, i) => (
                          <div key={i} className="flex items-start space-x-2 p-2 bg-amber-50 rounded-lg">
                            <XCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Opportunities</h4>
                      <div className="space-y-2">
                        {member.aiInsights.opportunities.map((opportunity, i) => (
                          <div key={i} className="flex items-start space-x-2 p-2 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-sm text-gray-700">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Focus */}
                    <Card className="bg-purple-50/30 border-purple-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 text-purple-700">Recommended Focus</h4>
                        <p className="text-sm text-gray-700">
                          {member.aiInsights.recommendedFocus}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Actions - Fixed */}
          <div className="flex-shrink-0 p-4 border-t flex gap-2 bg-white">
            <Button variant="outline" className="flex-1" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule 1:1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="ml-2 text-purple-700">Coach</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};