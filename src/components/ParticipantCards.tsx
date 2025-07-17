import { Building, MapPin, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// --- **CORRECCIÓN DE TYPESCRIPT** ---

// 1. Define specific literal types for all keys to ensure type safety.
type ParticipantId = 
  | 'participant-1' | 'participant-2' | 'participant-3' | 'participant-4'
  | 'participant-5' | 'participant-6' | 'participant-7' | 'participant-8';

type MeetingId = 
  | 'meeting-1' | 'meeting-2' | 'meeting-3' | 'meeting-4' | 'meeting-5'
  | 'meeting-6' | 'meeting-7' | 'meeting-8' | 'meeting-9' | 'meeting-10' | 'meeting-11';

type LevelKey = 'decision-maker' | 'influencer' | 'team-member';
type EngagementKey = 'high' | 'medium' | 'low';
type PriorityKey = 'hot' | 'warm' | 'cold' | 'medium';

// 2. Define the structure of a single participant object.
interface Participant {
  id: ParticipantId;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  level: LevelKey;
  engagement: EngagementKey;
  priority: PriorityKey;
}

// Props interface for the component
interface ParticipantCardsProps {
  meetingId: string | null;
  selectedParticipant: string | null;
  onParticipantSelect: (participantId: string) => void;
}

// 3. Use the `Record` utility type for all string-indexed objects.
const mockParticipants: Record<ParticipantId, Participant> = {
  'participant-1': {
    id: 'participant-1',
    name: 'María González',
    role: 'CTO',
    company: 'TechCorp',
    email: 'maria.gonzalez@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'Madrid, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    level: 'decision-maker',
    engagement: 'high',
    priority: 'hot'
  },
  'participant-2': {
    id: 'participant-2',
    name: 'Carlos Ruiz',
    role: 'Lead Developer',
    company: 'TechCorp',
    email: 'carlos.ruiz@techcorp.com',
    phone: '+1 (555) 123-4568',
    location: 'Barcelona, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    level: 'influencer',
    engagement: 'medium',
    priority: 'warm'
  },
  'participant-3': {
    id: 'participant-3',
    name: 'Ana López',
    role: 'VP Sales',
    company: 'ClienteX',
    email: 'ana.lopez@clientex.com',
    phone: '+1 (555) 987-6543',
    location: 'Valencia, España',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    level: 'decision-maker',
    engagement: 'high',
    priority: 'hot'
  },
  'participant-4': {
    id: 'participant-4',
    name: 'David Martín',
    role: 'Sales Manager',
    company: 'NuestraCorp',
    email: 'david.martin@nuestracorp.com',
    phone: '+1 (555) 456-7890',
    location: 'Sevilla, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    level: 'team-member',
    engagement: 'high',
    priority: 'medium'
  },
  'participant-5': {
    id: 'participant-5',
    name: 'Laura Jiménez',
    role: 'Product Manager',
    company: 'NuestraCorp',
    email: 'laura.jimenez@nuestracorp.com',
    phone: '+1 (555) 456-7891',
    location: 'Bilbao, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    level: 'team-member',
    engagement: 'medium',
    priority: 'medium'
  },
  'participant-6': {
    id: 'participant-6',
    name: 'Roberto Sánchez',
    role: 'Director Regional',
    company: 'NuestraCorp',
    email: 'roberto.sanchez@nuestracorp.com',
    phone: '+1 (555) 456-7892',
    location: 'Zaragoza, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026709d',
    level: 'decision-maker',
    engagement: 'high',
    priority: 'hot'
  },
  'participant-7': {
    id: 'participant-7',
    name: 'Elena Pérez',
    role: 'CEO',
    company: 'StartupABC',
    email: 'elena.perez@startupabc.com',
    phone: '+1 (555) 321-9876',
    location: 'Barcelona, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e2902670ad',
    level: 'decision-maker',
    engagement: 'high',
    priority: 'hot'
  },
  'participant-8': {
    id: 'participant-8',
    name: 'Miguel Torres',
    role: 'COO',
    company: 'StartupABC',
    email: 'miguel.torres@startupabc.com',
    phone: '+1 (555) 321-9877',
    location: 'Madrid, España',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e2902670bd',
    level: 'decision-maker',
    engagement: 'medium',
    priority: 'warm'
  }
};

const meetingParticipants: Record<MeetingId, ParticipantId[]> = {
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

const levelColors: Record<LevelKey, string> = {
  'decision-maker': 'bg-red-100 text-red-700 border-red-200',
  'influencer': 'bg-orange-100 text-orange-700 border-orange-200',
  'team-member': 'bg-blue-100 text-blue-700 border-blue-200'
};

const engagementColors: Record<EngagementKey, string> = {
  'high': 'bg-green-100 text-green-700 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'low': 'bg-gray-100 text-gray-700 border-gray-200'
};

const priorityColors: Record<PriorityKey, string> = {
  'hot': 'bg-red-100 text-red-700 border-red-200',
  'warm': 'bg-orange-100 text-orange-700 border-orange-200',
  'cold': 'bg-blue-100 text-blue-700 border-blue-200',
  'medium': 'bg-purple-100 text-purple-700 border-purple-200'
};

export function ParticipantCards({ meetingId, selectedParticipant, onParticipantSelect }: ParticipantCardsProps) {
  if (!meetingId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecciona una reunión para ver participantes</p>
      </div>
    );
  }

  // Type assertion to ensure meetingId is treated as a valid key.
  const participantIds = meetingParticipants[meetingId as MeetingId] || [];
  const participants = participantIds.map(id => mockParticipants[id]).filter((p): p is Participant => !!p);

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay participantes para esta reunión</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm text-gray-600 mb-4">
        Participantes ({participants.length})
      </h3>
      
      {participants.map((participant) => {
        const isSelected = selectedParticipant === participant.id;
        
        return (
          <Card
            key={participant.id}
            className={`
              p-4 cursor-pointer transition-all duration-200 hover:shadow-md
              ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}
            `}
            onClick={() => onParticipantSelect(participant.id)}
          >
            <div className="flex items-start space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={participant.avatar} alt={participant.name} />
                <AvatarFallback>
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm text-gray-800">{participant.name}</h4>
                    <p className="text-xs text-gray-600">{participant.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  <Building className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{participant.company}</span>
                </div>
                
                <div className="flex items-center space-x-1 mb-3">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{participant.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {/* Accessing color objects with typed keys is now safe */}
                  <Badge 
                    variant="outline" 
                    className={`text-xxs ${levelColors[participant.level]}`}
                  >
                    {participant.level}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xxs ${engagementColors[participant.engagement]}`}
                  >
                    {participant.engagement}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xxs ${priorityColors[participant.priority]}`}
                  >
                    {participant.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
