import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Users,
  X,
  Info,
  Bot,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Datos simulados para el selector de leads y la IA
const mockLeads = [
  {
    id: 'participant-1',
    name: 'María González (TechCorp)',
    email: 'maria.gonzalez@techcorp.com',
  },
  {
    id: 'participant-3',
    name: 'Ana López (ClienteX)',
    email: 'ana.lopez@clientex.com',
  },
  {
    id: 'participant-7',
    name: 'Elena Pérez (StartupABC)',
    email: 'elena.perez@startupabc.com',
  },
];

export function ScheduleMeetingModal({
  isOpen,
  onClose,
}: ScheduleMeetingModalProps) {
  /* ───────────── Estado básico existente ───────────── */
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  /* ───────────── Nuevo estado ───────────── */
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [scheduleOption, setScheduleOption] = useState<'now' | 'schedule'>('now');

  /* ───────────── Validación de email ───────────── */
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  /* ───────────── Handlers ───────────── */
  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = mockLeads.find((l) => l.id === leadId);
    if (lead) {
      setEmail(lead.email);
      setIsManualEntry(false);
    } else {
      setEmail('');
      setIsManualEntry(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Si el usuario edita el email manualmente, deseleccionamos lead
    if (selectedLeadId) setSelectedLeadId('');
    setIsManualEntry(true);
  };

  const handleGenerateAI = () => {
    setSubject('Demostración de Solución IA y Sinergias');
    setBody(
      'Hola,\n\nSiguiendo nuestra conversación, me gustaría agendar una breve sesión para mostrarte cómo nuestra plataforma puede integrarse con vuestro stack actual y generar un ROI significativo.\n\nHe visto tu interés en la IA práctica y estoy seguro de que encontrarás valor en nuestro enfoque.\n\n¿Alguno de los horarios sugeridos te viene bien?\n\nSaludos,'
    );
  };

  /* ───────────── Early return si modal cerrado ───────────── */
  if (!isOpen) return null;

  /* ───────────── Render ───────────── */
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
        className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Agendar Nueva Reunión
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ───── Columna Izquierda ───── */}
            <div className="space-y-4">
              {/* Lead */}
              <div>
                <label className="text-xs font-medium text-gray-600">Lead</label>
                <Select onValueChange={handleLeadChange} value={selectedLeadId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar un contacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-600 flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email del Invitado
                </label>
                <div className="relative mt-1">
                  <Input
                    type="email"
                    placeholder="ejemplo@dominio.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {isEmailValid && (
                    <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Crear nuevo lead */}
              {isManualEntry && isEmailValid && (
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="createLead" />
                  <label htmlFor="createLead" className="text-xs font-medium">
                    Crear nuevo lead con este email
                  </label>
                </div>
              )}

              {/* Tipo de reunión */}
              <div>
                <label className="text-xs font-medium text-gray-600">Tipo de Reunión</label>
                <Select defaultValue="oportunidad">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oportunidad">Oportunidad</SelectItem>
                    <SelectItem value="follow-up">Follow‑up</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="cierre">Cierre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Programar envío */}
              <div>
                <label className="text-xs font-medium text-gray-600">Envío</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant={scheduleOption === 'now' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setScheduleOption('now')}
                  >
                    Enviar ahora
                  </Button>
                  <Button
                    variant={scheduleOption === 'schedule' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setScheduleOption('schedule')}
                  >
                    Programar
                  </Button>
                </div>
                {scheduleOption === 'schedule' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <Input type="datetime-local" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* ───── Columna Derecha ───── */}
            <div className="space-y-2">
              {/* Asunto */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Asunto</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto text-xxs px-2 py-0.5"
                  onClick={handleGenerateAI}
                >
                  <Sparkles className="w-3 h-3 mr-1 text-purple-500" /> Generar con IA
                </Button>
              </div>
              <Input
                placeholder="Asunto del email..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              {/* Cuerpo */}
              <label className="text-xs font-medium text-gray-600 pt-2 block">
                Cuerpo del mensaje
              </label>
              <Textarea
                placeholder="Cuerpo del email de invitación..."
                className="h-28"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          {/* Opciones avanzadas y acciones */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="space-y-2 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <Checkbox id="briefing" />
                  <label htmlFor="briefing" className="text-xs font-medium">
                    Incluir briefing IA para asistentes internos
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="followup" />
                  <label htmlFor="followup" className="text-xs font-medium">
                    Activar secuencia de seguimiento automática
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 self-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Agendar y Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
