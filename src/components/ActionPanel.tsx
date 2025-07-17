import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Zap, 
  Target, 
  Users,
  Phone,
  Presentation
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

// Props interface for the component
interface ActionPanelProps {
  participantId: string | null;
  meetingId: string | null;
}

// --- **CORRECCIÓN DE TYPESCRIPT** ---
// 1. Define a specific type for the category keys. This tells TypeScript
//    exactly which strings are valid for a category.
type CategoryKey = 'preparation' | 'follow_up' | 'analysis' | 'documents' | 'collaboration';

// 2. Define the structure for the category information object.
interface CategoryInfo {
  label: string;
  color: string;
}

// 3. Define the structure for a single action, using our new CategoryKey type.
interface Action {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: CategoryKey;
}

// Array of actions, now correctly typed with the Action interface.
const actions: Action[] = [
  {
    id: 'simulate-demo',
    label: 'Simular Demo',
    description: 'Genera una demo personalizada',
    icon: Presentation,
    color: 'bg-blue-500 hover:bg-blue-600',
    category: 'preparation'
  },
  {
    id: 'conversation-simulator',
    label: 'Simular Conversación',
    description: 'Practica la reunión con IA',
    icon: MessageSquare,
    color: 'bg-green-500 hover:bg-green-600',
    category: 'preparation'
  },
  {
    id: 'email-sequence',
    label: 'Secuencia Email',
    description: 'Genera follow-up automático',
    icon: Mail,
    color: 'bg-purple-500 hover:bg-purple-600',
    category: 'follow-up'
  },
  {
    id: 'schedule-meeting',
    label: 'Agendar Reunión',
    description: 'Programa próxima cita',
    icon: Calendar,
    color: 'bg-orange-500 hover:bg-orange-600',
    category: 'follow-up'
  },
  {
    id: 'kpi-analysis',
    label: 'Análisis KPI',
    description: 'Métricas y probabilidades',
    icon: TrendingUp,
    color: 'bg-red-500 hover:bg-red-600',
    category: 'analysis'
  },
  {
    id: 'generate-proposal',
    label: 'Generar Propuesta',
    description: 'Propuesta personalizada',
    icon: FileText,
    color: 'bg-teal-500 hover:bg-teal-600',
    category: 'documents'
  },
  {
    id: 'objection-handling',
    label: 'Manejo Objeciones',
    description: 'Prepara respuestas',
    icon: Target,
    color: 'bg-pink-500 hover:bg-pink-600',
    category: 'preparation'
  },
  {
    id: 'team-briefing',
    label: 'Brief al Equipo',
    description: 'Comparte insights',
    icon: Users,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    category: 'collaboration'
  },
  {
    id: 'cold-call-script',
    label: 'Script Llamada',
    description: 'Guión personalizado',
    icon: Phone,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    category: 'preparation'
  },
  {
    id: 'competitive-analysis',
    label: 'Análisis Competencia',
    description: 'Posicionamiento vs competidores',
    icon: Zap,
    color: 'bg-gray-500 hover:bg-gray-600',
    category: 'analysis'
  }
];

// 4. Use the `Record` utility type. This creates a strongly-typed object where
//    the keys must be of type `CategoryKey`. This is the core of the fix.
const categories: Record<CategoryKey, CategoryInfo> = {
  preparation: { label: 'Preparación', color: 'bg-blue-100 text-blue-700' },
  follow_up: { label: 'Follow-up', color: 'bg-green-100 text-green-700' },
  analysis: { label: 'Análisis', color: 'bg-purple-100 text-purple-700' },
  documents: { label: 'Documentos', color: 'bg-orange-100 text-orange-700' },
  collaboration: { label: 'Colaboración', color: 'bg-pink-100 text-pink-700' }
};

export function ActionPanel({ participantId, meetingId }: ActionPanelProps) {
  if (!participantId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecciona un participante para ver acciones</p>
      </div>
    );
  }

  const handleAction = (actionId: string) => {
    console.log(`Ejecutando acción: ${actionId} para participante: ${participantId}`);
    // Here you would implement the specific logic for each action
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-600">Acciones AI</h3>
        <Badge variant="outline" className="text-xxs">
          {actions.length} disponibles
        </Badge>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Card key={action.id} className="p-3 hover:shadow-sm transition-shadow">
              <Button
                variant="ghost"
                className="w-full h-auto p-0 justify-start"
                onClick={() => handleAction(action.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg ${action.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm text-gray-800">{action.label}</h4>
                    </div>
                    <p className="text-xxs text-gray-600 mb-2 break-words">{action.description}</p>
                    {/* This part now works without errors because TypeScript knows
                        that `action.category` is a valid key for the `categories` object. */}
                    <Badge 
                      variant="outline" 
                      className={`text-xxs ${categories[action.category]?.color || 'bg-gray-100 text-gray-700'}`}
                    >
                      {categories[action.category]?.label || action.category}
                    </Badge>
                  </div>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm text-purple-800">AI Recommendation</h4>
          </div>
          <p className="text-xxs text-purple-700 mb-3 break-words">
            Basado en el análisis, se recomienda iniciar con una simulación de demo 
            y preparar manejo de objeciones técnicas.
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleAction('simulate-demo')}
            >
              Simular Demo
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAction('objection-handling')}
            >
              Preparar Objeciones
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
