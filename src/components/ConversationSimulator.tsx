import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";

interface ConversationSimulatorProps {
  participantName: string;
  onClose: () => void;
}

// --- ESTRUCTURA DE DATOS REFINADA PARA EL GUION ---
const conversationScript = [
  {
    userMessage:
      "Hola María, gracias por tu tiempo. Por cierto, vi tu post en LinkedIn sobre la importancia de la IA práctica. Me pareció muy acertado.",
    aiResponse:
      "¡Gracias por leerlo! Sí, creo que hay mucho humo en el mercado. Me interesa ver soluciones que funcionen de verdad.",
  },
  {
    userMessage:
      "Totalmente de acuerdo. Por eso quería mostrarte rápidamente el caso de Innovate Inc. Lograron reducir el tiempo de preparación de sus reuniones en un 40% en el primer trimestre.",
    aiResponse:
      "Interesante. Pero, ¿cuál es el coste real de implementar algo así? Me preocupa la complejidad y el coste total de propiedad (TCO).",
  },
  {
    userMessage:
      "Excelente pregunta. Nuestra arquitectura está diseñada para una integración API en minutos. El coste se justifica con el ahorro en horas de ingeniería y la mejora en la tasa de cierre, generando un ROI positivo en menos de 6 meses.",
    aiResponse:
      "Entendido. Me gustaría ver una demo técnica enfocada en la API la próxima semana.",
  },
];

const scriptPoints = [
  {
    title: "Punto Clave 1: Romper el Hielo",
    content: "Menciona su post reciente en LinkedIn sobre \"IA práctica\".",
  },
  {
    title: "Punto Clave 2: Abordar el Escepticismo",
    content: "Presenta el caso de estudio de \"Innovate Inc.\" proactivamente.",
  },
  {
    title: "Objeción Probable: Coste y Complejidad",
    content: "La respuesta debe enfocarse en la rapidez de implementación y el ROI.",
  },
];

export function ConversationSimulator({
  participantName,
  onClose,
}: ConversationSimulatorProps) {
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai_client"; text: string }>
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Inicia la conversación y pre-rellena el primer mensaje del usuario
  useEffect(() => {
    setInputValue(conversationScript[0].userMessage);
  }, []);

  const handleSend = () => {
    if (currentStep >= conversationScript.length) return;

    const userMsg = { sender: "user" as const, text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    // Simula la respuesta de la IA
    setTimeout(() => {
      const aiMsg = {
        sender: "ai_client" as const,
        text: conversationScript[currentStep].aiResponse,
      };
      setMessages((prev) => [...prev, aiMsg]);

      const nextStep = currentStep + 1;
      if (nextStep < conversationScript.length) {
        setInputValue(conversationScript[nextStep].userMessage);
      } else {
        setInputValue("Simulación completada.");
      }
      setCurrentStep(nextStep);
      setIsAiTyping(false);
    }, 1500); // Retardo para simular que la IA "piensa"
  };

  const clientInitials = participantName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-4xl h-[80vh] bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>Simulador de Conversación</CardTitle>
              <Button variant="outline" size="sm">
                Simular video llamada
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
            {/* Columna Izquierda: Guion */}
            <div className="col-span-4 h-full overflow-y-auto pr-2">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Guion Estratégico IA
              </h4>
              <div className="space-y-4">
                {scriptPoints.map((point, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg border"
                  >
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      {point.title}
                    </p>
                    <p className="text-xxs text-gray-600 leading-relaxed">
                      {point.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Simulación de Chat */}
            <div className="col-span-8 h-full flex flex-col bg-gray-100/70 rounded-lg min-h-0">
              {/* Área de mensajes (scroll) */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "ai_client" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xxs bg-gray-300">
                            {clientInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-2 rounded-lg text-xs shadow-sm ${
                          msg.sender === "user"
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.sender === "user" && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xxs">YO</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  {isAiTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-end gap-2 justify-start"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xxs bg-gray-300">
                          {clientInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[70%] p-2 rounded-lg text-xs bg-white text-gray-800 rounded-bl-none border">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Barra de entrada fija */}
              <div className="p-2 border-t bg-white/50 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={inputValue}
                    readOnly // El usuario no puede escribir, solo enviar el texto predefinido
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isAiTyping || currentStep >= conversationScript.length}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
