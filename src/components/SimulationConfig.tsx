import {
  Users,
  Target,
  Brain,
  PlusCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

// --- DATOS SIMULADOS (podrían pasarse como props) ---
const mockLeads = [
  { id: 'participant-1', name: 'María González (CTO, TechCorp)' },
  { id: 'participant-3', name: 'Ana López (VP Sales, ClienteX)' },
  { id: 'participant-7', name: 'Elena Pérez (CEO, StartupABC)' },
];
const simulationGoals = [
    { id: 'discovery', label: 'Llamada de Descubrimiento' },
    { id: 'demo', label: 'Agendar una Demo' },
    { id: 'pricing', label: 'Manejar Objeciones de Precio' },
    { id: 'negotiation', label: 'Negociación y Cierre' },
];

const temperatureLabels = [
    'Entusiasta', 'Muy Receptivo', 'Amigable', 'Positivo', 'Colaborativo', 
    'Neutral', 'Analítico', 'Ocupado', 'Directo', 'Escéptico', 
    'Desafiante', 'Impaciente', 'Difícil', 'Confrontacional', 'Hostil'
];
const predefinedPersonalities = [
    {id: 'data_driven', label: 'Enfocado en Datos'},
    {id: 'relational', label: 'Relacional'},
    {id: 'budget_conscious', label: 'Presupuesto Limitado'},
    {id: 'innovator', label: 'Innovador / Early Adopter'},
];

// --- PROPS DEL COMPONENTE ---
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

// --- SUB-COMPONENTE REUTILIZABLE PARA LOS SLIDERS ---
const PersonalitySlider = ({ label, value, minLabel, maxLabel, onValueChange }: {
    label: string;
    value: number;
    minLabel: string;
    maxLabel: string;
    onValueChange: (value: number) => void;
}) => (
    <div>
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <div className="pt-2">
            <Slider defaultValue={[value]} max={10} step={1} onValueChange={(v) => onValueChange(v[0])} />
        </div>
        <div className="flex justify-between mt-1">
            <span className="text-xxs text-gray-500">{minLabel}</span>
            <span className="text-xxs text-gray-500">{maxLabel}</span>
        </div>
    </div>
);

export function SimulationConfig({ config, setConfig }: SimulationConfigProps) {
  const updateConfig = (key: keyof SimulationConfigProps['config'], value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const togglePersonality = (id: string) => {
    const newPersonalities = config.selectedPersonalities.includes(id)
      ? config.selectedPersonalities.filter(p => p !== id)
      : [...config.selectedPersonalities, id];
    updateConfig('selectedPersonalities', newPersonalities);
  };
  
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-3">
      {/* --- Columna Izquierda: Parámetros Principales --- */}
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Parámetros Principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">Fuente del Lead</label>
            <div className="flex gap-2">
              <Button onClick={() => updateConfig('leadSource', 'existing')} variant={config.leadSource === 'existing' ? 'default' : 'outline'} size="sm" className="w-full"><Users className="w-4 h-4 mr-2"/>Existente</Button>
              <Button onClick={() => updateConfig('leadSource', 'new')} variant={config.leadSource === 'new' ? 'default' : 'outline'} size="sm" className="w-full"><PlusCircle className="w-4 h-4 mr-2"/>Nuevo</Button>
            </div>
          </div>

          {config.leadSource === 'existing' ? (
            <div>
              <label className="text-xs font-medium text-gray-600">Lead a Simular</label>
              <Select onValueChange={(value) => updateConfig('selectedLeadId', value)} value={config.selectedLeadId}><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{mockLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-600">Nombre del Prospecto</label>
              <Input placeholder="Ej: Juan Pérez (CEO, Acme)" value={config.newProspectName} onChange={(e) => updateConfig('newProspectName', e.target.value)}/>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600">Objetivo de la Llamada</label>
            <Select onValueChange={(value) => updateConfig('selectedGoal', value)} value={config.selectedGoal}><SelectTrigger><SelectValue placeholder="Definir objetivo..." /></SelectTrigger><SelectContent>{simulationGoals.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Contexto Inicial</label>
            <Textarea placeholder="Ej: 'Llamada de seguimiento...'" rows={2}/>
          </div>
        </CardContent>
      </Card>

      {/* --- Columna Derecha: Ajuste Fino --- */}
      <Card className="bg-black/5 rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center"><Brain className="w-4 h-4 mr-2 text-purple-600"/>Ajuste Fino de Personalidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Temperatura de la Conversación</label>
            <div className="pt-3">
              <Slider defaultValue={[config.temperature]} max={temperatureLabels.length - 1} step={1} onValueChange={(v) => updateConfig('temperature', v[0])} />
            </div>
            <p className="text-center text-sm font-semibold text-purple-700 mt-1">{temperatureLabels[config.temperature]}</p>
          </div>
          
          <PersonalitySlider 
            label="Ritmo"
            value={config.pace}
            minLabel="Conversador"
            maxLabel="Directo al grano"
            onValueChange={(v) => updateConfig('pace', v)}
          />
          <PersonalitySlider 
            label="Enfoque Principal"
            value={config.focus}
            minLabel="Precio y ROI"
            maxLabel="Calidad y Características"
            onValueChange={(v) => updateConfig('focus', v)}
          />
          <PersonalitySlider 
            label="Nivel Técnico"
            value={config.technicality}
            minLabel="Usuario de Negocio"
            maxLabel="Experto Técnico"
            onValueChange={(v) => updateConfig('technicality', v)}
          />
           <PersonalitySlider 
            label="Toma de Decisiones"
            value={config.riskAversion}
            minLabel="Averso al Riesgo"
            maxLabel="Innovador / Early Adopter"
            onValueChange={(v) => updateConfig('riskAversion', v)}
          />
           <PersonalitySlider 
            label="Formalidad"
            value={config.formality}
            minLabel="Casual e Informal"
            maxLabel="Corporativo y Formal"
            onValueChange={(v) => updateConfig('formality', v)}
          />

          <div>
            <label className="text-xs font-medium text-gray-600">Rasgos Predefinidos</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedPersonalities.map(p => (
                <Badge key={p.id} variant={config.selectedPersonalities.includes(p.id) ? 'default' : 'outline'} onClick={() => togglePersonality(p.id)} className="cursor-pointer">{p.label}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}