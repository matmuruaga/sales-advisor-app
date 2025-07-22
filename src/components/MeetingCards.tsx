import { Video, Users, Calendar, Clock, ExternalLink, Info, RadioTower } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

// --- Tipos y Datos Actualizados ---
type PlatformKey = 'google-meet' | 'teams' | 'zoom' | 'slack';
type MeetingTypeKey = 
  | 'oportunidad' | 'follow-up' | 'weekly' | 'daily' | 'discovery' 
  | 'cierre' | 'onboarding' | 'renovacion' | 'training' | 'quarterly' 
  | 'prospección';

interface Meeting {
  id: string;
  title: string;
  description: string;
  time: string;
  dateTime: string;
  duration: string;
  platform: PlatformKey;
  type: MeetingTypeKey;
  participants: string[];
}
interface PlatformIconInfo {
  icon: React.ElementType;
  color: string;
}
interface MeetingCardsProps {
  date: Date;
  selectedMeeting: string | null;
  onMeetingSelect: (meetingId: string) => void;
  onInfoSelect: (meetingId: string) => void;
  highlightedMeetingId?: string | null; 
  mockMeetings?: Record<string, Meeting[]>;
}

const mockMeetingsData: Record<string, Meeting[]> = {
  '2025-07-17': [
    { id: 'meeting-1', title: 'Demo Producto - TechCorp', description: 'Presentación de solución para equipo de desarrollo', time: '12:45 PM', dateTime: '2025-07-17T12:45:00', duration: '45', platform: 'google-meet', type: 'oportunidad', participants: ['participant-1', 'participant-2'] },
    { id: 'meeting-2', title: 'Follow-up ClienteX', description: 'Revisión de propuesta y próximos pasos', time: '3:00 PM', dateTime: '2025-07-17T15:00:00', duration: '30', platform: 'teams', type: 'follow-up', participants: ['participant-3'] }
  ],
  '2025-07-18': [
    { id: 'meeting-3', title: 'Weekly Sales Review', description: 'Revisión semanal de pipeline y métricas', time: '9:00 AM', dateTime: '2025-07-18T09:00:00', duration: '60', platform: 'zoom', type: 'weekly', participants: ['participant-4', 'participant-5', 'participant-6'] }
  ],
};
const platformIcons: Record<PlatformKey, PlatformIconInfo> = {
  'google-meet': { icon: Video, color: 'text-green-600' },
  'teams': { icon: Users, color: 'text-blue-600' },
  'zoom': { icon: Video, color: 'text-blue-500' },
  'slack': { icon: ExternalLink, color: 'text-purple-600' }
};
const typeColors: Record<MeetingTypeKey, string> = {
  'oportunidad': 'bg-green-100 text-green-700 border-green-200', 'follow-up': 'bg-orange-100 text-orange-700 border-orange-200', 'weekly': 'bg-blue-100 text-blue-700 border-blue-200', 'daily': 'bg-purple-100 text-purple-700 border-purple-200', 'discovery': 'bg-pink-100 text-pink-700 border-pink-200', 'cierre': 'bg-red-100 text-red-700 border-red-200', 'onboarding': 'bg-teal-100 text-teal-700 border-teal-200', 'renovacion': 'bg-yellow-100 text-yellow-700 border-yellow-200', 'training': 'bg-indigo-100 text-indigo-700 border-indigo-200', 'quarterly': 'bg-gray-100 text-gray-700 border-gray-200', 'prospección': 'bg-cyan-100 text-cyan-700 border-cyan-200'
};

export function MeetingCards({ date, selectedMeeting, onMeetingSelect, onInfoSelect, highlightedMeetingId, mockMeetings = mockMeetingsData }: MeetingCardsProps) {
  const dateKey = date.toISOString().split('T')[0];
  const meetings = mockMeetings[dateKey] || [];
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No hay reuniones programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="inline-flex items-center bg-white/60 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-800">
                Reuniones para {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
        </div>
      </div>
      
      {meetings.map((meeting) => {
        const platformInfo = platformIcons[meeting.platform];
        const PlatformIcon = platformInfo?.icon || Video;
        const isSelected = selectedMeeting === meeting.id;
        const isHighlighted = highlightedMeetingId === meeting.id;

        const meetingTime = new Date(meeting.dateTime);
        const timeDiff = meetingTime.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        const isJoinable = timeDiff <= fiveMinutes && timeDiff > - (parseInt(meeting.duration) * 60 * 1000);
        
        return (
          <Card
            key={meeting.id}
            className={`
              p-4 transition-all duration-300
              ${isSelected 
                ? 'border-2 border-purple-500 bg-purple-50' 
                : 'border-2 border-transparent bg-white'
              }
              ${!isSelected && isHighlighted ? 'border-2 border-pink-400' : ''}
              ${!isSelected ? 'hover:shadow-md' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center space-x-2 flex-grow min-w-0">
                <PlatformIcon className={`w-4 h-4 ${platformInfo.color} flex-shrink-0`} />
                <h4 className="text-sm text-gray-800 truncate" title={meeting.title}>
                  {meeting.title}
                </h4>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="outline" className={`text-xxs ${typeColors[meeting.type]}`}>{meeting.type}</Badge>
              </div>
            </div>
            <p className="text-xxs text-gray-600 mb-3">{meeting.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{meeting.time}</span></div>
                <div className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{meeting.participants.length}</span></div>
              </div>
              <span className="text-xs text-gray-400">{meeting.duration} min</span>
            </div>

            {/* --- SECCIÓN DE ACCIONES CORREGIDA --- */}
            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              {/* Lado Izquierdo */}
              <div>
                <Button 
                    variant="outline"
                    size="sm"
                    className={`
                      h-auto px-2 py-1 text-xs rounded-md
                      ${isJoinable ? 'bg-green-100 border-green-300 text-green-700' : ''}
                    `}
                    disabled={!isJoinable}
                >
                    <RadioTower className="w-3.5 h-3.5 mr-1.5" />
                    Unirse
                </Button>
                {!isJoinable && (
                    <p className="text-xxs text-gray-400 mt-1">Se activa 5 min antes</p>
                )}
              </div>

              {/* Lado Derecho */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" className="h-auto px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800" onClick={() => onInfoSelect(meeting.id)}>
                  <Info className="w-3.5 h-3.5 mr-1.5" /> Info
                </Button>
                <Button className="h-auto px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md" onClick={() => onMeetingSelect(meeting.id)}>
                  <Users className="w-3.5 h-3.5 mr-1.5" /> Participantes
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
