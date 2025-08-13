import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Brain, Zap, Users, Info as InfoIcon, Calendar, Sparkles } from 'lucide-react';
import { ParticipantCards } from './ParticipantCards';
import { AIInsights } from './AIInsights';
import { ActionPanel } from './ActionPanel';
import { MeetingCards } from './MeetingCards';
import { MeetingInfoPanel } from './MeetingInfoPanel';
import { ConversationSimulator } from './ConversationSimulator'; // <--- 1. IMPORTED

interface MeetingTimelineProps {
  date: Date;
  selectedMeeting: string | null;
  onMeetingSelect: (meetingId: string | null) => void;
  highlightedMeetingId: string | null;
  mockMeetings: Record<string, any[]>;
}

// <--- 2. MOCK DATA TO GET PARTICIPANT NAME ---
// In a real app, this would come from global state or an API.
const mockParticipantsForName: Record<string, { name: string }> = {
  'participant-1': { name: 'María González' },
  'participant-2': { name: 'Carlos Ruiz' },
  'participant-3': { name: 'Ana López' },
};

const TabButton = ({
  name,
  icon: Icon,
  label,
  activeTab,
  setActiveTab,
}: {
  name: string;
  icon: React.ElementType;
  label: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const isActive = activeTab === name;
  return (
    <button
      onClick={() => setActiveTab(name)}
      className={`relative px-6 py-3 text-sm font-medium flex items-center transition-all duration-200 focus:outline-none ${
        isActive 
          ? 'bg-white/80 text-purple-700 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
      }`}
    >
      <Icon
        className={`w-4 h-4 mr-2 transition-colors ${
          isActive ? 'text-purple-600' : 'text-gray-500'
        }`}
      />
      <span>{label}</span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
          layoutId="active-tab-indicator"
        />
      )}
    </button>
  );
};

export function MeetingTimeline({
  date,
  selectedMeeting,
  onMeetingSelect,
  highlightedMeetingId,
  mockMeetings,
}: MeetingTimelineProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('insights');
  const [activeView, setActiveView] = useState<'participants' | 'info'>(
    'participants'
  );
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false); // <--- 3. NEW STATE

  const participantName = selectedParticipant
    ? mockParticipantsForName[selectedParticipant]?.name
    : 'the participant';

  const handleClose = () => {
    onMeetingSelect(null);
    setSelectedParticipant(null);
    setActiveTab('insights');
    setActiveView('participants');
    setIsSimulatorOpen(false); // <--- 6. ENSURE SIMULATOR CLOSE
  };

  return (
    <div className="relative h-full w-full">
      <div className="h-full overflow-y-auto pr-2">
        <MeetingCards
          date={date}
          selectedMeeting={selectedMeeting}
          onMeetingSelect={(meetingId) => {
            onMeetingSelect(meetingId);
            setSelectedParticipant(null);
            setActiveView('participants');
          }}
          onInfoSelect={(meetingId) => {
            onMeetingSelect(meetingId);
            setActiveView('info');
          }}
          highlightedMeetingId={highlightedMeetingId}
          mockMeetings={mockMeetings}
        />
      </div>

      <AnimatePresence>
        {selectedMeeting && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-md z-30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-16 md:inset-24 z-40 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl ring-1 ring-white/30 border border-white/20 flex flex-col overflow-hidden"
            >
              {/* Premium Header Bar */}
              <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 p-6 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-full p-2 shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h2 className="text-xl font-bold text-white">Meeting Intelligence</h2>
                      <p className="text-purple-100 text-sm">AI-powered insights and participant analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
                      <div className="flex items-center text-xs text-white font-medium">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Active
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-white hover:text-white/80 transition-colors bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 overflow-hidden p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeView === 'participants' ? (
                      <div className="grid grid-cols-12 gap-6 h-full">
                        <div className="col-span-12 md:col-span-4" style={{ height: 'calc(100vh - 280px)' }}>
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg h-full flex flex-col overflow-hidden">
                            <div className="p-4 flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                              <h3 className="font-semibold text-gray-800 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-purple-600" />
                                Meeting Participants
                              </h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4">
                              <ParticipantCards
                                meetingId={selectedMeeting}
                                selectedParticipant={selectedParticipant}
                                onParticipantSelect={(id) => {
                                  setSelectedParticipant(id);
                                  setActiveTab('insights');
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-8" style={{ height: 'calc(100vh - 280px)' }}>
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg h-full flex flex-col overflow-hidden">
                            <div className="flex flex-shrink-0 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
                              <TabButton
                                name="insights"
                                icon={Brain}
                                label="AI Insights"
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                              />
                              <TabButton
                                name="actions"
                                icon={Zap}
                                label="Actions"
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                              />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              {activeTab === 'insights' && (
                                <AIInsights participantId={selectedParticipant} />
                              )}
                              {activeTab === 'actions' && (
                                <ActionPanel
                                  participantId={selectedParticipant}
                                  meetingId={selectedMeeting}
                                  onStartSimulation={() => setIsSimulatorOpen(true)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg h-full flex flex-col overflow-hidden">
                          <div className="p-4 flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                            <h3 className="font-semibold text-gray-800 flex items-center">
                              <InfoIcon className="w-4 h-4 mr-2 text-purple-600" />
                              Meeting Intelligence
                            </h3>
                          </div>
                          <div className="overflow-y-auto flex-1 p-4">
                            <MeetingInfoPanel meetingId={selectedMeeting} />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- 5. CONDITIONAL SIMULATOR RENDER --- */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <ConversationSimulator
            participantName={participantName}
            onClose={() => setIsSimulatorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
