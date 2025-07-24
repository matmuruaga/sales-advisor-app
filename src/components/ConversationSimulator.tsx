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

/* --- REFINED DATA STRUCTURE FOR THE SCRIPT --- */
const conversationScript = [
  {
    userMessage:
      "Hi María, thanks for your time. By the way, I saw your LinkedIn post about the importance of practical AI—really insightful.",
    aiResponse:
      "Thanks for reading! Yes, I think there’s a lot of hype in the market. I’m interested in seeing solutions that actually work.",
  },
  {
    userMessage:
      "Completely agree. That’s why I wanted to quickly show you the Innovate Inc. case. They reduced meeting-prep time by 40 % in Q1.",
    aiResponse:
      "Interesting. But what’s the real cost of implementing something like this? I’m worried about complexity and total cost of ownership (TCO).",
  },
  {
    userMessage:
      "Great question. Our architecture lets you integrate via API in minutes. Savings in engineering hours and higher close rates bring positive ROI in under 6 months.",
    aiResponse:
      "Understood. I’d like to see a technical demo focused on the API next week.",
  },
];

const scriptPoints = [
  {
    title: "Key Point 1: Break the Ice",
    content: 'Mention her recent LinkedIn post about “practical AI”.',
  },
  {
    title: "Key Point 2: Address Skepticism",
    content: 'Proactively present the “Innovate Inc.” case study.',
  },
  {
    title: "Likely Objection: Cost & Complexity",
    content:
      "Response should focus on quick implementation and clear ROI.",
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

  /* Pre-fill first user line when the modal opens */
  useEffect(() => {
    setInputValue(conversationScript[0].userMessage);
  }, []);

  /* Handle send & mock AI reply */
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
    }, 1500); // simulate “thinking” delay
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
              <CardTitle>Conversation Simulator</CardTitle>
              <Button variant="outline" size="sm">
                Simulate video call
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
            {/* Left Column: Script */}
            <div className="col-span-4 h-full overflow-y-auto pr-2">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                AI Strategic Script
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

            {/* Right Column: Chat Simulation */}
            <div className="col-span-8 h-full flex flex-col bg-gray-100/70 rounded-lg min-h-0">
              {/* Messages area */}
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
                          <AvatarFallback className="text-xxs">ME</AvatarFallback>
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
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fixed input bar */}
              <div className="p-2 border-t bg-white/50 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type your response..."
                    value={inputValue}
                    readOnly /* user can’t type, only send predefined text */
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      isAiTyping || currentStep >= conversationScript.length
                    }
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
