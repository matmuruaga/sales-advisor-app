import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  MessageSquare,
  FileText,
  Globe,
  Linkedin,
  Twitter,
  Sparkles,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Target,
  Lightbulb,
  AlertTriangle,
  User,
  Building,
  Star,
  Phone,
  Mail,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

/* ───────────────────────── TYPES ───────────────────────── */
interface AIInsightsProps {
  participantId: string | null;
}

type InsightSectionKey =
  | 'background'
  | 'companyInfo'
  | 'sentiment'
  | 'communicationStyle';

/* ───────────────────────── ENHANCED DATA MAPPING ───────────────────────── */
// Enhanced participant-to-contact mapping
const participantContactMapping: Record<string, string> = {
  'participant-1': '1', // Sarah Chen (Stripe)
  'participant-2': '2', // David Kim (Notion)
  'participant-3': '3', // Rachel Green (Shopify)
  'participant-4': '4', // Michael Thompson (Slack)
  'participant-5': '5', // Lisa Wang (Figma)
  'participant-6': '6', // James Wilson (Atlassian)
  'participant-7': '7', // Emily Davis (Airbnb)
  'participant-8': '8', // Alex Rodriguez (HubSpot)
};

// Helper function to get contact data
const getContactData = (participantId: string | null) => {
  if (!participantId) return null;
  const contactId = participantContactMapping[participantId];
  return mockContacts.find(c => c.id === contactId) || null;
};

/* ───────────────────────── COMPONENT ───────────────────────── */
export function AIInsights({ participantId }: AIInsightsProps) {
  /* --- state --- */
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<InsightSectionKey>('background');
  const [isDeepResearch, setIsDeepResearch] = useState(false);

  /* --- refs --- */
  const textScrollRef = useRef<HTMLDivElement>(null);

  /* --- derived data --- */
  const contactData = getContactData(participantId);

  /* --- reset view when participant changes --- */
  useEffect(() => {
    setIsDeepResearch(false);
    setCurrentSection('background');
  }, [participantId]);

  /* --- fetch section text (simulated) --- */
  useEffect(() => {
    if (!contactData || isDeepResearch) return;

    let content = '';
    switch (currentSection) {
      case 'background':
        content = `${contactData.professionalBackground?.experience?.totalYears || 0}+ years of experience in ${contactData.industry}. ${contactData.aiInsights?.summary || 'Analyzing profile...'}`;
        break;
      case 'companyInfo':
        content = `${contactData.company} - ${contactData.revenue} revenue, ${contactData.employees} employees. Industry: ${contactData.industry}. Current status: ${contactData.status.toUpperCase()}.`;
        break;
      case 'sentiment':
        content = `Overall sentiment: ${contactData.sentiment?.overall || 'neutral'}. Recent trend: ${contactData.sentiment?.recentTrend || 'stable'}. Confidence: ${contactData.sentiment?.confidence || 75}%`;
        break;
      case 'communicationStyle':
        content = `Communication style: ${contactData.personalityInsights?.communicationStyle || 'professional'}. Decision making: ${contactData.personalityInsights?.decisionMaking || 'analytical'}. Preferred approach: ${contactData.aiInsights?.bestApproach || 'data-driven presentations'}.`;
        break;
    }
    setDisplayText(content);
    setIsLoading(false);
  }, [contactData, currentSection, isDeepResearch]);

  /* --- autoscroll description --- */
  useEffect(() => {
    if (!isLoading && textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
    }
  }, [displayText, isLoading]);

  /* --- tabs config --- */
  const sections: { key: InsightSectionKey; label: string; icon: any }[] = [
    { key: 'background', label: 'Background', icon: FileText },
    { key: 'companyInfo', label: 'Company', icon: Globe },
    { key: 'sentiment', label: 'Sentiment', icon: MessageSquare },
    { key: 'communicationStyle', label: 'Communication', icon: MessageSquare },
  ];

  /* ───────────────────────── RENDER EARLY (no participant) ───────────────────────── */
  if (!contactData) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-gray-500 p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <Brain className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Insights</h3>
          <p className="text-sm text-gray-600">Select a participant to view detailed AI analysis</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  /* ───────────────────────── ENHANCED VIEWS ───────────────────────── */
  const SummaryView = () => (
    <div className="flex flex-col p-4 pb-8">
      {/* Enhanced header with glassmorphism */}
      <div className="flex-shrink-0">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-white/30">
                  <AvatarFallback className="bg-white/20 text-white font-bold">
                    {getInitials(contactData.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{contactData.name}</h3>
                  <p className="text-purple-100 text-sm">{contactData.role}</p>
                  <p className="text-purple-200 text-xs">{contactData.company}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 text-yellow-300 fill-current mr-1" />
                  <span className="font-bold">{contactData.score}</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {contactData.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with scroll */}
      <div className="space-y-4 mt-4">
        {/* Deal probability card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Deal Probability
              </h4>
              <span className="text-2xl font-bold text-purple-600">{contactData.probability}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={contactData.probability} className="w-full h-3 mb-2" />
            <p className="text-xs text-gray-600">Pipeline value: {contactData.value}</p>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
          <CardHeader className="pb-3">
            <h4 className="font-semibold text-purple-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              AI Summary
            </h4>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800 leading-relaxed">
              {contactData.aiInsights?.summary || 'Analyzing participant profile...'}
            </p>
          </CardContent>
        </Card>

        {/* Enhanced tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-4">
            <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as InsightSectionKey)}>
              <TabsList className="grid grid-cols-4 bg-gray-100/50 backdrop-blur-sm mb-4">
                {sections.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger 
                    key={key}
                    value={key} 
                    className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Content display */}
              <div className="min-h-[120px] bg-gray-50/50 rounded-lg p-4 border">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {displayText}
                  </p>
                </motion.div>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Insights & Opportunities */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50 border-green-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <h4 className="font-semibold text-green-900 text-sm flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-green-600" />
                Opportunities
              </h4>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {contactData.aiInsights?.opportunities?.slice(0, 3).map((opp, i) => (
                  <li key={i} className="text-xs text-green-700 flex items-start">
                    <span className="mr-2 text-green-500">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <h4 className="font-semibold text-red-900 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                Risk Factors
              </h4>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {contactData.aiInsights?.riskFactors?.slice(0, 3).map((risk, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-start">
                    <span className="mr-2 text-red-500">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              Engagement Metrics
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{contactData.engagement?.emailOpens || 0}</div>
                <div className="text-xs text-blue-600/70">Email Opens</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">{contactData.engagement?.callsAnswered || 0}</div>
                <div className="text-xs text-green-600/70">Calls Answered</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{contactData.engagement?.socialInteractions || 0}</div>
                <div className="text-xs text-purple-600/70">Social Interactions</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-600">{contactData.engagement?.linkClicks || 0}</div>
                <div className="text-xs text-orange-600/70">Link Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <h4 className="font-semibold text-gray-900">Contact Information</h4>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              <a href={`mailto:${contactData.email}`} className="text-blue-600 hover:underline">
                {contactData.email}
              </a>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              <a href={`tel:${contactData.phone}`} className="text-blue-600 hover:underline">
                {contactData.phone}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{contactData.location}</span>
              <div className="flex space-x-2">
                {contactData.social?.linkedin && (
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {contactData.social?.twitter && (
                  <Button variant="outline" size="sm" className="bg-sky-50 border-sky-200 hover:bg-sky-100">
                    <Twitter className="w-4 h-4 text-sky-600" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deep Research CTA */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Deep Research Available</h4>
                <p className="text-sm text-purple-100">Get advanced insights and social intelligence</p>
              </div>
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={() => setIsDeepResearch(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DeepResearchView = () => (
    <div className="flex flex-col p-4">
      {/* Back button */}
      <div className="flex-shrink-0 mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90"
          onClick={() => setIsDeepResearch(false)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-white/30">
                <AvatarFallback className="bg-white/20 text-white font-bold">
                  {getInitials(contactData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">Deep Research</h3>
                <p className="text-purple-100">{contactData.name} • {contactData.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <h4 className="font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
              Recent Social Activity
            </h4>
          </CardHeader>
          <CardContent className="space-y-3">
            {contactData.recentPosts?.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{post.date}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                      {post.engagement.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {post.engagement.comments}
                    </span>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 italic">No recent social activity available</p>
            )}
          </CardContent>
        </Card>

        {/* Professional Background */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <h4 className="font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-500" />
              Professional Background
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Experience</h5>
                <p className="text-sm text-gray-600">
                  {contactData.professionalBackground?.experience?.totalYears || 'Unknown'} years total experience
                </p>
                <div className="mt-2 space-y-2">
                  {contactData.professionalBackground?.experience?.previousRoles?.slice(0, 2).map((role, i) => (
                    <div key={i} className="border-l-2 border-purple-200 pl-3">
                      <h6 className="font-medium text-sm">{role.title}</h6>
                      <p className="text-xs text-gray-600">{role.company} • {role.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buying Behavior */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
          <CardHeader>
            <h4 className="font-semibold text-blue-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Buying Behavior Analysis
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-600">Decision Timeline</span>
                <p className="font-medium text-blue-800">{contactData.buyingBehavior?.decisionTimeframe || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Authority Level</span>
                <p className="font-medium text-blue-800">{contactData.buyingBehavior?.budgetAuthority || 'Unknown'}</p>
              </div>
            </div>
            {contactData.buyingBehavior?.painPoints && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">Key Pain Points</h5>
                <ul className="space-y-1">
                  {contactData.buyingBehavior.painPoints.slice(0, 3).map((pain, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  /* ───────────────────────── MAIN RENDER ───────────────────────── */
  return (
    <div className="flex flex-col">
      <AnimatePresence mode="wait">
        {!isDeepResearch ? (
          <motion.div 
            key="summary" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <SummaryView />
          </motion.div>
        ) : (
          <motion.div
            key="deep"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <DeepResearchView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}