"use client";

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Target, MessageCircleWarning } from "lucide-react";

// Datos simulados para el formulario
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClientX)' },
];

const callGoals = [
  { id: 'discovery', label: 'Discovery & Qualification' },
  { id: 'objection-handling', label: 'Handle Pricing Objections' },
  { id: 'closing', label: 'Closing Call' },
];

const allPainPoints = [
    { id: 'costs', label: 'High Operational Costs' },
    { id: 'onboarding', label: 'Slow Onboarding Process' },
    { id: 'data-visibility', label: 'Poor Data Visibility' },
    { id: 'integration', label: 'Complex Integrations' },
    { id: 'competitor', label: 'Currently using a Competitor' },
];

export const GenerateCallScriptForm = () => {
    const [selectedPains, setSelectedPains] = useState<string[]>(['costs']);

    const togglePainPoint = (painId: string) => {
        setSelectedPains(prev => 
            prev.includes(painId) 
                ? prev.filter(p => p !== painId) 
                : [...prev, painId]
        );
    };

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Users className="w-3 h-3 mr-1.5" /> Target Contact
        </label>
        <Select>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue placeholder="Select a contact..." />
          </SelectTrigger>
          <SelectContent>
            {mockLeads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id} className="text-xxs">{lead.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Target className="w-3 h-3 mr-1.5" /> Call Goal
        </label>
        <Select defaultValue="discovery">
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {callGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id} className="text-xxs">{goal.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <MessageCircleWarning className="w-3 h-3 mr-1.5" /> Key Pain Points to Address
        </label>
        <div className="flex flex-wrap gap-2">
            {allPainPoints.map(pain => {
                const isSelected = selectedPains.includes(pain.id);
                return (
                    <Badge
                        key={pain.id}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => togglePainPoint(pain.id)}
                        className="cursor-pointer"
                    >
                        {pain.label}
                    </Badge>
                );
            })}
        </div>
      </div>
    </div>
  );
};