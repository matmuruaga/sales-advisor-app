"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, PlusCircle, BarChart2, MessageSquare, UserPlus } from 'lucide-react';

export const InteractivePrompt = () => {
    const [prompt, setPrompt] = useState('');

    const handleAddComponent = (componentText: string) => {
        // Añade el placeholder del componente al final del texto actual
        setPrompt(prev => `${prev} [Componente: ${componentText}]`.trim());
    };

    const handleSend = () => {
        // En una app real, aquí se enviaría el prompt
        console.log("Executing prompt:", prompt);
        setPrompt(''); // Limpiar el campo después de enviar
    };

    return (
        <div className="p-4 border-t">
            <div className="relative rounded-xl border bg-white p-2 shadow-sm focus-within:ring-1 focus-within:ring-purple-500">
                <div className="flex items-start space-x-2">
                    {/* Popover para "Añadir Componente" */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <PlusCircle className="w-4 h-4 text-gray-500" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700 px-2 mb-1">Add Component</p>
                                <Button onClick={() => handleAddComponent('KPI Summary')} variant="ghost" className="w-full justify-start text-xs font-normal h-8"><BarChart2 className="w-4 h-4 mr-2"/> KPI Summary</Button>
                                <Button onClick={() => handleAddComponent('Log a Note')} variant="ghost" className="w-full justify-start text-xs font-normal h-8"><MessageSquare className="w-4 h-4 mr-2"/> Log a Note</Button>
                                <Button onClick={() => handleAddComponent('Mention a User')} variant="ghost" className="w-full justify-start text-xs font-normal h-8"><UserPlus className="w-4 h-4 mr-2"/> Mention a User</Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Campo de Texto */}
                    <Textarea
                        placeholder="Type a command to edit the summary or log a new interaction..."
                        className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 shadow-none p-1 text-xs"
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    {/* Botón de Envío */}
                    <Button onClick={handleSend} size="icon" className="h-8 w-8 flex-shrink-0 bg-gray-800 hover:bg-black">
                        <Send className="w-4 h-4 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};