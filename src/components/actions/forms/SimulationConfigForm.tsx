// src/app/actions/forms/SimulationConfigForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Users, Target, Brain, TrendingUp, Zap } from "lucide-react";

// Datos simulados para el formulario
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClientX)' },
  { id: 'participant-7', name: 'Elena Pérez (CEO, StartupABC)' },
];

const simulationGoals = [
  { id: 'discovery', label: 'Discovery Call', description: 'Uncover needs and pain points' },
  { id: 'demo', label: 'Product Demo', description: 'Showcase solution capabilities' },
  { id: 'pricing', label: 'Handle Pricing Objections', description: 'Navigate cost concerns' },
  { id: 'negotiation', label: 'Negotiation & Closing', description: 'Finalize terms and close deal' },
];

const temperatureLabels = [
  'Enthusiastic', 'Highly Receptive', 'Friendly', 'Positive', 'Collaborative',
  'Neutral', 'Analytical', 'Busy', 'Direct', 'Skeptical', 'Challenging', 
  'Impatient', 'Difficult', 'Confrontational', 'Hostile'
];

const predefinedPersonalities = [
  { id: 'data_driven', label: 'Data-Driven', description: 'Needs metrics and ROI' },
  { id: 'relational', label: 'Relationship-Oriented', description: 'Values trust and rapport' },
  { id: 'budget_conscious', label: 'Budget-Conscious', description: 'Focused on cost-effectiveness' },
  { id: 'innovator', label: 'Innovator / Early Adopter', description: 'Excited by new technology' },
  { id: 'skeptical', label: 'Skeptical', description: 'Questions everything' },
];

const difficultyLevels = [
  { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800', description: 'Friendly and receptive' },
  { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', description: 'Professional but challenging' },
  { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800', description: 'Highly demanding and critical' },
];

interface SimulationConfigFormProps {
  processedData?: any;
}

export const SimulationConfigForm = ({ processedData }: SimulationConfigFormProps) => {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('discovery');
  const [temperature, setTemperature] = useState(7); // Skeptical por defecto
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [customProfile, setCustomProfile] = useState('');

  // Auto-llenar campos cuando llega processedData
  useEffect(() => {
    if (processedData) {
      console.log('🤖 Datos de simulación procesados:', processedData);
      
      // Configurar perfil objetivo
      if (processedData.targetProfile) {
        setCustomProfile(processedData.targetProfile);
        setSelectedLeadId('custom-profile');
      } else if (processedData.contactName) {
        // Buscar si el contacto existe en la lista
        const existingContact = mockLeads.find(l => 
          l.name.toLowerCase().includes(processedData.contactName.toLowerCase())
        );
        if (existingContact) {
          setSelectedLeadId(existingContact.id);
        } else {
          setCustomProfile(`${processedData.contactName}${processedData.companyName ? ` (${processedData.companyName})` : ''}`);
          setSelectedLeadId('custom-profile');
        }
      }
      
      // Configurar objetivo de simulación
      if (processedData.scenario) {
        setSelectedGoal(processedData.scenario);
      }
      
      // Configurar dificultad
      if (processedData.difficulty) {
        setDifficulty(processedData.difficulty);
      }
      
      // Configurar temperatura emocional
      if (processedData.emotionalTemperature !== undefined) {
        setTemperature(processedData.emotionalTemperature);
      }
      
      // Configurar traits de personalidad
      if (processedData.personalityTraits && processedData.personalityTraits.length > 0) {
        // Mapear los traits del analizador a los IDs del formulario
        const mappedTraits = processedData.personalityTraits.map((trait: string) => {
          switch (trait) {
            case 'data-driven': return 'data_driven';
            case 'budget-conscious': return 'budget_conscious';
            case 'relationship-oriented': return 'relational';
            case 'innovative': return 'innovator';
            case 'skeptical': return 'skeptical';
            default: return trait.replace('-', '_');
          }
        });
        setSelectedPersonalities(mappedTraits);
      }
      
      // Configurar contexto
      if (processedData.context) {
        setContext(processedData.context);
      }
    }
  }, [processedData]);

  const togglePersonality = (id: string) => {
    setSelectedPersonalities(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  const selectedDifficulty = difficultyLevels.find(d => d.id === difficulty);
  const selectedScenario = simulationGoals.find(g => g.id === selectedGoal);

  return (
    <div className="space-y-4 text-left">
      {/* Análisis inteligente */}
      {processedData && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-4">
          <h4 className="text-xs font-medium text-purple-800 mb-2 flex items-center">
            <Zap className="w-3 h-3 mr-1.5" />
            Smart Analysis Results
          </h4>
          <div className="space-y-1 text-xxs text-purple-700">
            {processedData.targetProfile && (
              <p>• Target profile: <span className="font-medium">{processedData.targetProfile}</span></p>
            )}
            {processedData.scenario && (
              <p>• Scenario detected: <span className="font-medium">{processedData.scenario}</span></p>
            )}
            {processedData.difficulty && (
              <p>• Suggested difficulty: <span className="font-medium">{processedData.difficulty}</span></p>
            )}
            {processedData.personalityTraits && (
              <p>• Personality traits: <span className="font-medium">{processedData.personalityTraits.join(', ')}</span></p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Users className="w-3 h-3 mr-1.5" /> Target Contact/Profile
        </label>
        <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue placeholder="Select a contact or profile..." />
          </SelectTrigger>
          <SelectContent>
            {mockLeads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id} className="text-xxs">{lead.name}</SelectItem>
            ))}
            <SelectItem value="custom-profile" className="text-xxs">
              {customProfile ? `📝 ${customProfile}` : 'Custom Profile'}
            </SelectItem>
          </SelectContent>
        </Select>
        {processedData?.targetProfile && (
          <p className="text-xxs text-purple-600 mt-1">✨ Profile auto-detected from your request</p>
        )}
      </div>
      
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-1">
          <Target className="w-3 h-3 mr-1.5" /> Simulation Goal
        </label>
        <Select value={selectedGoal} onValueChange={setSelectedGoal}>
          <SelectTrigger className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {simulationGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id} className="text-xxs">
                <div>
                  <div className="font-medium">{goal.label}</div>
                  <div className="text-gray-500">{goal.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedScenario && (
          <p className="text-xxs text-gray-500 mt-1">{selectedScenario.description}</p>
        )}
      </div>

      {/* Nivel de dificultad */}
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
          <TrendingUp className="w-3 h-3 mr-1.5" /> Difficulty Level
        </label>
        <div className="flex gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id)}
              className={`px-3 py-2 rounded-lg text-xxs font-medium transition-all ${
                difficulty === level.id 
                  ? level.color + ' scale-105 ring-2 ring-offset-1' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-xxs opacity-75">{level.description}</div>
            </button>
          ))}
        </div>
        {processedData?.difficulty && (
          <p className="text-xxs text-purple-600 mt-1">✨ Difficulty auto-selected based on context</p>
        )}
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
          <TrendingUp className="w-3 h-3 mr-1.5" /> Emotional Temperature
        </label>
        <div className="pt-2">
          <Slider
            value={[temperature]}
            max={temperatureLabels.length - 1}
            step={1}
            onValueChange={(value) => setTemperature(value[0])}
            className="mb-2"
          />
        </div>
        <p className="text-center text-xs font-semibold text-purple-700 mb-1">
          {temperatureLabels[temperature]}
        </p>
        <p className="text-center text-xxs text-gray-500">
          {temperature < 5 ? '😊 Friendly & Receptive' : 
           temperature < 10 ? '😐 Professional & Analytical' : 
           '😤 Challenging & Skeptical'}
        </p>
        {processedData?.emotionalTemperature !== undefined && (
          <p className="text-xxs text-purple-600 mt-1 text-center">✨ Temperature set based on your description</p>
        )}
      </div>
      
      <div>
        <label className="text-xxs font-medium text-gray-600 flex items-center mb-2">
          <Brain className="w-3 h-3 mr-1.5" /> Personality Traits
        </label>
        <div className="grid grid-cols-2 gap-2">
          {predefinedPersonalities.map(personality => {
            const isSelected = selectedPersonalities.includes(personality.id);
            return (
              <div
                key={personality.id}
                onClick={() => togglePersonality(personality.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-purple-100 border-purple-300 text-purple-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="text-xxs font-medium">{personality.label}</div>
                <div className="text-xxs opacity-75">{personality.description}</div>
              </div>
            );
          })}
        </div>
        {processedData?.personalityTraits && processedData.personalityTraits.length > 0 && (
          <p className="text-xxs text-purple-600 mt-2">✨ Personality traits detected from your request</p>
        )}
      </div>

      <div>
        <label className="text-xxs font-medium text-gray-600 mb-1">
          Additional Context & Scenario Details
        </label>
        <Textarea 
          placeholder="e.g., Previous meeting notes, specific challenges to focus on, industry context..."
          rows={3} 
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="text-xxs focus:ring-1 focus:ring-offset-0 focus:ring-purple-400"
        />
        {processedData?.context && (
          <p className="text-xxs text-purple-600 mt-1">✨ Context auto-generated from your request</p>
        )}
      </div>

      {/* Resumen de configuración */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border">
        <h4 className="text-xs font-medium text-gray-800 mb-2">🎭 Simulation Preview</h4>
        <div className="space-y-1 text-xxs text-gray-700">
          <p>• <span className="font-medium">Scenario:</span> {selectedScenario?.label}</p>
          <p>• <span className="font-medium">Difficulty:</span> {selectedDifficulty?.label}</p>
          <p>• <span className="font-medium">AI Personality:</span> {temperatureLabels[temperature]}</p>
          <p>• <span className="font-medium">Traits:</span> {
            selectedPersonalities.length > 0 
              ? selectedPersonalities.map(id => predefinedPersonalities.find(p => p.id === id)?.label).join(', ')
              : 'None selected'
          }</p>
        </div>
      </div>
    </div>
  );
};