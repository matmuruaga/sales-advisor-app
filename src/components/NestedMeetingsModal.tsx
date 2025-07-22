import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X, Calendar as CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { addDays, format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface NestedMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- DATOS SIMULADOS ADAPTADOS AL NUEVO DISEÑO ---
const mockOpportunities = [
    {
        id: 'opp-1',
        title: 'Oportunidad TechCorp',
        meetings: [
            { id: 'm-1-1', type: 'Discovery', date: '2025-07-10', status: 'completada' },
            { id: 'm-1-2', type: 'Oportunidad', date: '2025-07-17', status: 'completada' },
            { id: 'm-1-3', type: 'Follow-up', date: '2025-07-22', status: 'próxima' },
        ],
    },
    {
        id: 'opp-2',
        title: 'Oportunidad ClienteX',
        meetings: [
            { id: 'm-2-1', type: 'Prospección', date: '2025-07-12', status: 'completada' },
            { id: 'm-2-2', type: 'Discovery', date: '2025-07-20', status: 'próxima' },
            { id: 'm-2-3', type: 'Cierre', date: '2025-07-28', status: 'próxima' },
        ],
    },
    {
        id: 'opp-3',
        title: 'Oportunidad StartupABC',
        meetings: [
            { id: 'm-3-1', type: 'Discovery', date: '2025-07-15', status: 'completada' },
            { id: 'm-3-2', type: 'Oportunidad', date: '2025-07-21', status: 'próxima' },
            { id: 'm-3-3', type: 'Follow-up', date: '2025-07-25', status: 'próxima' },
            { id: 'm-3-4', type: 'Follow-up', date: '2025-07-30', status: 'próxima' },
        ],
    }
];

// --- Sub-componente para renderizar una línea de tiempo por oportunidad ---
const OpportunityTimeline = ({ opportunity }: { opportunity: typeof mockOpportunities[0] }) => {
    return (
        <div className="flex-shrink-0 w-80 p-4">
            <h3 className="font-semibold text-center mb-6 text-gray-800">{opportunity.title}</h3>
            <div className="relative pl-8">
                {/* La línea vertical de la timeline */}
                <div className="absolute left-4 top-2 h-full border-l-2 border-gray-200"></div>
                
                {opportunity.meetings.map((meeting, index) => {
                    const prevMeetingDate = index > 0 ? new Date(opportunity.meetings[index-1].date) : null;
                    const daysBetween = prevMeetingDate ? differenceInDays(new Date(meeting.date), prevMeetingDate) : 0;
                    
                    return (
                        <div key={meeting.id} className="mb-4" style={{marginTop: prevMeetingDate ? `${daysBetween * 8}px` : '0px' }}>
                           {prevMeetingDate && (
                                <div className="text-xxs text-purple-600 ml-[-20px] mb-1 text-center w-8 font-semibold">{daysBetween}d</div>
                           )}
                            <div className="relative">
                                <div className="absolute left-[-20px] top-3 w-4 h-4 bg-white border-2 border-purple-500 rounded-full"></div>
                                <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: index * 0.1}}>
                                    <Card className="p-2 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-semibold text-gray-800">{meeting.type}</p>
                                            <Badge variant={meeting.status === 'completada' ? 'default' : 'outline'} className="text-xxs">{meeting.status}</Badge>
                                        </div>
                                        <p className="text-xxs text-gray-500 mt-1">{format(new Date(meeting.date), "d 'de' LLLL", { locale: es })}</p>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export function NestedMeetingsModal({ isOpen, onClose }: NestedMeetingsModalProps) {
    const [step, setStep] = useState<'picker' | 'visualizer'>('picker');
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2025, 6, 1),
        to: addDays(new Date(2025, 6, 31), 0),
    });

    if (!isOpen) return null;

    // --- 1. CORRECCIÓN DEL BUG DEL POPUP: Contenedor exterior con posicionamiento fijo ---
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
                className="relative w-full max-w-5xl h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center">
                        {/* 2. BOTÓN DE VOLVER */}
                        {step === 'visualizer' && (
                            <Button variant="ghost" size="icon" onClick={() => setStep('picker')} className="h-8 w-8 mr-2"><ArrowLeft className="w-4 h-4" /></Button>
                        )}
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center"><GitBranch className="w-5 h-5 mr-2 text-purple-600" />Mapa de Reuniones Anidadas</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </div>
                <AnimatePresence mode="wait">
                    {step === 'picker' ? (
                        <motion.div key="picker" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex flex-col items-center justify-center">
                            <p className="text-sm text-gray-600 mb-4">Selecciona un rango de fechas para visualizar el flujo de oportunidades.</p>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                locale={es}
                            />
                            <Button onClick={() => setStep('visualizer')} className="mt-6">
                                Visualizar Flujo <ArrowRight className="w-4 h-4 ml-2"/>
                            </Button>
                        </motion.div>
                    ) : (
                        // --- 3. NUEVO DISEÑO DE LÍNEA DE TIEMPO ---
                        <motion.div key="visualizer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 bg-slate-50/50 rounded-lg border overflow-x-auto">
                           <div className="flex h-full">
                                {mockOpportunities.map(opp => (
                                    <OpportunityTimeline key={opp.id} opportunity={opp} />
                                ))}
                           </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}