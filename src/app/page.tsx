"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/Calendar";
import { MeetingTimeline } from "@/components/MeetingTimeline";
import { AppHeader } from "@/components/AppHeader";
import { AnalyticsPage } from "@/components/AnalyticsPage";
import { ScheduleMeetingModal } from "@/components/ScheduleMeetingModal";
import { QuickSimulateModal } from "@/components/QuickSimulateModal";
import { CallScriptModal } from "@/components/CallScriptModal";
import { NestedMeetingsModal } from "@/components/NestedMeetingsModal";
import { AgentCommandPalette } from "@/components/AgentCommandPalette";

const mockMeetings: Record<string, any[]> = {
  "2025-07-17": [
    {
      id: "meeting-1",
      title: "Product Demo – TechCorp",
      description: "Solution presentation for the development team",
      time: "10:00",
      dateTime: "2025-07-17T10:00:00",
      duration: "45",
      platform: "google-meet",
      type: "opportunity",
      participants: ["participant-1", "participant-2"],
    },
    {
      id: "meeting-2",
      title: "ClientX Follow-Up",
      description: "Proposal review and next steps",
      time: "15:00",
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
      time: "09:00",
      dateTime: "2025-07-18T09:00:00",
      duration: "60",
      platform: "zoom",
      type: "weekly",
      participants: ["participant-4", "participant-5", "participant-6"],
    },
  ],
};

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-07-17"));
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [view, setView] = useState<"meetings" | "analytics">("meetings");

  const [open, setOpen] = useState({
    schedule: false,
    simulate: false,
    call: false,
    nested: false,
    agent: false,
  });

  const toggle = (key: keyof typeof open, v: boolean) =>
    setOpen((prev) => ({ ...prev, [key]: v }));

  const handleDate = (d: Date) => {
    setSelectedDate(d);
    setSelectedMeeting(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-gray-800 dark:text-gray-100 selection:bg-purple-200 dark:selection:bg-purple-600">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <AppHeader activeView={view} setActiveView={setView} />

        <motion.section
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="h-[calc(100vh-152px)]"
        >
          {view === "meetings" ? (
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-12 lg:col-span-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDate}
                  onScheduleMeeting={() => toggle("schedule", true)}
                  onSimulateConversation={() => toggle("simulate", true)}
                  onGenerateCallScript={() => toggle("call", true)}
                  onViewNestedMeetings={() => toggle("nested", true)}
                />
              </div>
              <div className="col-span-12 lg:col-span-9 rounded-3xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
                <MeetingTimeline
                  key={selectedDate.toISOString()}
                  date={selectedDate}
                  selectedMeeting={selectedMeeting}
                  onMeetingSelect={setSelectedMeeting}
                  highlightedMeetingId={null}
                  mockMeetings={mockMeetings}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 h-full overflow-hidden">
              <AnalyticsPage />
            </div>
          )}
        </motion.section>

        {/* --- Modal Rendering --- */}
        <ScheduleMeetingModal isOpen={open.schedule} onClose={() => toggle("schedule", false)} />
        <QuickSimulateModal isOpen={open.simulate} onClose={() => toggle("simulate", false)} />
        <CallScriptModal isOpen={open.call} onClose={() => toggle("call", false)} />
        <NestedMeetingsModal isOpen={open.nested} onClose={() => toggle("nested", false)} />
        
        {/* --- FIXED LINE: Added missing agent component --- */}
        <AgentCommandPalette isOpen={open.agent} onClose={() => toggle("agent", false)} />
      </div>

      {/* --- Animation Logic for Floating Button --- */}
      <div className="fixed bottom-6 right-10 md:right-14 z-50">
        <AnimatePresence>
          {!open.agent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative"
            >
              <motion.div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xxs rounded-full shadow-lg whitespace-nowrap">
                The Agent
              </motion.div>
              <Button
                size="icon"
                className="rounded-full h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-600/30"
                onClick={() => toggle("agent", true)}
              >
                <Sparkles className="h-7 w-7" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
