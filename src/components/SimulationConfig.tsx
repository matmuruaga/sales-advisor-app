import {
  Users,
  Target,
  Brain,
  PlusCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

/* --- MOCK DATA (could be passed as props) --- */
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClientX)' },
  { id: 'participant-7', name: 'Elena Pérez (CEO, StartupABC)' },
];
const simulationGoals = [
  { id: 'discovery', label: 'Discovery Call' },
  { id: 'demo', label: 'Schedule a Demo' },
  { id: 'pricing', label: 'Handle Pricing Objections' },
  { id: 'negotiation', label: 'Negotiation & Closing' },
];

const temperatureLabels = [
  'Enthusiastic',
  'Highly Receptive',
  'Friendly',
  'Positive',
  'Collaborative',
  'Neutral',
  'Analytical',
  'Busy',
  'Direct',
  'Skeptical',
  'Challenging',
  'Impatient',
  'Difficult',
  'Confrontational',
  'Hostile',
];
const predefinedPersonalities = [
  { id: 'data_driven', label: 'Data-driven' },
  { id: 'relational', label: 'Relationship-oriented' },
  { id: 'budget_conscious', label: 'Budget-conscious' },
  { id: 'innovator', label: 'Innovator / Early Adopter' },
];

/* --- COMPONENT PROPS --- */
interface SimulationConfigProps {
  config: {
    leadSource: 'existing' | 'new';
    selectedLeadId: string;
    newProspectName: string;
    selectedGoal: string;
    temperature: number;
    selectedPersonalities: string[];
    pace: number;
    focus: number;
    technicality: number;
    riskAversion: number;
    formality: number;
  };
  setConfig: (config: SimulationConfigProps['config']) => void;
}

/* --- REUSABLE SLIDER SUB-COMPONENT --- */
const PersonalitySlider = ({
  label,
  value,
  minLabel,
  maxLabel,
  onValueChange,
}: {
  label: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  onValueChange: (value: number) => void;
}) => (
  <div>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="pt-2">
      <Slider
        defaultValue={[value]}
        max={10}
        step={1}
        onValueChange={(v) => onValueChange(v[0])}
      />
    </div>
    <div className="flex justify-between mt-1">
      <span className="text-xxs text-gray-500">{minLabel}</span>
      <span className="text-xxs text-gray-500">{maxLabel}</span>
    </div>
  </div>
);

export function SimulationConfig({ config, setConfig }: SimulationConfigProps) {
  const updateConfig = (
    key: keyof SimulationConfigProps['config'],
    value: any,
  ) => {
    setConfig({ ...config, [key]: value });
  };

  const togglePersonality = (id: string) => {
    const newPersonalities = config.selectedPersonalities.includes(id)
      ? config.selectedPersonalities.filter((p) => p !== id)
      : [...config.selectedPersonalities, id];
    updateConfig('selectedPersonalities', newPersonalities);
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-3">
      {/* --- Left Column: Main Parameters --- */}
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Main Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lead Source */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              Lead Source
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => updateConfig('leadSource', 'existing')}
                variant={config.leadSource === 'existing' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Existing
              </Button>
              <Button
                onClick={() => updateConfig('leadSource', 'new')}
                variant={config.leadSource === 'new' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>

          {/* Lead or Prospect Name */}
          {config.leadSource === 'existing' ? (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Lead to Simulate
              </label>
              <Select
                onValueChange={(value) => updateConfig('selectedLeadId', value)}
                value={config.selectedLeadId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {mockLeads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Prospect Name
              </label>
              <Input
                placeholder="e.g. John Doe (CEO, Acme)"
                value={config.newProspectName}
                onChange={(e) =>
                  updateConfig('newProspectName', e.target.value)
                }
              />
            </div>
          )}

          {/* Call Goal */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Call Goal
            </label>
            <Select
              onValueChange={(value) => updateConfig('selectedGoal', value)}
              value={config.selectedGoal}
            >
              <SelectTrigger>
                <SelectValue placeholder="Define goal..." />
              </SelectTrigger>
              <SelectContent>
                {simulationGoals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Context */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Initial Context
            </label>
            <Textarea
              placeholder="e.g. 'Follow-up call after demo...'"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- Right Column: Fine Tuning --- */}
      <Card className="bg-black/5 rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            Personality Fine-Tuning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversation Temperature */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Conversation Temperature
            </label>
            <div className="pt-3">
              <Slider
                defaultValue={[config.temperature]}
                max={temperatureLabels.length - 1}
                step={1}
                onValueChange={(v) => updateConfig('temperature', v[0])}
              />
            </div>
            <p className="text-center text-sm font-semibold text-purple-700 mt-1">
              {temperatureLabels[config.temperature]}
            </p>
          </div>

          {/* Personality Sliders */}
          <PersonalitySlider
            label="Pace"
            value={config.pace}
            minLabel="Conversational"
            maxLabel="Straight to the point"
            onValueChange={(v) => updateConfig('pace', v)}
          />
          <PersonalitySlider
            label="Primary Focus"
            value={config.focus}
            minLabel="Price & ROI"
            maxLabel="Quality & Features"
            onValueChange={(v) => updateConfig('focus', v)}
          />
          <PersonalitySlider
            label="Technical Level"
            value={config.technicality}
            minLabel="Business User"
            maxLabel="Technical Expert"
            onValueChange={(v) => updateConfig('technicality', v)}
          />
          <PersonalitySlider
            label="Decision Making"
            value={config.riskAversion}
            minLabel="Risk-averse"
            maxLabel="Innovator / Early Adopter"
            onValueChange={(v) => updateConfig('riskAversion', v)}
          />
          <PersonalitySlider
            label="Formality"
            value={config.formality}
            minLabel="Casual & Informal"
            maxLabel="Corporate & Formal"
            onValueChange={(v) => updateConfig('formality', v)}
          />

          {/* Predefined Traits */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Predefined Traits
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedPersonalities.map((p) => (
                <Badge
                  key={p.id}
                  variant={
                    config.selectedPersonalities.includes(p.id)
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => togglePersonality(p.id)}
                  className="cursor-pointer"
                >
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
