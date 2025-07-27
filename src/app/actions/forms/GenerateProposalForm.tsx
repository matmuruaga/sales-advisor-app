"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, FileText, DollarSign, CheckSquare, PenSquare } from "lucide-react";

// Datos simulados para el formulario
const mockOpportunities = [
  { id: 'opp-1', name: 'TechCorp - Q3 Integration' },
  { id: 'opp-2', name: 'ClientX - Enterprise Expansion' },
];

const proposalTemplates = [
  { id: 'standard', label: 'Standard Template' },
  { id: 'enterprise', label: 'Enterprise Template' },
  { id: 'poc', label: 'Proof of Concept (PoC) Agreement' },
];

const valuePropositions = [
    { id: 'roi', label: 'Emphasize fast ROI' },
    { id: 'integration', label: 'Highlight seamless integration' },
    { id: 'security', label: 'Focus on enterprise-grade security' },
];

export const GenerateProposalForm = () => {
  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Target className="w-3 h-3 mr-1.5" /> Target Opportunity
        </label>
        <Select>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue placeholder="Select an opportunity..." />
          </SelectTrigger>
          <SelectContent>
            {mockOpportunities.map((opp) => (
              <SelectItem key={opp.id} value={opp.id} className="text-xxs">{opp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <FileText className="w-3 h-3 mr-1.5" /> Proposal Template
        </label>
        <Select defaultValue="standard">
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
              <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {proposalTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id} className="text-xxs">{template.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

       <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
                    <DollarSign className="w-3 h-3 mr-1.5" /> Deal Value ($)
                </label>
                <Input type="number" placeholder="e.g., 50000" className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            </div>
            <div>
                <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
                    Term (Months)
                </label>
                <Input type="number" placeholder="e.g., 12" className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
            </div>
        </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
            <CheckSquare className="w-3 h-3 mr-1.5" /> Key Value Propositions
        </label>
        <div className="space-y-3">
            {valuePropositions.map(prop => (
                 <div key={prop.id} className="flex items-center space-x-2">
                    <Checkbox id={prop.id} className="focus:ring-1 focus:ring-offset-0 focus:ring-purple-400" />
                    <label htmlFor={prop.id} className="text-xxs font-light text-gray-700">{prop.label}</label>
                </div>
            ))}
        </div>
      </div>
       <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <PenSquare className="w-3 h-3 mr-1.5" /> Custom Notes for AI
        </label>
        <Textarea placeholder="e.g., Add a special discount for the first 3 months..." rows={2} className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"/>
      </div>
    </div>
  );
};