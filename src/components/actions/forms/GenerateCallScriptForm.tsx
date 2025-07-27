// src/app/actions/forms/GenerateCallScriptForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Target, User, Briefcase, DollarSign, Clock, MessageSquare, Plus, X, Lightbulb } from "lucide-react";

const callObjectives = [
  { id: 'discovery', label: 'Discovery & Qualification', description: 'Understand needs and pain points' },
  { id: 'demo', label: 'Product Demonstration', description: 'Showcase solution capabilities' },
  { id: 'pricing', label: 'Pricing Discussion', description: 'Present pricing and handle objections' },
  { id: 'negotiation', label: 'Negotiation & Closing', description: 'Finalize terms and close the deal' },
  { id: 'follow-up', label: 'Follow-up Call', description: 'Continue previous conversation' },
];

const prospectTypes = [
  { id: 'cold', label: 'Cold Prospect', description: 'First contact, no prior relationship' },
  { id: 'warm', label: 'Warm Lead', description: 'Some prior interaction or referral' },
  { id: 'existing', label: 'Existing Contact', description: 'Previous conversations or meetings' },
  { id: 'inbound', label: 'Inbound Lead', description: 'They reached out to us first' },
];

const industryContexts = [
  'Technology/Software', 'Financial Services', 'Healthcare', 'Manufacturing', 
  'Retail/E-commerce', 'Education', 'Real Estate', 'Consulting', 'Other'
];

const commonCompetitors = [
  'Salesforce', 'HubSpot', 'Microsoft', 'Zoom', 'Slack', 'Gong', 'Outreach', 'Other'
];

interface GenerateCallScriptFormProps {
  processedData?: any;
}

export const GenerateCallScriptForm = ({ processedData }: GenerateCallScriptFormProps) => {
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [callObjective, setCallObjective] = useState('discovery');
  const [prospectType, setProspectType] = useState('warm');
  const [industry, setIndustry] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [currentPainPoint, setCurrentPainPoint] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [competitorMentioned, setCompetitorMentioned] = useState('');
  const [previousContext, setPreviousContext] = useState('');
  const [specificGoals, setSpecificGoals] = useState('');

  // Auto-llenar campos cuando llega processedData
  useEffect(() => {
    if (processedData) {
      console.log('📞 Datos de call script procesados:', processedData);
      
      if (processedData.extractedContact) {
        setContactName(processedData.extractedContact);
      }
      
      if (processedData.companyName) {
        setCompanyName(processedData.companyName);
      }
      
      if (processedData.callGoal) {
        setCallObjective(processedData.callGoal);
      }
      
      if (processedData.identifiedPainPoints && processedData.identifiedPainPoints.length > 0) {
        setPainPoints(processedData.identifiedPainPoints);
      }
      
      if (processedData.budget) {
        setBudget(processedData.budget);
      }
      
      if (processedData.timeline) {
        setTimeline(processedData.timeline);
      }
      
      if (processedData.competitorMentioned) {
        setCompetitorMentioned(processedData.competitorMentioned);
      }
      
      if (processedData.topic) {
        setSpecificGoals(processedData.topic);
      }
      
      // Determinar tipo de prospecto basado en contexto
      if (processedData.suggestedOpener) {
        if (processedData.suggestedOpener.includes('noticed') || processedData.suggestedOpener.includes('saw')) {
          setProspectType('warm');
        }
      }
      
      // Establecer contexto previo si hay información
      if (processedData.extractedContact && processedData.companyName) {
        setPreviousContext(`Previous research indicates interest in ${processedData.topic || 'business optimization solutions'}.`);
      }
    }
  }, [processedData]);

  const addPainPoint = () => {
    if (currentPainPoint.trim() && !painPoints.includes(currentPainPoint.trim())) {
      setPainPoints([...painPoints, currentPainPoint.trim()]);
      setCurrentPainPoint('');
    }
  };

  const removePainPoint = (index: number) => {
    setPainPoints(painPoints.filter((_, i) => i !== index));
  };

  const selectedObjective = callObjectives.find(obj => obj.id === callObjective);
  const selectedProspectType = prospectTypes.find(type => type.id === prospectType);

  return (
    <div className="space-y-4 text-left">
      {/* Análisis inteligente */}
      {processedData && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <h4 className="text-xs font-medium text-blue-800 mb-2 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1.5" />
            Smart Call Analysis
          </h4>
          <div className="space-y-1 text-xxs text-blue-700">
            {processedData.extractedContact && (
              <p>• Contact identified: <span className="font-medium">{processedData.extractedContact}</span></p>
            )}
            {processedData.callGoal && (
              <p>• Call objective: <span className="font-medium">{processedData.callGoal}</span></p>
            )}
            {processedData.identifiedPainPoints && processedData.identifiedPainPoints.length > 0 && (
              <p>• Pain points detected: <span className="font-medium">{processedData.identifiedPainPoints.join(', ')}</span></p>
            )}
            {processedData.suggestedOpener && (
              <p>• Opener suggested: <span className="font-medium">"{processedData.suggestedOpener.substring(0, 60)}..."</span></p>
            )}
          </div>
        </div>
      )}

      {/* Información básica del contacto */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <User className="w-3 h-3 mr-1.5" /> Contact Name
          </label>
          <Input 
            placeholder="e.g., María González"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
          {processedData?.extractedContact && (
            <p className="text-xxs text-purple-600 mt-1">✨ Auto-extracted from your request</p>
          )}
        </div>
        
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Briefcase className="w-3 h-3 mr-1.5" /> Company
          </label>
          <Input 
            placeholder="e.g., TechCorp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Objetivo de la llamada */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Target className="w-3 h-3 mr-1.5" /> Call Objective
        </label>
        <Select value={callObjective} onValueChange={setCallObjective}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {callObjectives.map((objective) => (
              <SelectItem key={objective.id} value={objective.id} className="text-xxs">
                <div>
                  <div className="font-medium">{objective.label}</div>
                  <div className="text-gray-500">{objective.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedObjective && (
          <p className="text-xxs text-gray-500 mt-1">{selectedObjective.description}</p>
        )}
      </div>

      {/* Tipo de prospecto */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Phone className="w-3 h-3 mr-1.5" /> Prospect Type
        </label>
        <Select value={prospectType} onValueChange={setProspectType}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prospectTypes.map((type) => (
              <SelectItem key={type.id} value={type.id} className="text-xxs">
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-gray-500">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Industry */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Briefcase className="w-3 h-3 mr-1.5" /> Industry
        </label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue placeholder="Select industry..." />
          </SelectTrigger>
          <SelectContent>
            {industryContexts.map((ind) => (
              <SelectItem key={ind} value={ind} className="text-xxs">{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pain Points */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Target className="w-3 h-3 mr-1.5" /> Known Pain Points
        </label>
        <div className="flex gap-2 mb-2">
          <Input 
            placeholder="Add a pain point..."
            value={currentPainPoint}
            onChange={(e) => setCurrentPainPoint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
            className="text-xxs flex-1 focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={addPainPoint}
            disabled={!currentPainPoint.trim()}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {painPoints.map((painPoint, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xxs pr-1 cursor-pointer hover:bg-red-100"
              onClick={() => removePainPoint(index)}
            >
              {painPoint}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
        {processedData?.identifiedPainPoints && processedData.identifiedPainPoints.length > 0 && (
          <p className="text-xxs text-purple-600 mt-1">✨ Pain points auto-detected from context</p>
        )}
      </div>

      {/* Budget y Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <DollarSign className="w-3 h-3 mr-1.5" /> Budget (if known)
          </label>
          <Input 
            placeholder="e.g., $50K-100K annually"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
        </div>
        
        <div>
          <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
            <Clock className="w-3 h-3 mr-1.5" /> Timeline
          </label>
          <Input 
            placeholder="e.g., Next quarter"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Competidor mencionado */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Target className="w-3 h-3 mr-1.5" /> Competitor (if mentioned)
        </label>
        <Select value={competitorMentioned} onValueChange={setCompetitorMentioned}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue placeholder="Select or mention competitor..." />
          </SelectTrigger>
          <SelectContent>
            {commonCompetitors.map((comp) => (
              <SelectItem key={comp} value={comp} className="text-xxs">{comp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {processedData?.competitorMentioned && (
          <p className="text-xxs text-purple-600 mt-1">✨ Competitor mentioned in your request</p>
        )}
      </div>

      {/* Contexto previo */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <MessageSquare className="w-3 h-3 mr-1.5" /> Previous Context / Notes
        </label>
        <Textarea 
          placeholder="Previous interactions, research findings, mutual connections..."
          rows={3}
          value={previousContext}
          onChange={(e) => setPreviousContext(e.target.value)}
          className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
        />
      </div>

      {/* Objetivos específicos */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Target className="w-3 h-3 mr-1.5" /> Specific Goals for This Call
        </label>
        <Textarea 
          placeholder="What specifically do you want to achieve in this conversation?"
          rows={2}
          value={specificGoals}
          onChange={(e) => setSpecificGoals(e.target.value)}
          className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
        />
      </div>

      {/* Resumen del script */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border">
        <h4 className="text-xs font-medium text-gray-800 mb-2">📋 Script Configuration Summary</h4>
        <div className="space-y-1 text-xxs text-gray-700">
          <p>• <span className="font-medium">Objective:</span> {selectedObjective?.label}</p>
          <p>• <span className="font-medium">Prospect:</span> {selectedProspectType?.label}</p>
          {contactName && <p>• <span className="font-medium">Contact:</span> {contactName}{companyName && ` at ${companyName}`}</p>}
          {painPoints.length > 0 && <p>• <span className="font-medium">Pain Points:</span> {painPoints.join(', ')}</p>}
          {budget && <p>• <span className="font-medium">Budget:</span> {budget}</p>}
          {timeline && <p>• <span className="font-medium">Timeline:</span> {timeline}</p>}
        </div>
      </div>
    </div>
  );
};