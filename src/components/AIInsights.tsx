import { useState, useEffect } from 'react';
import { Brain, MessageSquare, FileText, Globe, Linkedin, Twitter } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

// (Aquí irían todas las definiciones de tipos que ya corregimos)
// ...
interface AIInsightsProps {
  participantId: string | null;
}
type ParticipantId = 'participant-1' | 'participant-2' | 'participant-3';
type InsightSectionKey = 'background' | 'companyInfo' | 'sentiment' | 'communicationStyle';
interface ParticipantInsights {
  name: string;
  role: string;
  company: string;
  aiScore: number;
  insights: {
    background: string;
    interests: string[];
    recentActivity: string;
    companyInfo: string;
    sentiment: string;
    dealProbability: number;
    communicationStyle: string;
  };
}
const mockInsights: Record<string, ParticipantInsights> = {
    'participant-1': {
    name: 'María González',
    role: 'CTO',
    company: 'TechCorp',
    aiScore: 95,
    insights: {
      background: 'María González es una experimentada CTO con más de 15 años en el sector tecnológico. Anteriormente trabajó en Google como Senior Engineering Manager y fundó dos startups exitosas. Es reconocida por su liderazgo en transformación digital.',
      interests: ['Machine Learning', 'Cloud Computing', 'Team Leadership', 'Innovation'],
      recentActivity: 'Publicó un artículo sobre "El futuro de la IA en las empresas" en LinkedIn hace 3 días',
      companyInfo: 'TechCorp es una empresa de software empresarial con 500+ empleados, facturación anual de €50M. Recientemente recibió una ronda de Serie C por €25M.',
      sentiment: 'Muy positivo hacia nuevas tecnologías y colaboraciones estratégicas',
      dealProbability: 85,
      communicationStyle: 'Directa, orientada a datos, prefiere comunicación escrita detallada'
    }
  },
  'participant-2': {
    name: 'Carlos Ruiz',
    role: 'Lead Developer',
    company: 'TechCorp',
    aiScore: 78,
    insights: {
      background: 'Carlos Ruiz es un desarrollador senior especializado en arquitecturas de microservicios. Tiene 8 años de experiencia y es muy activo en la comunidad open source. Mantiene varios proyectos en GitHub con más de 1000 estrellas.',
      interests: ['Microservices', 'Docker', 'Kubernetes', 'Open Source'],
      recentActivity: 'Contribuyó a un proyecto de Kubernetes hace 2 días',
      companyInfo: 'Parte del equipo de arquitectura de TechCorp, reporta directamente a María González',
      sentiment: 'Positivo hacia herramientas que mejoren la productividad del equipo',
      dealProbability: 70,
      communicationStyle: 'Técnico, le gusta profundizar en detalles de implementación'
    }
  },
  'participant-3': {
    name: 'Ana López',
    role: 'VP Sales',
    company: 'ClienteX',
    aiScore: 88,
    insights: {
      background: 'Ana López es una veterana en ventas B2B con más de 12 años de experiencia. Ha liderado equipos de ventas en empresas como Salesforce y HubSpot. Experta en estrategias de account-based marketing.',
      interests: ['Sales Strategy', 'CRM', 'Marketing Automation', 'Team Management'],
      recentActivity: 'Compartió insights sobre "Tendencias en ventas B2B 2025" en Twitter',
      companyInfo: 'ClienteX es una empresa de servicios profesionales con 200 empleados, especializada en consultoría empresarial',
      sentiment: 'Muy interesada en herramientas que optimicen el proceso de ventas',
      dealProbability: 92,
      communicationStyle: 'Orientada a resultados, aprecia ROI claro y casos de éxito'
    }
  }
};


export function AIInsights({ participantId }: AIInsightsProps) {
  const [animatedText, setAnimatedText] = useState('');
  const [currentSection, setCurrentSection] = useState<InsightSectionKey>('background');
  const [isAnimating, setIsAnimating] = useState(false);

  const participant = participantId ? mockInsights[participantId as keyof typeof mockInsights] : null;

  useEffect(() => {
    if (participant) {
      const textToAnimate = participant.insights[currentSection];
      animateText(textToAnimate);
    } else {
        // Clear text when no participant is selected
        setAnimatedText('');
    }
  }, [participant, currentSection]);

  const animateText = (text: string) => {
    setIsAnimating(true);
    setAnimatedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setAnimatedText(prev => text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 20);
    return () => clearInterval(interval);
  };

  if (!participant) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Selecciona un participante para ver insights de IA</p>
      </div>
    );
  }

  const sections: { key: InsightSectionKey; label: string; icon: React.ElementType }[] = [
    { key: 'background', label: 'Background', icon: FileText },
    { key: 'companyInfo', label: 'Empresa', icon: Globe },
    { key: 'sentiment', label: 'Sentimiento', icon: MessageSquare },
    { key: 'communicationStyle', label: 'Comunicación', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-600">AI Insights</h3>
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-500">AI Score: {participant.aiScore}%</span>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm text-gray-800">{participant.name}</h4>
            <p className="text-xxs text-gray-600">{participant.role} • {participant.company}</p>
          </div>
          <div className="text-right">
            <div className="text-xxs text-gray-500 mb-1">Deal Probability</div>
            <div className="flex items-center space-x-2">
              <Progress value={participant.insights.dealProbability} className="w-12 h-2" />
              <span className="text-xxs">{participant.insights.dealProbability}%</span>
            </div>
          </div>
        </div>

        {/* --- CORRECCIÓN DE DISEÑO (Botones) ---
            Añadimos `flex-wrap` para que los botones salten a la siguiente
            línea si no caben, evitando que se salgan de la tarjeta.
        */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => setCurrentSection(section.key)}
                className={`
                  px-3 py-1 rounded-full text-xxs transition-all duration-200 flex items-center
                  ${currentSection === section.key 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-3 h-3 inline mr-1.5" />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[120px] mb-4">
          {/* --- CORRECCIÓN DE DISEÑO (Texto) ---
              Añadimos `break-words` para forzar el salto de línea en palabras
              largas y evitar que el texto se desborde.
          */}
          <p className="text-xs text-gray-700 leading-relaxed break-words">
            {animatedText}
            {isAnimating && <span className="animate-pulse">|</span>}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-xs text-gray-600 mb-2">Intereses</h5>
            <div className="flex flex-wrap gap-1">
              {participant.insights.interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xxs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs text-gray-600 mb-1">Actividad Reciente</h5>
            <p className="text-xs text-gray-700 break-words">{participant.insights.recentActivity}</p>
          </div>

          <div className="flex items-center space-x-4 pt-3 border-t">
            <div className="flex items-center space-x-1">
              <Linkedin className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">LinkedIn</span>
            </div>
            <div className="flex items-center space-x-1">
              <Twitter className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Twitter</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-500">Website</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
