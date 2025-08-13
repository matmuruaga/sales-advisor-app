import {
  Video,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  RadioTower,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

/* ---------- Types & Mock Data ---------- */
type PlatformKey = "google-meet" | "teams" | "zoom" | "slack";
type MeetingTypeKey =
  | "oportunidad"
  | "follow-up"
  | "weekly"
  | "daily"
  | "discovery"
  | "cierre"
  | "onboarding"
  | "renovacion"
  | "training"
  | "quarterly"
  | "prospección";

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

/* --- UPDATED MOCK MEETINGS (ENGLISH COPY) --- */
const mockMeetingsData: Record<string, Meeting[]> = {
  "2025-07-17": [
    {
      id: "meeting-1",
      title: "Product Demo – TechCorp",
      description: "Solution presentation for the development team",
      time: "12:45 PM",
      dateTime: "2025-07-17T12:45:00",
      duration: "45",
      platform: "google-meet",
      type: "oportunidad",
      participants: ["participant-1", "participant-2"],
    },
    {
      id: "meeting-2",
      title: "ClientX Follow-Up",
      description: "Proposal review and next steps",
      time: "3:00 PM",
      dateTime: "2025-07-17T15:00:00",
      duration: "30",
      platform: "teams",
      type: "follow-up",
      participants: ["participant-3"],
    },
  ],
  "2025-07-18": [
    {
      id: "meeting-3",
      title: "Weekly Sales Review",
      description: "Weekly review of pipeline and metrics",
      time: "9:00 AM",
      dateTime: "2025-07-18T09:00:00",
      duration: "60",
      platform: "zoom",
      type: "weekly",
      participants: ["participant-4", "participant-5", "participant-6"],
    },
  ],
};

/* --- Platform & Type visual helpers --- */
const platformIcons: Record<PlatformKey, PlatformIconInfo> = {
  "google-meet": { icon: Video, color: "text-green-600" },
  teams: { icon: Users, color: "text-blue-600" },
  zoom: { icon: Video, color: "text-blue-500" },
  slack: { icon: ExternalLink, color: "text-purple-600" },
};
const typeColors: Record<MeetingTypeKey, string> = {
  oportunidad: "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-green-200/50 shadow-sm",
  "follow-up": "bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 border-orange-200/50 shadow-sm",
  weekly: "bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 border-blue-200/50 shadow-sm",
  daily: "bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 border-purple-200/50 shadow-sm",
  discovery: "bg-gradient-to-br from-pink-100 to-rose-100 text-pink-700 border-pink-200/50 shadow-sm",
  cierre: "bg-gradient-to-br from-red-100 to-rose-100 text-red-700 border-red-200/50 shadow-sm",
  onboarding: "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700 border-teal-200/50 shadow-sm",
  renovacion: "bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200/50 shadow-sm",
  training: "bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 border-indigo-200/50 shadow-sm",
  quarterly: "bg-gradient-to-br from-gray-100 to-slate-100 text-gray-700 border-gray-200/50 shadow-sm",
  prospección: "bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200/50 shadow-sm",
};

export function MeetingCards({
  date,
  selectedMeeting,
  onMeetingSelect,
  onInfoSelect,
  highlightedMeetingId,
  mockMeetings = mockMeetingsData,
}: MeetingCardsProps) {
  const dateKey = date.toISOString().split("T")[0];
  const meetings = mockMeetings[dateKey] || [];
  const [now, setNow] = useState(new Date());

  /* Auto-refresh “Join” button status every minute */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  /* Empty state */
  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="bg-white/60 backdrop-blur-sm rounded-full p-8 mb-4 shadow-lg mx-auto w-fit">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-lg font-medium mb-2">No Meetings Scheduled</p>
        <p className="text-sm text-gray-400">Your calendar is clear for this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date banner - Premium Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-xl p-4 shadow-lg border border-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2 shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <p className="text-sm text-purple-600">{meetings.length} meetings scheduled</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
              <div className="flex items-center text-xs text-purple-600 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting cards */}
      {meetings.map((meeting) => {
        const platformInfo = platformIcons[meeting.platform];
        const PlatformIcon = platformInfo?.icon || Video;
        const isSelected = selectedMeeting === meeting.id;
        const isHighlighted = highlightedMeetingId === meeting.id;

        /* Join-link logic: available 5 min before until duration ends */
        const meetingTime = new Date(meeting.dateTime);
        const timeDiff = meetingTime.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        const isJoinable =
          timeDiff <= fiveMinutes &&
          timeDiff > -(parseInt(meeting.duration) * 60 * 1000);

        return (
          <Card
            key={meeting.id}
            className={`
              p-5 transition-all duration-300 backdrop-blur-sm
              ${
                isSelected
                  ? "border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-xl"
                  : "border border-white/50 bg-white/80 hover:bg-white/90"
              }
              ${!isSelected && isHighlighted ? "border-2 border-pink-400 shadow-lg" : ""}
              ${!isSelected ? "hover:shadow-lg hover:-translate-y-0.5" : ""}
            `}
          >
            {/* Header with enhanced styling */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center space-x-3 flex-grow min-w-0">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                  <PlatformIcon
                    className={`w-4 h-4 ${platformInfo.color} flex-shrink-0`}
                  />
                </div>
                <h4
                  className="text-base font-semibold text-gray-800 truncate"
                  title={meeting.title}
                >
                  {meeting.title}
                </h4>
              </div>
              <div className="flex-shrink-0">
                <Badge
                  className={`text-xs font-medium px-3 py-1 ${typeColors[meeting.type]}`}
                >
                  {meeting.type}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{meeting.description}</p>

            {/* Meta row with enhanced design */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{meeting.time}</span>
                </div>
                <div className="flex items-center bg-blue-50/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <Users className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">{meeting.participants.length} participants</span>
                </div>
              </div>
              <div className="bg-purple-50/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-sm font-medium text-purple-700">
                  {meeting.duration} min
                </span>
              </div>
            </div>

            {/* Actions - Premium Design */}
            <div className="border-t border-gray-200/50 pt-4 flex items-center justify-between">
              {/* Left side - Join Button */}
              <div>
                <Button
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm
                    ${
                      isJoinable
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
                  disabled={!isJoinable}
                >
                  {isJoinable ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Join Now
                    </>
                  ) : (
                    <>
                      <RadioTower className="w-4 h-4 mr-2" />
                      Join Meeting
                    </>
                  )}
                </Button>
                {!isJoinable && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Available 5 min before start
                  </p>
                )}
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-white/90 hover:shadow-md transition-all duration-200"
                  onClick={() => onInfoSelect(meeting.id)}
                >
                  <Info className="w-4 h-4 mr-1.5" /> 
                  Details
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  size="sm"
                  onClick={() => onMeetingSelect(meeting.id)}
                >
                  <Users className="w-4 h-4 mr-1.5" /> 
                  Participants
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
