"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockContacts } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  X, Mail, Phone, MapPin, Building, Briefcase, Star, TrendingUp, 
  MessageSquare, User, Heart, Share2, Instagram, Linkedin, Twitter,
  AlertTriangle, Lightbulb, Target, ChevronRight, Eye, MousePointer,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContactDetailPanelProps {
  contactId: string;
  onClose: () => void;
}

export const ContactDetailPanel = ({ contactId, onClose }: ContactDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('insights');
  const contact = mockContacts.find(c => c.id === contactId);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!contact) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Overlay backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[59] pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Panel with glassmorphism */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl pointer-events-auto z-[60] border-l border-white/20"
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header with gradient */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10 p-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 ring-4 ring-white/30">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{contact.name}</h2>
                  <p className="text-purple-100">{contact.role}</p>
                  <p className="text-purple-200 text-sm">{contact.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {contact.status.toUpperCase()}
                    </Badge>
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-300 fill-current mr-1" />
                      {contact.score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-gray-100/50 backdrop-blur-sm">
                <TabsTrigger value="insights" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md">
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md">
                  Social
                </TabsTrigger>
                <TabsTrigger value="background" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md">
                  Background
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md">
                  Activity
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="insights" className="space-y-4 mt-0">
                  {/* AI Insights Card */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-purple-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        AI Summary
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-800 text-sm leading-relaxed">
                        {contact.aiInsights?.summary || 'No insights available'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Best Approach Card */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-green-500" />
                        Best Approach
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm">
                        {contact.aiInsights?.bestApproach || 'Analyze more data for recommendations'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Opportunities & Risks */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200/50">
                      <CardHeader className="pb-3">
                        <h4 className="font-medium text-green-900 text-sm flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2 text-green-600" />
                          Opportunities
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {contact.aiInsights?.opportunities?.slice(0, 3).map((opp, i) => (
                            <li key={i} className="text-xs text-green-700 flex items-start">
                              <span className="mr-2 text-green-500">•</span>
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200/50">
                      <CardHeader className="pb-3">
                        <h4 className="font-medium text-red-900 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                          Risk Factors
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {contact.aiInsights?.riskFactors?.slice(0, 3).map((risk, i) => (
                            <li key={i} className="text-xs text-red-700 flex items-start">
                              <span className="mr-2 text-red-500">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-0">
                  {/* Social Profiles */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900">Social Profiles</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contact.social?.linkedin && (
                          <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
                            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                            LinkedIn
                          </Button>
                        )}
                        {contact.social?.twitter && (
                          <Button variant="outline" size="sm" className="bg-sky-50 border-sky-200 hover:bg-sky-100">
                            <Twitter className="w-4 h-4 mr-2 text-sky-600" />
                            Twitter
                          </Button>
                        )}
                        {contact.social?.instagram && (
                          <Button variant="outline" size="sm" className="bg-pink-50 border-pink-200 hover:bg-pink-100">
                            <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                            Instagram
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Posts */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900">Recent Posts</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {contact.recentPosts?.slice(0, 3).map((post) => (
                        <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{post.date}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {post.engagement.likes}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {post.engagement.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="background" className="space-y-4 mt-0">
                  {/* Professional Background */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900">Professional Experience</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {contact.professionalBackground?.experience?.previousRoles?.slice(0, 3).map((role, i) => (
                          <div key={i} className="border-l-2 border-purple-200 pl-3">
                            <h4 className="font-medium text-sm">{role.title}</h4>
                            <p className="text-xs text-gray-600">{role.company} • {role.duration}</p>
                            {role.achievements && (
                              <ul className="mt-1 space-y-0.5">
                                {role.achievements.slice(0, 2).map((achievement, j) => (
                                  <li key={j} className="text-xs text-gray-500">• {achievement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Buying Behavior */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-blue-900">Buying Behavior</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-gray-600">Decision Timeline</span>
                          <p className="font-medium text-blue-800">{contact.buyingBehavior?.decisionTimeframe}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Authority</span>
                          <p className="font-medium text-blue-800">{contact.buyingBehavior?.budgetAuthority}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4 mt-0">
                  {/* Engagement Metrics */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                        Engagement Metrics
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">{contact.engagement?.emailOpens || 0}</div>
                          <div className="text-xs text-blue-600/70">Email Opens</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">{contact.engagement?.linkClicks || 0}</div>
                          <div className="text-xs text-green-600/70">Link Clicks</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">{contact.engagement?.callsAnswered || 0}</div>
                          <div className="text-xs text-purple-600/70">Calls Answered</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-orange-600">{contact.engagement?.socialInteractions || 0}</div>
                          <div className="text-xs text-orange-600/70">Social Interactions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-gray-700">{contact.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm flex gap-2">
            <Button variant="outline" className="flex-1" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Schedule Call
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="ml-2 text-purple-700">AI Coach</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};