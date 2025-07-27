"use client";

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Users, ListChecks, Send } from "lucide-react";

// Datos simulados para el formulario
const mockUpcomingMeetings = [
  { id: 'meeting-1', name: 'Product Demo – TechCorp' },
  { id: 'meeting-3', name: 'Weekly Sales Review' },
];

const mockTeamMembers = [
    { id: 'user-1', name: 'Jessica Smith (Sales)' },
    { id: 'user-2', name: 'Mark Evans (Sales Engineer)' },
    { id: 'user-3', name: 'Alan Wake (Manager)' },
];

const briefingSections = [
    { id: 'profiles', label: 'Participant Profiles & History' },
    { id: 'talking-points', label: 'AI-Generated Talking Points' },
    { id: 'objectives', label: 'Key Meeting Objectives' },
    { id: 'objections', label: 'Potential Objections & Responses' },
];

export const GenerateTeamBriefingForm = () => {
    const [selectedSections, setSelectedSections] = useState<string[]>(['profiles', 'objectives']);

    const toggleSection = (sectionId: string) => {
        setSelectedSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(s => s !== sectionId) 
                : [...prev, sectionId]
        );
    };
  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Calendar className="w-3 h-3 mr-1.5" /> Upcoming Meeting
        </label>
        <Select defaultValue="meeting-1">
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockUpcomingMeetings.map((meeting) => (
              <SelectItem key={meeting.id} value={meeting.id} className="text-xxs">{meeting.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <Users className="w-3 h-3 mr-1.5" /> Team Members to Brief
        </label>
         <div className="space-y-3">
            {mockTeamMembers.map(member => (
                 <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox id={member.id} defaultChecked={member.role !== 'Manager'} className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
                    <label htmlFor={member.id} className="text-xxs font-light text-gray-700">{member.name}</label>
                </div>
            ))}
        </div>
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <ListChecks className="w-3 h-3 mr-1.5" /> Sections to Include
        </label>
        <div className="space-y-3">
            {briefingSections.map(section => (
                 <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox 
                        id={section.id} 
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                        className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" 
                    />
                    <label htmlFor={section.id} className="text-xxs font-light text-gray-700">{section.label}</label>
                </div>
            ))}
        </div>
      </div>
      
       <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <Send className="w-3 h-3 mr-1.5" /> Delivery Method
        </label>
        <RadioGroup defaultValue="slack" className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="slack" id="slack" />
                <label htmlFor="slack" className="text-xxs font-light">Post to Slack Channel</label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <label htmlFor="email" className="text-xxs font-light">Send via Email</label>
            </div>
        </RadioGroup>
      </div>
    </div>
  );
};