import { Video, Users, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

// --- **CORRECCIÓN DE TYPESCRIPT** ---

// 1. Define specific literal types for keys to ensure type safety.
type PlatformKey = 'google-meet' | 'teams' | 'zoom' | 'slack';
type MeetingTypeKey = 
  | 'oportunidad' | 'follow-up' | 'weekly' | 'daily' | 'discovery' 
  | 'cierre' | 'onboarding' | 'renovacion' | 'training' | 'quarterly' 
  | 'prospección';

// 2. Define the structure of a single meeting object.
interface Meeting {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  platform: PlatformKey;
  type: MeetingTypeKey;
  participants: string[];
}

// 3. Define the structure for the platform icon information.
interface PlatformIconInfo {
  icon: React.ElementType;
  color: string;
}

// Props interface for the component
interface MeetingCardsProps {
  date: Date;
  selectedMeeting: string | null;
  onMeetingSelect: (meetingId: string) => void;
}

// 4. Use the `Record` utility type for all string-indexed objects.
const mockMeetings: Record<string, Meeting[]> = {
  '2025-01-15': [
    {
      id: 'meeting-1',
      title: 'Demo Producto - TechCorp',
      description: 'Presentación de solución para equipo de desarrollo',
      time: '10:00 AM',
      duration: '45 min',
      platform: 'google-meet',
      type: 'oportunidad',
      participants: ['participant-1', 'participant-2']
    },
    {
      id: 'meeting-2',
      title: 'Follow-up ClienteX',
      description: 'Revisión de propuesta y próximos pasos',
      time: '3:00 PM',
      duration: '30 min',
      platform: 'teams',
      type: 'follow-up',
      participants: ['participant-3']
    }
  ],
  '2025-01-16': [
    {
      id: 'meeting-3',
      title: 'Weekly Sales Review',
      description: 'Revisión semanal de pipeline y métricas',
      time: '9:00 AM',
      duration: '60 min',
      platform: 'zoom',
      type: 'weekly',
      participants: ['participant-4', 'participant-5', 'participant-6']
    }
  ],
  '2025-01-18': [
    {
      id: 'meeting-4',
      title: 'Discovery Call - StartupABC',
      description: 'Primera llamada para entender necesidades',
      time: '11:00 AM',
      duration: '30 min',
      platform: 'google-meet',
      type: 'discovery',
      participants: ['participant-7', 'participant-8']
    },
    {
      id: 'meeting-5',
      title: 'Daily Standup',
      description: 'Sincronización diaria del equipo',
      time: '2:00 PM',
      duration: '15 min',
      platform: 'slack',
      type: 'daily',
      participants: ['participant-9', 'participant-10']
    }
  ],
  // ... (add other meetings as needed)
};

const platformIcons: Record<PlatformKey, PlatformIconInfo> = {
  'google-meet': { icon: Video, color: 'text-green-600' },
  'teams': { icon: Users, color: 'text-blue-600' },
  'zoom': { icon: Video, color: 'text-blue-500' },
  'slack': { icon: ExternalLink, color: 'text-purple-600' }
};

const typeColors: Record<MeetingTypeKey, string> = {
  'oportunidad': 'bg-green-100 text-green-700 border-green-200',
  'follow-up': 'bg-orange-100 text-orange-700 border-orange-200',
  'weekly': 'bg-blue-100 text-blue-700 border-blue-200',
  'daily': 'bg-purple-100 text-purple-700 border-purple-200',
  'discovery': 'bg-pink-100 text-pink-700 border-pink-200',
  'cierre': 'bg-red-100 text-red-700 border-red-200',
  'onboarding': 'bg-teal-100 text-teal-700 border-teal-200',
  'renovacion': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'training': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'quarterly': 'bg-gray-100 text-gray-700 border-gray-200',
  'prospección': 'bg-cyan-100 text-cyan-700 border-cyan-200'
};

export function MeetingCards({ date, selectedMeeting, onMeetingSelect }: MeetingCardsProps) {
  const dateKey = date.toISOString().split('T')[0];
  const meetings = mockMeetings[dateKey] || [];

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No hay reuniones programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-gray-600 mb-4">
        Reuniones para {date.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </h3>
      
      {meetings.map((meeting) => {
        // Accessing typed objects is now safe
        const PlatformIcon = platformIcons[meeting.platform]?.icon || Video;
        const platformColor = platformIcons[meeting.platform]?.color || 'text-gray-600';
        const isSelected = selectedMeeting === meeting.id;
        
        return (
          <Card
            key={meeting.id}
            className={`
              p-4 cursor-pointer transition-all duration-200 hover:shadow-md
              ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}
            `}
            onClick={() => onMeetingSelect(meeting.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <PlatformIcon className={`w-4 h-4 ${platformColor}`} />
                <h4 className="text-sm text-gray-800">{meeting.title}</h4>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xxs ${typeColors[meeting.type]}`}
              >
                {meeting.type}
              </Badge>
            </div>
            
            <p className="text-xxs text-gray-600 mb-3">{meeting.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{meeting.participants.length}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">{meeting.duration}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
