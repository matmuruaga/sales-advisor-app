"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Target, Milestone, DollarSign, ClipboardList, TrendingUp } from "lucide-react";

// Datos simulados
const mockOpportunities = [
  { id: 'opp-1', name: 'TechCorp - Q3 Integration' },
  { id: 'opp-2', name: 'ClientX - Enterprise Expansion' },
];

const salesStages = [
  { id: 'qualification', label: 'Qualification' },
  { id: 'proposal', label: 'Proposal Sent' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed-won', label: 'Closed-Won' },
  { id: 'closed-lost', label: 'Closed-Lost' },
];

export const UpdateCrmOpportunityForm = () => {
    const [confidence, setConfidence] = useState(65);

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Target className="w-3 h-3 mr-1.5" /> Target Opportunity
        </label>
        <Select defaultValue="opp-1">
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockOpportunities.map((opp) => (
              <SelectItem key={opp.id} value={opp.id} className="text-xxs">{opp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
                    <Milestone className="w-3 h-3 mr-1.5" /> New Stage
                </label>
                <Select defaultValue="proposal">
                <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {salesStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id} className="text-xxs">{stage.label}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
                    <DollarSign className="w-3 h-3 mr-1.5" /> Deal Value ($)
                </label>
                <Input type="number" defaultValue="50000" className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            </div>
      </div>

       <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <TrendingUp className="w-3 h-3 mr-1.5" /> Confidence Level
        </label>
        <div className="pt-2">
            <Slider
                defaultValue={[confidence]}
                max={100}
                step={5}
                onValueChange={(value) => setConfidence(value[0])}
            />
        </div>
        <p className="text-center text-xs font-semibold text-purple-700 mt-2">
            {confidence}%
        </p>
      </div>

       <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <ClipboardList className="w-3 h-3 mr-1.5" /> Log Next Steps
        </label>
        <Textarea placeholder="e.g., Send proposal by EOD. Follow up next Tuesday..." rows={3} className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"/>
      </div>
    </div>
  );
};