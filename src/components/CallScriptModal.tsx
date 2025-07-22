import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Users, Target, Lightbulb, Sparkles, X, ArrowLeft, Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface CallScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockLeads = [
    { id: 'participant-1', name: 'María González (TechCorp)' },
    { id: 'participant-3', name: 'Ana López (ClienteX)' },
    { id: 'participant-7', name: 'Elena Pérez (StartupABC)' },
];
const simulationGoals = [
    { id: 'discovery', label: 'Llamada de Descubrimiento' },
    { id: 'demo', label: 'Agendar una Demo' },
    { id: 'pricing', label: 'Manejar Objeciones de Precio' },
];

const getMockScript = (leadName: string, goalLabel: string) => ({
  opener: `Hola ${leadName.split(' ')[0]}, soy [Tu Nombre] de SalesAI Advisor. Te llamo porque noté tu interés en optimizar procesos de venta. ¿Tienes 2 minutos?`,
  validation: [
    '¿Actualmente, cuánto tiempo dedica tu equipo a prepararse para las reuniones?',
    '¿Qué herramientas usáis para asegurar que todos lleguen alineados a una llamada?',
  ],
  valuePitch: `Nuestra herramienta actúa como un asistente de IA que prepara briefings automáticos y simulaciones para cada reunión, asegurando que tu equipo pueda centrarse en vender, no en investigar. El objetivo es ${goalLabel.toLowerCase()}.`,
  objections: {
    "No tengo tiempo": "Entiendo perfectamente. Por eso mismo te llamo. Nuestra herramienta ahorra una media de 5 horas por vendedor a la semana. ¿Qué te parecería recuperar ese tiempo?",
    "Es muy caro": "Comprendo la preocupación por el presupuesto. Si te parece, podemos agendar una demo de 15 minutos donde te mostraré cómo el ROI supera la inversión en menos de un trimestre.",
    "Ya usamos a la competencia": "Genial, eso significa que valoráis este tipo de soluciones. Muchas empresas nos eligen por nuestro enfoque en la simulación y el entrenamiento, algo único en el mercado."
  },
  close: `¿Te parece bien si te envío una invitación para una demo rápida la próxima semana para que puedas verlo en acción?`
});

export function CallScriptModal({ isOpen, onClose }: CallScriptModalProps) {
  const [step, setStep] = useState<'config' | 'script'>('config');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [valueProps, setValueProps] = useState('');
  const [script, setScript] = useState<any>(null);

  const handleGenerateScript = () => {
    if (!selectedLeadId || !selectedGoal) return;
    setIsLoading(true);
    setTimeout(() => {
      const lead = mockLeads.find(l => l.id === selectedLeadId);
      const goal = simulationGoals.find(g => g.id === selectedGoal);
      if (lead && goal) {
        setScript(getMockScript(lead.name, goal.label));
      }
      setIsLoading(false);
      setStep('script');
    }, 1500);
  };

  if (!isOpen) return null;
  
  const ScriptSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white/50 p-3 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-purple-800">{title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Clipboard className="w-3 h-3"/></Button>
        </div>
        <div className="text-xs text-gray-800 space-y-2">{children}</div>
    </div>
  );

  // <--- SOLUCIÓN: Se añade el contenedor exterior para el comportamiento de modal ---
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'config' ? (
            <motion.div key="config" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center"><Phone className="w-5 h-5 mr-2 text-purple-600" />Generador de Script de Llamada</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-4">
                <div><label className="text-xs font-medium text-gray-600">¿A quién llamas?</label><Select onValueChange={setSelectedLeadId}><SelectTrigger><SelectValue placeholder="Seleccionar un Lead..." /></SelectTrigger><SelectContent>{mockLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium text-gray-600">¿Cuál es tu objetivo principal?</label><Select onValueChange={setSelectedGoal}><SelectTrigger><SelectValue placeholder="Seleccionar un Objetivo..." /></SelectTrigger><SelectContent>{simulationGoals.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium text-gray-600">Puntos de Dolor a Tocar (Opcional)</label><Textarea placeholder="Ej: 'Baja tasa de cierre', 'Proceso de onboarding lento'..." rows={2} onChange={e => setPainPoints(e.target.value)}/></div>
                <div><label className="text-xs font-medium text-gray-600">Propuestas de Valor a Destacar (Opcional)</label><Textarea placeholder="Ej: 'Ahorro de 5h/semana por vendedor', 'IA única en el mercado'..." rows={2} onChange={e => setValueProps(e.target.value)}/></div>
              </div>
              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button onClick={handleGenerateScript} disabled={!selectedLeadId || !selectedGoal || isLoading} className="w-full md:w-auto">
                  {isLoading ? <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isLoading ? 'Generando...' : 'Generar Script con IA'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="script" className="p-6 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setStep('config')} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
                    <h2 className="text-lg font-semibold text-gray-800">Script Generado</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3 overflow-y-auto pr-2">
                <ScriptSection title="Apertura"><p>{script?.opener}</p></ScriptSection>
                <ScriptSection title="Validación"><ul>{script?.validation.map((q: string, i: number) => <li key={i} className="list-disc list-inside">{q}</li>)}</ul></ScriptSection>
                <ScriptSection title="Pitch de Valor"><p>{script?.valuePitch}</p></ScriptSection>
                <ScriptSection title="Manejo de Objeciones">
                    {Object.entries(script?.objections || {}).map(([key, value]) => (
                        <div key={key} className="p-2 bg-gray-50 rounded-md">
                            <p className="font-semibold text-gray-600">"{key}"</p>
                            <p className="mt-1 text-gray-800">→ {value as string}</p>
                        </div>
                    ))}
                </ScriptSection>
                <ScriptSection title="Cierre y Próximos Pasos"><p>{script?.close}</p></ScriptSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}