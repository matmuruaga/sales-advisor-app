import { BarChart2, CheckCircle, Mail, Target, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MeetingInfoPanelProps {
  meetingId: string | null;
}

// --- DATOS SIMULADOS ENRIQUECIDOS PARA INVERSORES ---
const mockMeetingDetails = {
  'meeting-1': {
    summary: 'Reunión de demo con María González (CTO), una líder técnica pragmática y centrada en el ROI. El objetivo es demostrar cómo nuestra solución se integra sin fricciones en su stack actual y acelera la productividad de su equipo, abordando su escepticismo hacia herramientas complejas.',
    objectives: [
      'Demostrar la integración con APIs REST en menos de 5 minutos.',
      'Presentar el caso de estudio de "Innovate Inc." como prueba social de ROI.',
      'Validar a María como la "decision-maker" técnica principal.',
      'Asegurar un Proof of Concept (PoC) como próximo paso claro.',
    ],
    emailAnalysis: {
      sentiment: 'Positivo',
      sentimentScore: 82,
      keywords: ['integración', 'productividad', 'API', 'seguridad', 'ROI'],
      summary: 'Los intercambios de correo muestran un alto interés en la eficiencia y la seguridad. María (CTO) ha sido muy receptiva y ha hecho preguntas técnicas específicas, indicando una evaluación seria de la solución.',
    },
    followUp: 'Preparar una propuesta de PoC detallada y enviarla antes del EOD del viernes. Hacer seguimiento el próximo martes si no hay respuesta.'
  },
  'meeting-2': {
    summary: 'Revisión de la propuesta comercial enviada a ClienteX. Se discutirán los términos, el alcance del proyecto y los próximos pasos para el cierre del acuerdo.',
    objectives: [
        'Aclarar dudas sobre la propuesta.',
        'Negociar términos de licenciamiento.',
        'Obtener un compromiso verbal para el cierre.',
    ],
    emailAnalysis: {
      sentiment: 'Neutral',
      sentimentScore: 65,
      keywords: ['propuesta', 'costes', 'timeline', 'acuerdo'],
      summary: 'Ana (VP Sales) ha confirmado la recepción y ha agendado la reunión para discutir detalles. El tono es profesional y directo, centrado en la logística del acuerdo.',
    },
    followUp: 'Enviar un resumen de los puntos acordados inmediatamente después de la reunión.'
  },
};

export function MeetingInfoPanel({ meetingId }: MeetingInfoPanelProps) {
  // El resto del código del componente permanece igual...
  if (!meetingId || !mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails]) {
    return (
      <div className="text-center py-8 text-gray-500 h-full flex flex-col justify-center items-center">
        <Info className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No hay información detallada para esta reunión.</p>
      </div>
    );
  }

  const details = mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex-shrink-0">
        <div className="inline-flex items-center bg-white/60 rounded-lg px-3 py-1.5 shadow-sm">
          <Info className="w-4 h-4 mr-2 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-800">Detalles de la Reunión</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Resumen Estratégico</h4>
          <p className="text-xs text-gray-700 leading-relaxed">{details.summary}</p>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-gray-500" />
            Objetivos Clave
          </h4>
          <ul className="space-y-2">
            {details.objectives.map((obj, index) => (
              <li key={index} className="flex items-start text-xs text-gray-700">
                <CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            Análisis de Emails
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">Sentimiento General:</span>
                <Badge variant={details.emailAnalysis.sentiment === 'Positivo' ? 'default' : 'destructive'} className="text-xxs">{details.emailAnalysis.sentiment}</Badge>
              </div>
              <Progress value={details.emailAnalysis.sentimentScore} className="h-2" />
            </div>
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-1">Palabras Clave Detectadas:</h5>
              <div className="flex flex-wrap gap-1">
                {details.emailAnalysis.keywords.map(kw => <Badge key={kw} variant="outline" className="text-xxs">{kw}</Badge>)}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-1">Resumen IA:</h5>
              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md border">{details.emailAnalysis.summary}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Próximos Pasos (Follow-up)</h4>
          <p className="text-xs text-gray-700 leading-relaxed">{details.followUp}</p>
        </Card>
      </div>
    </div>
  );
}