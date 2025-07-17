"use client";

import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { MeetingCards } from '@/components/MeetingCards';
import { ParticipantCards } from '@/components/ParticipantCards';
import { AIInsights } from '@/components/AIInsights';
import { ActionPanel } from '@/components/ActionPanel';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-01-15'));
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>('meeting-1');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedMeeting(null); 
    setSelectedParticipant(null);
  };

  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeeting(meetingId);
    setSelectedParticipant(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            SalesAI Advisor
          </h1>
          <p className="text-gray-600">Tu asistente inteligente para reuniones de ventas</p>
        </header>
        
        {/* --- CORRECCIÓN DE LAYOUT ---
            He cambiado los valores de col-span para una distribución más equilibrada.
            - Columna 1: col-span-3
            - Columna 2: col-span-3
            - Columna 3: col-span-3
            - Columna 4: col-span-3
            Esto hace que la columna 4 sea más ancha y la 3 más estrecha, solucionando los desbordamientos.
        */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)]">
          {/* Columna 1: Calendario y Reuniones */}
          <div className="col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col gap-6">
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedDate && (
                <MeetingCards 
                  key={selectedDate.toISOString()} 
                  date={selectedDate}
                  selectedMeeting={selectedMeeting}
                  onMeetingSelect={handleMeetingSelect}
                />
              )}
            </div>
          </div>

          {/* Columna 2: Participantes */}
          <div className="col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 overflow-y-auto">
            <ParticipantCards 
              meetingId={selectedMeeting}
              selectedParticipant={selectedParticipant}
              onParticipantSelect={setSelectedParticipant}
            />
          </div>

          {/* Columna 3: Información AI */}
          <div className="col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 overflow-y-auto">
            <AIInsights 
              participantId={selectedParticipant}
            />
          </div>

          {/* Columna 4: Panel de Acciones */}
          <div className="col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 overflow-y-auto">
            <ActionPanel 
              participantId={selectedParticipant}
              meetingId={selectedMeeting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
