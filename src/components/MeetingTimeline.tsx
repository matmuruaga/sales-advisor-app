import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Brain, Zap, Users, Info as InfoIcon } from 'lucide-react';
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
      className="relative px-4 py-2 text-sm font-medium flex items-center transition-colors focus:outline-none"
    >
      <Icon
        className={`w-4 h-4 mr-2 transition-colors ${
          isActive ? 'text-purple-600' : 'text-gray-500'
        }`}
      />
      <span
        className={`transition-colors ${
          isActive ? 'text-gray-800' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
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
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-16 md:inset-24 z-40 bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 p-6 flex flex-col"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-50"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden h-full"
                >
                  {activeView === 'participants' ? (
                    <div className="grid grid-cols-12 gap-6 h-full">
                      <div className="col-span-12 md:col-span-4 h-full overflow-y-auto pr-2">
                        <ParticipantCards
                          meetingId={selectedMeeting}
                          selectedParticipant={selectedParticipant}
                          onParticipantSelect={(id) => {
                            setSelectedParticipant(id);
                            setActiveTab('insights');
                          }}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-8 h-full relative">
                        <div className="flex border-b border-gray-200/80">
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
                        <div className="absolute top-12 bottom-0 left-0 right-0 overflow-y-auto pt-4 pr-2">
                          {activeTab === 'insights' && (
                            <AIInsights participantId={selectedParticipant} />
                          )}
                          {/* --- 4. ACTIONPANEL UPDATE --- */}
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
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <MeetingInfoPanel meetingId={selectedMeeting} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
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
