import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  X,
  ArrowLeft,
  Send,
  User,
  Bot,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { SimulationConfig } from "./SimulationConfig";

/* --- MOCK DATA --- */
const mockLeads = [
  { id: "participant-1", name: "María González (CTO, TechCorp)" },
  { id: "participant-3", name: "Ana López (VP Sales, ClientX)" },
  { id: "participant-7", name: "Elena Pérez (CEO, StartupABC)" },
];
const simulationGoals = [
  { id: "discovery", label: "Discovery Call" },
  { id: "demo", label: "Schedule a Demo" },
  { id: "pricing", label: "Handle Pricing Objections" },
  { id: "negotiation", label: "Negotiation & Closing" },
];

const getMockScript = (goalId: string) => ({
  scriptPoints: [
    {
      title: "Opening",
      content:
        "Introduce yourself and mention the purpose of the call based on the context.",
    },
    {
      title: "Key Objection",
      content:
        "Anticipate the most likely objection and empathize before counter-arguing.",
    },
    {
      title: "Closing",
      content: `Guide the conversation toward the goal: ${
        simulationGoals.find((g) => g.id === goalId)?.label
      }`,
    },
  ],
  conversation: [
    {
      userMessage:
        "Hi, I’m calling from SalesAI. I noticed your interest in our product—do you have a minute?",
      aiResponse: "I’m a bit busy. What is this about exactly?",
    },
    {
      userMessage:
        "I understand. I just wanted to see if you’d be interested in a demo showing how we can streamline your sales process.",
      aiResponse: "We already use another tool. How are you different?",
    },
    {
      userMessage:
        "Our key differentiator is the AI that prepares you before every meeting. How about we schedule 15 minutes next week so I can show you?",
      aiResponse: "Sure, send me the invite.",
    },
  ],
});

interface QuickSimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSimulateModal({
  isOpen,
  onClose,
}: QuickSimulateModalProps) {
  const [step, setStep] = useState<"config" | "simulation">("config");

  const [config, setConfig] = useState({
    leadSource: "existing" as "existing" | "new",
    selectedLeadId: "",
    newProspectName: "",
    selectedGoal: "",
    temperature: 5,
    selectedPersonalities: [] as string[],
  });

  const [script, setScript] =
    useState<ReturnType<typeof getMockScript> | null>(null);
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai_client"; text: string }>
  >([]);
  const [currentChatStep, setCurrentChatStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  /* --- Begin simulation once configuration is valid --- */
  const handleStartSimulation = () => {
    const { leadSource, selectedLeadId, newProspectName, selectedGoal } =
      config;
    const ready =
      ((leadSource === "existing" && selectedLeadId) ||
        (leadSource === "new" && newProspectName)) &&
      selectedGoal;
    if (!ready) return;

    const mockScript = getMockScript(selectedGoal);
    setScript(mockScript);
    setMessages([]);
    setCurrentChatStep(0);
    setInputValue(mockScript.conversation[0].userMessage);
    setStep("simulation");
  };

  /* --- Send current user message & trigger AI reply --- */
  const handleSend = () => {
    if (!script || currentChatStep >= script.conversation.length) return;

    setMessages((prev) => [...prev, { sender: "user", text: inputValue }]);
    setIsAiTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai_client",
          text: script.conversation[currentChatStep].aiResponse,
        },
      ]);
      const next = currentChatStep + 1;
      if (next < script.conversation.length) {
        setInputValue(script.conversation[next].userMessage);
      } else {
        setInputValue("Simulation completed.");
      }
      setCurrentChatStep(next);
      setIsAiTyping(false);
    }, 1500);
  };

  const leadName =
    config.leadSource === "existing"
      ? mockLeads.find((l) => l.id === config.selectedLeadId)?.name || "Client"
      : config.newProspectName || "New Prospect";
  const clientInitials = leadName
    .split(" ")
    .map((n) => n[0])
    .join("");

  if (!isOpen) return null;

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
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-4xl h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === "config" ? (
            /* -------- CONFIGURATION STEP -------- */
            <motion.div key="config" className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Configure Simulation
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <SimulationConfig config={config} setConfig={setConfig} />

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  onClick={handleStartSimulation}
                  disabled={
                    ((config.leadSource === "existing" &&
                      !config.selectedLeadId) ||
                      (config.leadSource === "new" && !config.newProspectName)) ||
                    !config.selectedGoal
                  }
                >
                  Start Simulation <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            /* -------- SIMULATION STEP -------- */
            <motion.div key="simulation" className="w-full h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStep("config")}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <CardTitle>Simulating with {leadName}</CardTitle>
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
                {/* --- AI Script --- */}
                <div className="col-span-4 h-full overflow-y-auto pr-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    AI Strategic Script
                  </h4>
                  <div className="space-y-4">
                    {script?.scriptPoints.map((point, index) => (
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

                {/* --- Chat --- */}
                <div className="col-span-8 h-full flex flex-col bg-gray-100/70 rounded-lg min-h-0">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <AnimatePresence>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
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
                              <AvatarFallback className="text-xxs">ME</AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                      {isAiTyping && (
                        <motion.div
                          key="typing"
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
                              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]" />
                              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]" />
                              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-2 border-t bg-white/50 rounded-b-lg">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={inputValue}
                        readOnly
                        className="flex-1 bg-white"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={
                          isAiTyping ||
                          currentChatStep >= (script?.conversation.length || 0)
                        }
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
