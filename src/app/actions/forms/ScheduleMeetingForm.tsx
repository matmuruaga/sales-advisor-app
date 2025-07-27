// src/components/actions/forms/ScheduleMeetingForm.tsx
"use client";

import { useState } from 'react';
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AiButton } from '@/components/common/AiButton';
import { Users, Calendar as CalendarIcon, Clock } from "lucide-react";

// Datos simulados para el formulario
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClientX)' },
];

const meetingTypes = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'demo', label: 'Product Demo' },
  { id: 'proposal-review', label: 'Proposal Review' },
];

const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export const ScheduleMeetingForm = () => {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSuggestTitle = () => setTitle('TechCorp & SalesAI Sync');
  const handleEnrichAgenda = () => setAgenda(`Objective: Discuss TechCorp's current challenges and demonstrate how SalesAI can increase team productivity by 30%.\n\nKey Points:\n1. 5-minute live demo of the integration.\n2. Review of the "Innovate Inc." case study.`);

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1"><Users className="w-3 h-3 mr-1.5" /> Target Contact</label>
        <Select>
            <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
                <SelectValue placeholder="Select a contact..." />
            </SelectTrigger>
            {/* --- CÓDIGO RESTAURADO AQUÍ --- */}
            <SelectContent>
                {mockLeads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id} className="text-xxs">
                    {lead.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 mb-1">Meeting Title</label>
        <div className="flex items-center space-x-2">
          <Input placeholder="e.g., Follow-up about..." value={title} onChange={(e) => setTitle(e.target.value)} className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
          <AiButton size="sm" onClick={handleSuggestTitle}>Suggest</AiButton>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1"><CalendarIcon className="w-3 h-3 mr-1.5" /> Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1"><Clock className="w-3 h-3 mr-1.5" /> Time</label>
          <Select defaultValue="10:00">
            <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
                <SelectValue />
            </SelectTrigger>
            {/* --- CÓDIGO RESTAURADO AQUÍ --- */}
            <SelectContent>
                {timeSlots.map(time => (
                    <SelectItem key={time} value={time} className="text-xxs">
                        {time}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
       <div>
         <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">AI Suggested Times</label>
         <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="cursor-pointer text-xxs">Today, 3:00 PM</Badge>
            <Badge variant="outline" className="cursor-pointer text-xxs">Tomorrow, 10:30 AM</Badge>
            <Badge variant="outline" className="cursor-pointer text-xxs">July 29, 11:00 AM</Badge>
         </div>
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 mb-1">Context / Agenda</label>
        <Textarea placeholder="AI will use this context..." rows={3} value={agenda} onChange={(e) => setAgenda(e.target.value)} className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"/>
        <div className="mt-2 flex justify-end">
            <AiButton size="sm" onClick={handleEnrichAgenda}>Enrich with AI</AiButton>
        </div>
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 mb-2">Smart Options</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="briefing" className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            <label htmlFor="briefing" className="text-xxs font-light text-gray-700">Include AI briefing for internal attendees</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="followup" defaultChecked className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            <label htmlFor="followup" className="text-xxs font-light text-gray-700 leading-none">Activate automated follow-up</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="recording" className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            <label htmlFor="recording" className="text-xxs font-light text-gray-700 leading-none">Automatically record this meeting</label>
          </div>
        </div>
      </div>
    </div>
  );
};