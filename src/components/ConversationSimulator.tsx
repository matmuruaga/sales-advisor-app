// src/components/ConversationSimulator.tsx - IMPLEMENTACIÓN FINAL WEBSOCKET

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X, ArrowLeft, RotateCcw, MessageSquare, Mic, Bot, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

// Importar los componentes
import { VoiceConversationInterface } from "./VoiceConversationInterface";
import { useElevenLabsChat } from "@/hooks/useElevenLabsChat";

interface ConversationSimulatorProps {
  participantName: string;
  scenario?: string;
  difficulty?: string;
  onClose: () => void;
  onBack?: () => void;
}

type ConversationMode = 'text' | 'voice';

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

// IDs de agentes de ElevenLabs
const ELEVENLABS_CHAT_AGENT_ID = "agent_2301k17ywyrkfaw8390ty3qpf5dd"; // Para chat de texto
const ELEVENLABS_VOICE_AGENT_ID = "agent_6901k15kdqqrfx9s2f8zhby878c6"; // Para voz

export function ConversationSimulator({
  participantName,
  scenario = "Pricing Objections",
  difficulty = "Advanced",
  onClose,
  onBack,
}: ConversationSimulatorProps) {
  const [inputValue, setInputValue] = useState("");
  const [conversationMode, setConversationMode] = useState<ConversationMode>('text');

  // Hook para chat con WebSocket usando SDK oficial
  const { 
    messages, 
    isLoading, 
    error: chatError,
    isConnected,
    isConnecting,
    status,
    sendMessage, 
    clearConversation,
    connectManually,
    ensureConnection
  } = useElevenLabsChat({ 
    agentId: ELEVENLABS_CHAT_AGENT_ID,
    participantName 
  });

  // Auto-conectar cuando se selecciona modo texto
  useEffect(() => {
    if (conversationMode === 'text') {
      ensureConnection();
    }
  }, [conversationMode, ensureConnection]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue.trim();
    setInputValue("");
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    clearConversation();
    setInputValue("");
  };

  const switchToTextMode = () => {
    setConversationMode('text');
  };

  const switchToVoiceMode = () => {
    setConversationMode('voice');
  };

  const clientInitials = participantName
    .split(" ")
    .map((n) => n[0])
    .join("");

  const getConnectionStatus = () => {
    if (conversationMode === 'voice') {
      return { text: 'Voice Mode', color: 'text-green-600', icon: Mic };
    }
    
    switch (status) {
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-600', icon: WifiOff };
      case 'connected':
        return { text: 'Connected', color: 'text-green-600', icon: Wifi };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-gray-600', icon: WifiOff };
      default:
        return { text: 'Ready', color: 'text-gray-600', icon: WifiOff };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 flex flex-col overflow-hidden"
        style={{ height: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex-shrink-0 border-b bg-white/50 rounded-t-2xl p-4">
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
                <h2 className="text-lg font-semibold">Conversation Simulator</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {scenario}
                </Badge>
                <Badge variant="secondary" className="text-xs">
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
                  className={`h-8 px-3 text-xs ${
                    conversationMode === 'text' 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  AI Chat
                </Button>
                <Button
                  variant={conversationMode === 'voice' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={switchToVoiceMode}
                  className={`h-8 px-3 text-xs ${
                    conversationMode === 'voice' 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-1" />
                  Voice Call
                </Button>
              </div>
              
              {conversationMode === 'text' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                  {!isConnected && !isConnecting && (
                    <Button variant="outline" size="sm" onClick={connectManually}>
                      <Wifi className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </>
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
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-h-0 overflow-hidden">
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
                  agentId={ELEVENLABS_VOICE_AGENT_ID}
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
                className="h-full p-6 grid grid-cols-12 gap-6"
              >
                {/* Left Column: AI Strategic Script */}
                <div className="col-span-4 h-full">
                  <div className="bg-white/70 rounded-xl p-4 h-full flex flex-col">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                      AI Strategic Script
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <div className="space-y-3">
                        {scriptPoints.map((point, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100"
                          >
                            <p className="text-xs font-semibold text-purple-800 mb-1">
                              {point.title}
                            </p>
                            <p className="text-xs text-purple-700 leading-relaxed">
                              {point.content}
                            </p>
                          </div>
                        ))}
                        
                        {/* Status de WebSocket */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center">
                            <connectionStatus.icon className="w-3 h-3 mr-1" />
                            WebSocket Status
                          </p>
                          <p className={`text-xs ${connectionStatus.color}`}>
                            {connectionStatus.text}
                          </p>
                          {isLoading && (
                            <p className="text-xs text-blue-600 mt-1">
                              AI is responding...
                            </p>
                          )}
                          {chatError && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {chatError}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Agent: {ELEVENLABS_CHAT_AGENT_ID.slice(-8)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Real WebSocket Chat */}
                <div className="col-span-8 h-full flex flex-col">
                  <div className="bg-white/70 rounded-xl h-full flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-200/50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                            {clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{participantName}</p>
                          <p className="text-xs text-gray-500">
                            {isConnected ? 'Live ElevenLabs Chat' : 'Disconnected'} • {scenario}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                      <div className="space-y-4">
                        {!isConnected && messages.length === 0 && (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm">
                                {isConnecting ? `Connecting to ${participantName}...` : 'Disconnected'}
                              </p>
                              <p className="text-xs mt-1">
                                {isConnecting ? 'Establishing WebSocket connection...' : 'Click Connect to start'}
                              </p>
                            </div>
                          </div>
                        )}

                        {isConnected && messages.length === 0 && (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-green-300" />
                              <p className="text-sm">Connected to {participantName}</p>
                              <p className="text-xs mt-1">The AI agent will send a welcome message soon</p>
                            </div>
                          </div>
                        )}
                        
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
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
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
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700">
                                    ME
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                          
                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-end gap-3 justify-start"
                            >
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
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
                    </div>

                    {/* Input bar */}
                    <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white/50 rounded-b-xl">
                      <div className="flex items-center gap-3">
                        <Input
                          type="text"
                          placeholder={isConnected ? "Type your message to the AI prospect..." : "Connect first to start chatting..."}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          disabled={isLoading || !isConnected}
                          className="flex-1 bg-white border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={isLoading || !inputValue.trim() || !isConnected}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {isLoading 
                          ? "AI is generating response..." 
                          : isConnected
                          ? `Live WebSocket chat with ${participantName} • Press Enter to send`
                          : "WebSocket disconnected • Click Connect to resume"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}