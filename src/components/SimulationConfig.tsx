import { useState } from 'react';
import {
  Users,
  Target,
  Brain,
  PlusCircle,
  Sparkles,
  HelpCircle,
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

/* -------- Mock data (unchanged) -------- */
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClientX)' },
  { id: 'participant-7', name: 'Elena Pérez (CEO, StartupABC)' },
];

const simulationGoals = [
  { id: 'discovery', label: 'Discovery Call' },
  { id: 'demo', label: 'Schedule a Demo' },
  { id: 'pricing', label: 'Handle Pricing Objections' },
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
  { id: 'data_driven', label: 'Data-Driven' },
  { id: 'relational', label: 'Relationship-Oriented' },
  { id: 'budget_conscious', label: 'Budget-Conscious' },
  { id: 'innovator', label: 'Innovator / Early Adopter' },
];

/* -------- Component props -------- */
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
    initialContext: string;
  };
  setConfig: (config: SimulationConfigProps['config']) => void;
}

/* -------- Reusable slider sub-component -------- */
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

/* ================= Main component ================ */
export function SimulationConfig({ config, setConfig }: SimulationConfigProps) {
  const updateConfig = (
    key: keyof SimulationConfigProps['config'],
    value: any,
  ) => setConfig({ ...config, [key]: value });

  const togglePersonality = (id: string) => {
    const list = config.selectedPersonalities.includes(id)
      ? config.selectedPersonalities.filter((p) => p !== id)
      : [...config.selectedPersonalities, id];
    updateConfig('selectedPersonalities', list);
  };

  /* ------- “Enrich with AI” button action ------- */
  const handleEnrichAI = () => {
    const leadName = config.selectedLeadId
      ? mockLeads.find((l) => l.id === config.selectedLeadId)?.name
      : 'this prospect';

    const enrichedContext = `AI-generated context for the upcoming call with ${leadName}. In our most recent interaction—an email exchange three days ago—the tone was distinctly positive. ${leadName} highlighted our Innovate Inc. case study as “exactly the ROI story the board needs.” Evaluation hinges on (1) rapid implementation with minimal DevOps effort and (2) measurable ROI within two quarters.

Background research shows ${leadName} is leading a wider digital-efficiency program. Public posts reveal pain points: repetitive manual workflows and poor data visibility. A PoC budget is earmarked for Q3, contingent on a six-month payback and seamless integration with HubSpot and Tableau. Competitors AlphaFlow and SyncWare have longer onboarding timelines—a weakness we can exploit.

**Call objective:** Secure a 30-minute technical demo next week with the buying committee (CTO, VP Sales, RevOps Lead). Be ready to (a) demo a live integration in under five minutes, (b) quantify time saved per rep, and (c) outline a lightweight pilot that meets ROI targets by Q2. Send a tailored ROI calculator and technical checklist immediately after the meeting.`;
    updateConfig('initialContext', enrichedContext);
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-3">
      {/* -------- Left column: main parameters -------- */}
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Main Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lead source */}
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

          {/* Lead selector / Prospect name */}
          {config.leadSource === 'existing' ? (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Lead to Simulate
              </label>
              <Select
                onValueChange={(v) => updateConfig('selectedLeadId', v)}
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

          {/* Call goal */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Call Goal
            </label>
            <Select
              onValueChange={(v) => updateConfig('selectedGoal', v)}
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

          {/* Initial context + AI enrich button */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Initial Context
            </label>
            <Textarea
              placeholder="e.g. 'Follow-up call after webinar…'"
              rows={3}
              value={config.initialContext}
              onChange={(e) => updateConfig('initialContext', e.target.value)}
            />

            <div className="mt-2 flex items-center gap-2">
              {/* Gradient-border button */}
              <div className="flex-grow rounded-lg bg-gradient-to-br from-purple-300 to-blue-200 p-px shadow-sm hover:shadow-md transition-shadow">
                <Button
                  variant="outline"
                  className="w-full h-full bg-transparent"
                  onClick={handleEnrichAI}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Enrich with AI
                </Button>
              </div>

              {/* Help pop-over */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="text-xs text-gray-700 leading-relaxed">
                  The AI agent gathers all available data for the selected
                  lead—emails, previous meetings, and notes—to create a concise,
                  high-value starting context.<br /><br />
                  If the contact is brand-new, it performs a quick web search to
                  surface relevant information automatically.
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------- Right column: fine-tuning -------- */}
      <Card className="bg-black/5 rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            Personality Fine-Tuning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Temperature */}
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

          {/* Personality sliders */}
          <PersonalitySlider
            label="Pace"
            value={config.pace}
            minLabel="Conversational"
            maxLabel="Straight to the Point"
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
            label="Technical Depth"
            value={config.technicality}
            minLabel="Business User"
            maxLabel="Technical Expert"
            onValueChange={(v) => updateConfig('technicality', v)}
          />
          <PersonalitySlider
            label="Decision Style"
            value={config.riskAversion}
            minLabel="Risk-Averse"
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

          {/* Predefined traits */}
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
