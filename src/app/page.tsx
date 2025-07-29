"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, QuickActionType } from "@/components/Calendar"; // Importar el nuevo tipo
import { MeetingTimeline } from "@/components/MeetingTimeline";
import { AppHeader } from "@/components/AppHeader";
import { AnalyticsPage } from "@/components/AnalyticsPage";
import { ActionsPage } from "@/components/ActionsPage";
import { AgentCommandPalette } from "@/components/AgentCommandPalette";
import { CompanyPage } from "@/components/CompanyPage";
import { ContactsPage } from "@/components/ContactsPage"; 
import { ContactDetailPanel } from "@/components/contacts/ContactDetailPanel";
import { CompanyDetailPanel } from "@/components/contacts/CompanyDetailPanel";
// 2. Importar el nuevo modal unificado
import { QuickActionPromptModal } from "@/components/QuickActionPromptModal";

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
  const [view, setView] = useState<'meetings' | 'analytics' | 'actions' | 'company' | 'contacts'>('meetings');
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  // 3. Reemplazar los estados de los modales antiguos
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionType | null>(null);
  const [isAgentPaletteOpen, setIsAgentPaletteOpen] = useState(false);

   // --- LÓGICA DE TOGGLE AQUÍ ---
  const handleContactSelect = (contactId: string) => {
    // Si el panel ya está abierto para este contacto, ciérralo. Si no, ábrelo.
    setActiveContactId(prevId => (prevId === contactId ? null : contactId));
  };

  const handleCompanySelect = (companyName: string) => {
    // Misma lógica para el panel de la compañía
    setActiveCompany(prevName => (prevName === companyName ? null : companyName));
  };

  const handleQuickAction = (actionType: QuickActionType) => {
    setActiveQuickAction(actionType);
    setIsQuickPromptOpen(true);
  };

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
          {view === 'meetings' && (
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-12 lg:col-span-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
                {/* 4. Pasar el nuevo handler al Calendario */}
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDate}
                  onQuickAction={handleQuickAction}
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
          )}

          {view === 'analytics' && (
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 h-full overflow-hidden">
              <AnalyticsPage />
            </div>
          )}

          {view === 'actions' && (
            <ActionsPage />
          )}
          {view === 'company' && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg ring-1 ring-black/5 h-full overflow-hidden">
              <CompanyPage />
            </div>
          )}
            {view === 'contacts' && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg ring-1 ring-black/5 h-full overflow-hidden">
              {/* Pasar los nuevos handlers a la página de contactos */}
              <ContactsPage 
                onContactSelect={handleContactSelect}
                onCompanySelect={handleCompanySelect}
              />
            </div>
          )}
        </motion.section>
        

        {/* 5. Renderizar el nuevo modal en lugar de los antiguos */}
        <QuickActionPromptModal 
            isOpen={isQuickPromptOpen}
            onClose={() => setIsQuickPromptOpen(false)}
            actionType={activeQuickAction}
        />
        <AgentCommandPalette isOpen={isAgentPaletteOpen} onClose={() => setIsAgentPaletteOpen(false)} />
      </div>
       {/* 5. Contenedor de los Paneles Deslizantes a nivel de página */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {activeContactId && (
            <ContactDetailPanel 
              contactId={activeContactId} 
              onClose={() => setActiveContactId(null)} 
            />
          )}
          {activeCompany && (
            <CompanyDetailPanel 
              companyName={activeCompany} 
              onClose={() => setActiveCompany(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* --- Animation Logic for Floating Button --- */}
      <div className="fixed bottom-6 right-10 md:right-14 z-50">
        <AnimatePresence>
          {!isAgentPaletteOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative"
            >
              <motion.div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xxs rounded-full shadow-lg whitespace-nowrap">
                AI Coach
              </motion.div>
              <Button
                size="icon"
                className="rounded-full h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-600/30"
                onClick={() => setIsAgentPaletteOpen(true)}
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