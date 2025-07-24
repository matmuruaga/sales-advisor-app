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
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

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
    description: 'Generate a personalized demo',
    icon: Presentation,
    color: 'bg-blue-500',
    category: 'preparation',
  },
  {
    id: 'conversation-simulator',
    label: 'Simulate Conversation',
    description: 'Practice the meeting with AI',
    icon: MessageSquare,
    color: 'bg-green-500',
    category: 'preparation',
  },
  {
    id: 'email-sequence',
    label: 'Email Sequence',
    description: 'Generate automatic follow-up',
    icon: Mail,
    color: 'bg-purple-500',
    category: 'follow_up',
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    description: 'Book the next appointment',
    icon: Calendar,
    color: 'bg-orange-500',
    category: 'follow_up',
  },
  {
    id: 'kpi-analysis',
    label: 'KPI Analysis',
    description: 'Metrics and probabilities',
    icon: TrendingUp,
    color: 'bg-red-500',
    category: 'analysis',
  },
  {
    id: 'generate-proposal',
    label: 'Generate Proposal',
    description: 'Personalized proposal',
    icon: FileText,
    color: 'bg-teal-500',
    category: 'documents',
  },
  {
    id: 'objection-handling',
    label: 'Objection Handling',
    description: 'Prepare responses',
    icon: Target,
    color: 'bg-pink-500',
    category: 'preparation',
  },
  {
    id: 'team-briefing',
    label: 'Team Briefing',
    description: 'Share insights',
    icon: Users,
    color: 'bg-indigo-500',
    category: 'collaboration',
  },
  {
    id: 'cold-call-script',
    label: 'Call Script',
    description: 'Personalized script',
    icon: Phone,
    color: 'bg-yellow-500',
    category: 'preparation',
  },
  {
    id: 'competitive-analysis',
    label: 'Competitive Analysis',
    description: 'Positioning vs. competitors',
    icon: Zap,
    color: 'bg-gray-500',
    category: 'analysis',
  },
];

/* ---------- Category meta-data ---------- */
const categories: Record<CategoryKey, CategoryInfo> = {
  preparation: { label: 'Preparation', color: 'bg-blue-100 text-blue-700' },
  follow_up: { label: 'Follow-up', color: 'bg-green-100 text-green-700' },
  analysis: { label: 'Analysis', color: 'bg-purple-100 text-purple-700' },
  documents: { label: 'Documents', color: 'bg-orange-100 text-orange-700' },
  collaboration: { label: 'Collaboration', color: 'bg-pink-100 text-pink-700' },
};

export function ActionPanel({
  participantId,
  meetingId,
  onStartSimulation,
}: ActionPanelProps) {
  /* ---------- Empty state ---------- */
  if (!participantId) {
    return (
      <div className="text-center py-8 text-gray-500 h-full flex flex-col items-center justify-center">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Select a participant to view actions</p>
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

  return (
    <div className="h-full flex flex-col">
      {/* --- AI recommendation banner --- */}
      <div className="pt-4 flex-shrink-0">
        <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm text-purple-800">AI Recommendation</h4>
          </div>
          <p className="text-xxs text-purple-700 mb-2 break-words">
            Based on María’s technical profile and her skepticism toward complexity,
            it’s recommended to prepare an **“Objection Handling”** focused on TCO
            and ease of implementation, followed by **“Simulate Demo”** to keep the
            flow straightforward and ROI-centric.
          </p>
        </Card>
      </div>

      {/* --- Actions grid --- */}
      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer aspect-square flex flex-col justify-center items-center text-center"
                onClick={() => handleAction(action.id)}
              >
                <div className={`mb-3 p-3 rounded-full ${action.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                  {action.label}
                </h4>
                <p className="text-xxs text-gray-500">{action.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
