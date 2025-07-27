// src/components/ConversationSimulator.tsx - VERSIÓN COMPLETA

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X, ArrowLeft, RotateCcw, MessageSquare, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

// Importar el componente de voz
import { VoiceConversationInterface } from "./VoiceConversationInterface";

interface ConversationSimulatorProps {
  participantName: string;
  scenario?: string;
  difficulty?: string;
  onClose: () => void;
  onBack?: () => void;
}

type ConversationMode = 'text' | 'voice';

const conversationScript = [
  {
    userMessage:
      "Hi María, thanks for your time. By the way, I saw your LinkedIn post about the importance of practical AI—really insightful.",
    aiResponse:
      "Thanks for reading! Yes, I think there's a lot of hype in the market. I'm interested in seeing solutions that actually work.",
  },
  {
    userMessage:
      "Completely agree. That's why I wanted to quickly show you the Innovate Inc. case. They reduced meeting-prep time by 40% in Q1.",
    aiResponse:
      "Interesting. But what's the real cost of implementing something like this? I'm worried about complexity and total cost of ownership (TCO).",
  },
  {
    userMessage:
      "Great question. Our architecture lets you integrate via API in minutes. Savings in engineering hours and higher close rates bring positive ROI in under 6 months.",
    aiResponse:
      "Understood. I'd like to see a technical demo focused on the API next week.",
  },
];

const scriptPoints = [
  {
    title: "Key Point 1: Break the Ice",
    content: 'Mention her recent LinkedIn post about "practical AI".',
  },
  {
    title: "Key Point 2: Address Skepticism", 
    content: 'Proactively present the "Innovate Inc." case study.',
  },
  {
    title: "Likely Objection: Cost & Complexity",
    content: "Response should focus on quick implementation and clear ROI.",
  },
];

// ID del agente de ElevenLabs
const ELEVENLABS_AGENT_ID = "agent_6901k15kdqqrfx9s2f8zhby878c6";

export function ConversationSimulator({
  participantName,
  scenario = "Pricing Objections",
  difficulty = "Advanced",
  onClose,
  onBack,
}: ConversationSimulatorProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai_client"; text: string }>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('text');

  useEffect(() => {
    if (conversationMode === 'text') {
      setInputValue(conversationScript[0].userMessage);
    }
  }, [conversationMode]);

  const handleSend = () => {
    if (currentStep >= conversationScript.length) return;

    const userMsg = { sender: "user" as const, text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    setTimeout(() => {
      const aiMsg = {
        sender: "ai_client" as const,
        text: conversationScript[currentStep].aiResponse,
      };
      setMessages((prev) => [...prev, aiMsg]);

      const next = currentStep + 1;
      if (next < conversationScript.length) {
        setInputValue(conversationScript[next].userMessage);
      } else {
        setInputValue("Simulation completed.");
      }
      setCurrentStep(next);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentStep(0);
    setInputValue(conversationScript[0].userMessage);
    setIsAiTyping(false);
  };

  const switchToTextMode = () => {
    setConversationMode('text');
    handleRestart();
  };

  const switchToVoiceMode = () => {
    setConversationMode('voice');
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
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-6xl h-[85vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full h-full flex flex-col bg-transparent border-0 shadow-none">
          <CardHeader className="flex-shrink-0 border-b bg-white/50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">Conversation Simulator</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xxs">
                    {scenario}
                  </Badge>
                  <Badge variant="secondary" className="text-xxs">
                    {difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Toggle de modo de conversación */}
                <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-1 border">
                  <Button
                    variant={conversationMode === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={switchToTextMode}
                    className="h-8 px-3 text-xs"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Text Chat
                  </Button>
                  <Button
                    variant={conversationMode === 'voice' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={switchToVoiceMode}
                    className="h-8 px-3 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Voice Call
                  </Button>
                </div>
                
                {conversationMode === 'text' && (
                  <Button variant="outline" size="sm" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restart
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden min-h-0 p-0">
            <AnimatePresence mode="wait">
              {conversationMode === 'voice' ? (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <VoiceConversationInterface
                    participantName={participantName}
                    agentId={ELEVENLABS_AGENT_ID}
                    scenario={scenario}
                    difficulty={difficulty}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="h-full grid grid-cols-12 gap-6 p-6"
                >
                  {/* Left Column: AI Strategic Script */}
                  <div className="col-span-4 h-full flex flex-col">
                    <div className="bg-white/70 rounded-xl p-4 h-full flex flex-col">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        AI Strategic Script
                      </h4>
                      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {scriptPoints.map((point, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100"
                          >
                            <p className="text-xs font-semibold text-purple-800 mb-1">
                              {point.title}
                            </p>
                            <p className="text-xxs text-purple-700 leading-relaxed">
                              {point.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Chat Simulation */}
                  <div className="col-span-8 h-full flex flex-col">
                    <div className="bg-white/70 rounded-xl flex flex-col h-full overflow-hidden">
                      {/* Header con información del participante */}
                      <div className="p-4 border-b border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                              {clientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{participantName}</p>
                            <p className="text-xxs text-gray-500">AI Text Simulation • {scenario}</p>
                          </div>
                        </div>
                      </div>

                      {/* Messages area */}
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        <AnimatePresence>
                          {messages.map((msg, index) => (
                            <motion.div
                              key={index}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-end gap-3 ${
                                msg.sender === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              {msg.sender === "ai_client" && (
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xxs bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                                    {clientInitials}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                                  msg.sender === "user"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md"
                                    : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                                }`}
                              >
                                {msg.text}
                              </div>
                              {msg.sender === "user" && (
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xxs bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700">
                                    ME
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                          {isAiTyping && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-end gap-3 justify-start"
                            >
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xxs bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                                  {clientInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="max-w-[75%] p-3 rounded-2xl text-sm bg-white text-gray-800 rounded-bl-md border border-gray-200">
                                <div className="flex items-center gap-1">
                                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]" />
                                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]" />
                                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse" />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Input bar */}
                      <div className="p-4 border-t border-gray-200/50 bg-white/50 rounded-b-xl">
                        <div className="flex items-center gap-3">
                          <Input
                            type="text"
                            placeholder="Type your response..."
                            value={inputValue}
                            readOnly
                            className="flex-1 bg-white border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <Button
                            onClick={handleSend}
                            disabled={isAiTyping || currentStep >= conversationScript.length}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xxs text-gray-500 mt-2">
                          {currentStep < conversationScript.length 
                            ? `Step ${currentStep + 1} of ${conversationScript.length}` 
                            : "Simulation completed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}