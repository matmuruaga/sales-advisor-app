"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, type Contact } from '@/lib/supabase';
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
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contacts')
          .select(`
            *,
            company:companies(
              id,
              name,
              industry_id,
              employee_count:size_category,
              revenue_range,
              location:headquarters
            )
          `)
          .eq('id', contactId)
          .single();

        if (error) throw error;
        setContact(data);
      } catch (err) {
        console.error('Error fetching contact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();

    // Set up real-time subscription for this specific contact
    const subscription = supabase
      .channel(`contact_${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts',
          filter: `id=eq.${contactId}`
        },
        (payload) => {
          setContact(payload.new as Contact);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [contactId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl z-[60] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!contact) return null;

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
                    {getInitials(contact.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{contact.full_name}</h2>
                  <p className="text-purple-100">{contact.role_title || 'No role'}</p>
                  <p className="text-purple-200 text-sm">{contact.company?.name || 'No company'}</p>
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
                        {contact.ai_insights?.summary || 'No insights available'}
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
                        {contact.ai_insights?.bestApproach || 'Analyze more data for recommendations'}
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
                          {contact.ai_insights?.opportunities?.slice(0, 3).map((opp: string, i: number) => (
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
                          {contact.ai_insights?.riskFactors?.slice(0, 3).map((risk: string, i: number) => (
                            <li key={i} className="text-xs text-red-700 flex items-start">
                              <span className="mr-2 text-red-500">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Personality Insights */}
                  {contact.personality_insights && Object.keys(contact.personality_insights).length > 0 && (
                    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50 shadow-lg">
                      <CardHeader className="pb-3">
                        <h3 className="font-semibold text-indigo-900 flex items-center">
                          <User className="w-5 h-5 mr-2 text-indigo-500" />
                          Personality Profile
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {contact.personality_insights.communicationStyle && (
                            <div>
                              <span className="text-xs font-medium text-indigo-600">Communication Style</span>
                              <p className="text-indigo-800">{contact.personality_insights.communicationStyle}</p>
                            </div>
                          )}
                          {contact.personality_insights.decisionMaking && (
                            <div>
                              <span className="text-xs font-medium text-indigo-600">Decision Making</span>
                              <p className="text-indigo-800">{contact.personality_insights.decisionMaking}</p>
                            </div>
                          )}
                          {contact.personality_insights.motivations && contact.personality_insights.motivations.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-indigo-600">Key Motivations</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contact.personality_insights.motivations.slice(0, 3).map((motivation: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs px-2 py-0 bg-indigo-50 border-indigo-200 text-indigo-700">
                                    {motivation}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-0">
                  {/* Social Profiles */}
                  <Card className="bg-white/60 backdrop-blur-sm border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-gray-900">Social Profiles</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contact.social_profiles?.linkedin && (
                          <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
                            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                            LinkedIn
                          </Button>
                        )}
                        {contact.social_profiles?.twitter && (
                          <Button variant="outline" size="sm" className="bg-sky-50 border-sky-200 hover:bg-sky-100">
                            <Twitter className="w-4 h-4 mr-2 text-sky-600" />
                            Twitter
                          </Button>
                        )}
                        {contact.social_profiles?.instagram && (
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
                      {contact.recent_posts?.slice(0, 3).map((post: any) => (
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
                        {contact.professional_background?.experience?.previousRoles && 
                         contact.professional_background.experience.previousRoles.length > 0 ? (
                          contact.professional_background.experience.previousRoles.slice(0, 3).map((role: any, i: number) => (
                            <div key={i} className="border-l-2 border-purple-200 pl-3">
                              <h4 className="font-medium text-sm">{role.title || 'Unknown Position'}</h4>
                              <p className="text-xs text-gray-600">
                                {role.company || 'Unknown Company'} • {role.duration || 'Duration not specified'}
                              </p>
                              {role.achievements && role.achievements.length > 0 && (
                                <ul className="mt-1 space-y-0.5">
                                  {role.achievements.slice(0, 2).map((achievement: string, j: number) => (
                                    <li key={j} className="text-xs text-gray-500">• {achievement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No professional experience data available</p>
                            <p className="text-xs text-gray-400 mt-1">Complete their profile to see work history</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional Professional Info */}
                      {contact.professional_background?.experience?.yearsExperience && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-xs text-gray-600">Years of Experience</span>
                              <p className="font-medium text-gray-800">
                                {contact.professional_background.experience.yearsExperience} years
                              </p>
                            </div>
                            {contact.professional_background.experience.industries && (
                              <div>
                                <span className="text-xs text-gray-600">Industries</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {contact.professional_background.experience.industries.slice(0, 3).map((industry: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs px-2 py-0">
                                      {industry}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Buying Behavior */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold text-blue-900">Buying Behavior</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <span className="text-xs text-gray-600">Decision Timeline</span>
                          <p className="font-medium text-blue-800">
                            {contact.buying_behavior?.decisionTimeframe || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Authority</span>
                          <p className="font-medium text-blue-800">
                            {contact.buying_behavior?.budgetAuthority || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Buying Behavior Info */}
                      {contact.buying_behavior && Object.keys(contact.buying_behavior).length > 2 ? (
                        <div className="space-y-3">
                          {contact.buying_behavior.buyingStyle && (
                            <div>
                              <span className="text-xs text-gray-600">Buying Style</span>
                              <p className="font-medium text-blue-800">{contact.buying_behavior.buyingStyle}</p>
                            </div>
                          )}
                          
                          {contact.buying_behavior.painPoints && contact.buying_behavior.painPoints.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-600">Key Pain Points</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contact.buying_behavior.painPoints.slice(0, 3).map((pain: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs px-2 py-0 bg-red-50 border-red-200 text-red-700">
                                    {pain}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {contact.buying_behavior.decisionFactors && contact.buying_behavior.decisionFactors.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-600">Decision Factors</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contact.buying_behavior.decisionFactors.slice(0, 4).map((factor: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs px-2 py-0 bg-green-50 border-green-200 text-green-700">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {contact.buying_behavior.preferredCommunication && (
                            <div>
                              <span className="text-xs text-gray-600">Preferred Communication</span>
                              <p className="font-medium text-blue-800">{contact.buying_behavior.preferredCommunication}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Target className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Limited buying behavior data</p>
                          <p className="text-xs text-gray-400 mt-1">Gather more insights through interactions</p>
                        </div>
                      )}
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
                          <div className="text-2xl font-bold text-blue-600">{contact.engagement_metrics?.emailOpens || 0}</div>
                          <div className="text-xs text-blue-600/70">Email Opens</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">{contact.engagement_metrics?.linkClicks || 0}</div>
                          <div className="text-xs text-green-600/70">Link Clicks</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">{contact.engagement_metrics?.callsAnswered || 0}</div>
                          <div className="text-xs text-purple-600/70">Calls Answered</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-orange-600">{contact.engagement_metrics?.socialInteractions || 0}</div>
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