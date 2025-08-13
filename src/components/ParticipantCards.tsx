import { Building, MapPin, Star, Users, Sparkles, TrendingUp, Phone, Mail, Linkedin, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';
import { mockContacts, type EnhancedContact } from '@/data/mockContacts';

// Enhanced participant mapping to real contact data
type ParticipantId = string;
type MeetingId = string;

interface MappedParticipant {
  id: string;
  contactData: EnhancedContact;
  meetingRole: 'primary' | 'secondary' | 'observer';
  engagement: 'high' | 'medium' | 'low';
  priority: 'hot' | 'warm' | 'cold';
}

interface ParticipantCardsProps {
  meetingId: string | null;
  selectedParticipant: string | null;
  onParticipantSelect: (participantId: string) => void;
}

interface ParticipantCardProps {
  participant: MappedParticipant;
  isSelected: boolean;
  onClick: () => void;
}

// Enhanced participant mapping using real contact data
const participantContactMapping: Record<string, string> = {
  'participant-1': '1', // María González -> Sarah Chen (Stripe)
  'participant-2': '2', // Carlos Ruiz -> David Kim (Notion)
  'participant-3': '3', // Ana López -> Rachel Green (Shopify)
  'participant-4': '4', // David Martín -> Michael Thompson (Slack)
  'participant-5': '5', // Laura Jiménez -> Lisa Wang (Figma)
  'participant-6': '6', // Roberto Sánchez -> James Wilson (Atlassian)
  'participant-7': '7', // Elena Pérez -> Emily Davis (Airbnb)
  'participant-8': '8', // Miguel Torres -> Alex Rodriguez (HubSpot)
};

const participantRoles: Record<string, {
  meetingRole: 'primary' | 'secondary' | 'observer';
  engagement: 'high' | 'medium' | 'low';
  priority: 'hot' | 'warm' | 'cold';
}> = {
  'participant-1': { meetingRole: 'primary', engagement: 'high', priority: 'hot' },
  'participant-2': { meetingRole: 'secondary', engagement: 'medium', priority: 'warm' },
  'participant-3': { meetingRole: 'primary', engagement: 'high', priority: 'hot' },
  'participant-4': { meetingRole: 'secondary', engagement: 'high', priority: 'warm' },
  'participant-5': { meetingRole: 'observer', engagement: 'medium', priority: 'warm' },
  'participant-6': { meetingRole: 'primary', engagement: 'high', priority: 'hot' },
  'participant-7': { meetingRole: 'primary', engagement: 'high', priority: 'hot' },
  'participant-8': { meetingRole: 'secondary', engagement: 'medium', priority: 'warm' },
};

const meetingParticipants: Record<string, string[]> = {
  'meeting-1': ['participant-1', 'participant-2'],
  'meeting-2': ['participant-3'],
  'meeting-3': ['participant-4', 'participant-5', 'participant-6'],
  'meeting-4': ['participant-7', 'participant-8'],
  'meeting-5': ['participant-4', 'participant-5'],
  'meeting-6': ['participant-7', 'participant-8'],
  'meeting-7': ['participant-1', 'participant-2'],
  'meeting-8': ['participant-3'],
  'meeting-9': ['participant-4', 'participant-5'],
  'meeting-10': ['participant-6', 'participant-7', 'participant-8'],
  'meeting-11': ['participant-1']
};

const roleColors = {
  'primary': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200',
  'secondary': 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200',
  'observer': 'bg-gray-50 text-gray-600 border-gray-200'
};

const engagementColors = {
  'high': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
  'medium': 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200',
  'low': 'bg-gray-50 text-gray-600 border-gray-200'
};

const priorityColors = {
  'hot': 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200',
  'warm': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200',
  'cold': 'bg-gradient-to-r from-blue-50 to-slate-50 text-blue-600 border-blue-200'
};

// Enhanced ParticipantCard component with glassmorphism
const ParticipantCard = ({ participant, isSelected, onClick }: ParticipantCardProps) => {
  const { contactData, meetingRole, engagement, priority } = participant;
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        rounded-xl transition-all duration-300 cursor-pointer
        ${isSelected 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/20' 
          : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      <div className={`rounded-xl p-4 h-full ${
        isSelected 
          ? 'bg-white/95 backdrop-blur-sm' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        {/* Header with avatar and basic info */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-white/50">
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold">
                {getInitials(contactData.name)}
              </AvatarFallback>
            </Avatar>
            {meetingRole === 'primary' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{contactData.name}</h4>
            <p className="text-xs text-gray-600 mb-1 truncate">{contactData.role}</p>
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Building className="w-3 h-3 mr-1" />
              <span className="truncate">{contactData.company}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
              <span className="font-medium">{contactData.score}</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xxs px-2 py-0.5 ${priorityColors[priority]}`}
            >
              {priority.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
          <div className="flex items-center mb-1">
            <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
            <span className="text-xs font-medium text-purple-800">AI Insight</span>
          </div>
          <p className="text-xs text-purple-700 leading-relaxed line-clamp-2">
            {contactData.aiInsights?.summary || 'Analyzing participant profile...'}
          </p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-blue-50 rounded-lg py-2">
            <div className="text-xs font-bold text-blue-600">{contactData.engagement?.emailOpens || 0}</div>
            <div className="text-xxs text-blue-500">Email Opens</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg py-2">
            <div className="text-xs font-bold text-green-600">{contactData.engagement?.callsAnswered || 0}</div>
            <div className="text-xxs text-green-500">Calls</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg py-2">
            <div className="text-xs font-bold text-purple-600">{contactData.probability}%</div>
            <div className="text-xxs text-purple-500">Probability</div>
          </div>
        </div>

        {/* Contact info and social */}
        <div className="border-t border-gray-200/50 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{contactData.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              {contactData.social?.linkedin && (
                <Linkedin className="w-3 h-3 text-blue-600" />
              )}
              {contactData.social?.twitter && (
                <Twitter className="w-3 h-3 text-blue-400" />
              )}
            </div>
          </div>
          
          {/* Role badges */}
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className={`text-xxs px-2 py-0.5 ${roleColors[meetingRole]}`}
            >
              {meetingRole}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xxs px-2 py-0.5 ${engagementColors[engagement]}`}
            >
              {engagement} engagement
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function ParticipantCards({ meetingId, selectedParticipant, onParticipantSelect }: ParticipantCardsProps) {
  if (!meetingId) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No Meeting Selected</p>
          <p className="text-sm">Select a meeting to view participants</p>
        </div>
      </div>
    );
  }

  const participantIds = meetingParticipants[meetingId] || [];
  const mappedParticipants: MappedParticipant[] = participantIds
    .map(id => {
      const contactId = participantContactMapping[id];
      const contactData = mockContacts.find(c => c.id === contactId);
      const roleInfo = participantRoles[id];
      
      if (!contactData || !roleInfo) return null;
      
      return {
        id,
        contactData,
        ...roleInfo
      };
    })
    .filter((p): p is MappedParticipant => p !== null);

  if (mappedParticipants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No participants found for this meeting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced header */}
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-1.5 mr-3">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Meeting Participants
            </h3>
            <p className="text-xs text-gray-600">
              {mappedParticipants.length} participant{mappedParticipants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Participant cards */}
      <div className="space-y-3">
        {mappedParticipants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ParticipantCard
              participant={participant}
              isSelected={selectedParticipant === participant.id}
              onClick={() => onParticipantSelect(participant.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
