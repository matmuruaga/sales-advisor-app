import {
  MessageSquare,
  Mail,
  Calendar,
  TrendingUp,
  FileText,
  Zap,
  Target,
  Users,
  Phone,
  Presentation,
  Sparkles,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface ActionPanelProps {
  participantId: string | null;
  meetingId: string | null;
  onStartSimulation: () => void;
}

type CategoryKey =
  | 'preparation'
  | 'follow_up'
  | 'analysis'
  | 'documents'
  | 'collaboration';

interface CategoryInfo {
  label: string;
  color: string;
}

interface Action {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: CategoryKey;
}

/* ---------- Available actions ---------- */
const actions: Action[] = [
  {
    id: 'simulate-demo',
    label: 'Simulate Demo',
    description: 'Generate a personalized demo presentation',
    icon: Presentation,
    color: 'from-blue-500',
    category: 'preparation',
  },
  {
    id: 'conversation-simulator',
    label: 'Simulate Conversation',
    description: 'Practice the meeting with AI assistant',
    icon: MessageSquare,
    color: 'from-green-500',
    category: 'preparation',
  },
  {
    id: 'email-sequence',
    label: 'Email Sequence',
    description: 'Generate automatic follow-up campaigns',
    icon: Mail,
    color: 'from-purple-500',
    category: 'follow_up',
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    description: 'Book the next appointment intelligently',
    icon: Calendar,
    color: 'from-orange-500',
    category: 'follow_up',
  },
  {
    id: 'kpi-analysis',
    label: 'KPI Analysis',
    description: 'Analyze metrics and success probabilities',
    icon: TrendingUp,
    color: 'from-red-500',
    category: 'analysis',
  },
  {
    id: 'generate-proposal',
    label: 'Generate Proposal',
    description: 'Create personalized business proposal',
    icon: FileText,
    color: 'from-teal-500',
    category: 'documents',
  },
  {
    id: 'objection-handling',
    label: 'Objection Handling',
    description: 'Prepare responses to common objections',
    icon: Target,
    color: 'from-pink-500',
    category: 'preparation',
  },
  {
    id: 'team-briefing',
    label: 'Team Briefing',
    description: 'Share insights with your team',
    icon: Users,
    color: 'from-indigo-500',
    category: 'collaboration',
  },
  {
    id: 'cold-call-script',
    label: 'Call Script',
    description: 'Generate personalized calling script',
    icon: Phone,
    color: 'from-yellow-500',
    category: 'preparation',
  },
  {
    id: 'competitive-analysis',
    label: 'Competitive Analysis',
    description: 'Analyze positioning vs. competitors',
    icon: Zap,
    color: 'from-gray-500',
    category: 'analysis',
  },
];

/* ---------- Category meta-data ---------- */
const categories: Record<CategoryKey, CategoryInfo> = {
  preparation: { label: 'Preparation', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300' },
  follow_up: { label: 'Follow-up', color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' },
  analysis: { label: 'Analysis', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300' },
  documents: { label: 'Documents', color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300' },
  collaboration: { label: 'Collaboration', color: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300' },
};

// Enhanced participant-to-contact mapping
const participantContactMapping: Record<string, string> = {
  'participant-1': '1', // Sarah Chen (Stripe)
  'participant-2': '2', // David Kim (Notion)
  'participant-3': '3', // Rachel Green (Shopify)
  'participant-4': '4', // Michael Thompson (Slack)
  'participant-5': '5', // Lisa Wang (Figma)
  'participant-6': '6', // James Wilson (Atlassian)
  'participant-7': '7', // Emily Davis (Airbnb)
  'participant-8': '8', // Alex Rodriguez (HubSpot),
};

// Helper function to get contact data
const getContactData = (participantId: string | null) => {
  if (!participantId) return null;
  const contactId = participantContactMapping[participantId];
  return mockContacts.find(c => c.id === contactId) || null;
};

export function ActionPanel({
  participantId,
  meetingId,
  onStartSimulation,
}: ActionPanelProps) {
  const contactData = getContactData(participantId);

  /* ---------- Enhanced Empty state ---------- */
  if (!participantId || !contactData) {
    return (
      <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <Zap className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Actions</h3>
          <p className="text-sm text-gray-600">Select a participant to view recommended actions</p>
        </div>
      </div>
    );
  }

  /* ---------- Action dispatcher ---------- */
  const handleAction = (actionId: string) => {
    if (actionId === 'conversation-simulator') {
      onStartSimulation(); // Trigger the simulator modal
    } else {
      console.log(`Executing action: ${actionId} for participant: ${participantId}`);
    }
  };

  // Generate personalized AI recommendation
  const getPersonalizedRecommendation = () => {
    const name = contactData.name.split(' ')[0];
    const role = contactData.role.toLowerCase();
    const company = contactData.company;
    const score = contactData.score;
    const status = contactData.status;
    
    if (status === 'hot' && score >= 80) {
      return `${name} (${role} at ${company}) shows high engagement (${score}/100). Recommended: Start with "Simulate Demo" to capitalize on momentum, then follow with "Generate Proposal" for immediate next steps.`;
    } else if (status === 'warm') {
      return `${name} needs nurturing. Their ${role} position suggests focusing on "Objection Handling" and "KPI Analysis" to build confidence before moving to demo phase.`;
    } else {
      return `${name} requires relationship building. Begin with "Team Briefing" to understand their context, then "Cold Call Script" for structured outreach.`;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-4">
      {/* Enhanced AI recommendation banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0"
      >
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 flex items-center">
                  AI Recommendation for {contactData.name}
                  <Star className="w-4 h-4 ml-2 text-yellow-300 fill-current" />
                </h4>
                <p className="text-sm text-purple-100 leading-relaxed">
                  {getPersonalizedRecommendation()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Actions grid */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const categoryInfo = categories[action.category];
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card
                  className="h-full bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 group-hover:bg-white/90"
                  onClick={() => handleAction(action.id)}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header with icon and category */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} to-${action.color.split('-')[1]}-600`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="outline" className={`text-xxs ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    
                    {/* Action indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Click to execute</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {/* Quick Actions Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-600" />
              Quick Actions for {contactData.name}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                onClick={() => handleAction('simulate-demo')}
              >
                <Presentation className="w-4 h-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-blue-700">Demo Now</div>
                  <div className="text-xs text-blue-600">Start simulation</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
                onClick={() => handleAction('conversation-simulator')}
              >
                <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-green-700">Practice</div>
                  <div className="text-xs text-green-600">Conversation sim</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}