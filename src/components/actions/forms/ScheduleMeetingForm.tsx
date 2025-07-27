// src/app/actions/forms/ScheduleMeetingForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { Calendar, CalendarDays, Clock, FileText, Tag, User, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const mockContacts = [
  { id: 'contact-1', name: 'María González', company: 'TechCorp', role: 'CTO' },
  { id: 'contact-2', name: 'Carlos Ruiz', company: 'InnovateAI', role: 'CEO' },
  { id: 'contact-3', name: 'Ana López', company: 'DataSol', role: 'VP Engineering' },
];

const meetingTypes = [
  { id: 'discovery', label: 'Discovery Call', icon: '🔍', duration: 30 },
  { id: 'demo', label: 'Product Demo', icon: '📺', duration: 45 },
  { id: 'follow-up', label: 'Follow-up Meeting', icon: '📞', duration: 30 },
  { id: 'presentation', label: 'Proposal Presentation', icon: '📊', duration: 60 },
  { id: 'negotiation', label: 'Contract Negotiation', icon: '🤝', duration: 90 },
];

const urgencyLevels = [
  { id: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800', days: 14 },
  { id: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', days: 7 },
  { id: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800', days: 2 },
];

interface ScheduleMeetingFormProps {
  processedData?: any;
}

export const ScheduleMeetingForm = ({ processedData }: ScheduleMeetingFormProps) => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('discovery');
  const [agenda, setAgenda] = useState('');
  const [urgency, setUrgency] = useState('medium');

  // Auto-llenar campos cuando llega processedData
  useEffect(() => {
    if (processedData) {
      console.log('📊 Datos procesados recibidos:', processedData);
      
      if (processedData.suggestedTitle) {
        setMeetingTitle(processedData.suggestedTitle);
      }
      
      if (processedData.extractedContact) {
        // Intentar encontrar el contacto en la lista existente o crear referencia
        const existingContact = mockContacts.find(c => 
          processedData.extractedContact.toLowerCase().includes(c.name.toLowerCase())
        );
        if (existingContact) {
          setSelectedContact(existingContact.id);
        } else {
          // Si es un contacto nuevo, usar custom
          setSelectedContact('custom-contact');
        }
      }
      
      if (processedData.suggestedDate) {
        const date = new Date(processedData.suggestedDate);
        setMeetingDate(date.toISOString().split('T')[0]);
      }
      
      if (processedData.suggestedTime) {
        setMeetingTime(processedData.suggestedTime);
      }
      
      if (processedData.meetingType) {
        setMeetingType(processedData.meetingType);
        // Ajustar duración según el tipo
        const type = meetingTypes.find(t => t.id === processedData.meetingType);
        if (type) {
          setDuration(type.duration);
        }
      }
      
      if (processedData.duration) {
        setDuration(processedData.duration);
      }
      
      if (processedData.suggestedAgenda) {
        setAgenda(processedData.suggestedAgenda);
      }
      
      if (processedData.urgency) {
        setUrgency(processedData.urgency);
      }
    }
  }, [processedData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const selectedUrgency = urgencyLevels.find(u => u.id === urgency);
  const selectedMeetingType = meetingTypes.find(t => t.id === meetingType);

  return (
    <div className="space-y-4 text-left">
      {/* Título de la reunión */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <FileText className="w-3 h-3 mr-1.5" /> Meeting Title
        </label>
        <Input 
          placeholder="e.g., Discovery Call - TechCorp Integration"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
        />
        {processedData?.suggestedTitle && (
          <p className="text-xxs text-purple-600 mt-1">✨ Auto-filled from your request</p>
        )}
      </div>

      {/* Contacto */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <User className="w-3 h-3 mr-1.5" /> Contact
        </label>
        <Select value={selectedContact} onValueChange={setSelectedContact}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue placeholder="Select contact..." />
          </SelectTrigger>
          <SelectContent>
            {mockContacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id} className="text-xxs">
                {contact.name} - {contact.role}, {contact.company}
              </SelectItem>
            ))}
            {processedData?.extractedContact && (
              <SelectItem value="custom-contact" className="text-xxs">
                📝 {processedData.extractedContact} (from your request)
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Calendar className="w-3 h-3 mr-1.5" /> Date
          </label>
          <Input 
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
          {meetingDate && (
            <p className="text-xxs text-gray-500 mt-1">{formatDate(meetingDate)}</p>
          )}
        </div>
        
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Clock className="w-3 h-3 mr-1.5" /> Time
          </label>
          <Input 
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Tipo de reunión y duración */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Tag className="w-3 h-3 mr-1.5" /> Meeting Type
          </label>
          <Select value={meetingType} onValueChange={setMeetingType}>
            <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meetingTypes.map((type) => (
                <SelectItem key={type.id} value={type.id} className="text-xxs">
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Clock className="w-3 h-3 mr-1.5" /> Duration (min)
          </label>
          <Input 
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
            min="15"
            max="180"
            step="15"
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Urgencia */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
          <CalendarDays className="w-3 h-3 mr-1.5" /> Priority Level
        </label>
        <div className="flex gap-2">
          {urgencyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setUrgency(level.id)}
              className={`px-3 py-1 rounded-full text-xxs font-medium transition-all ${
                urgency === level.id 
                  ? level.color + ' scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        {selectedUrgency && (
          <p className="text-xxs text-gray-500 mt-1">
            💡 Suggested scheduling within {selectedUrgency.days} days
          </p>
        )}
      </div>

      {/* Agenda */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Users className="w-3 h-3 mr-1.5" /> Meeting Agenda
        </label>
        <Textarea 
          placeholder="Meeting objectives, topics to discuss, desired outcomes..."
          rows={3}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
        />
        {processedData?.suggestedAgenda && (
          <p className="text-xxs text-purple-600 mt-1">✨ Agenda auto-generated from context</p>
        )}
      </div>

      {/* Resumen inteligente */}
      {processedData && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h4 className="text-xs font-medium text-purple-800 mb-2 flex items-center">
            🧠 Smart Analysis Summary
          </h4>
          <div className="space-y-1 text-xxs text-purple-700">
            {selectedMeetingType && (
              <p>• Meeting type: <span className="font-medium">{selectedMeetingType.label}</span></p>
            )}
            {meetingDate && (
              <p>• Scheduled for: <span className="font-medium">{formatDate(meetingDate)} at {meetingTime}</span></p>
            )}
            {processedData.extractedContact && (
              <p>• Participant: <span className="font-medium">{processedData.extractedContact}</span></p>
            )}
            {selectedUrgency && (
              <p>• Priority: <span className="font-medium">{selectedUrgency.label}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};