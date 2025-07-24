import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Users,
  Target,
  Lightbulb,
  Sparkles,
  X,
  ArrowLeft,
  Clipboard,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface CallScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ───── Mock data ───── */
const mockLeads = [
  { id: "participant-1", name: "María González (TechCorp)" },
  { id: "participant-3", name: "Ana López (ClientX)" },
  { id: "participant-7", name: "Elena Pérez (StartupABC)" },
];
const simulationGoals = [
  { id: "discovery", label: "Discovery Call" },
  { id: "demo", label: "Schedule a Demo" },
  { id: "pricing", label: "Handle Pricing Objections" },
];

const getMockScript = (leadName: string, goalLabel: string) => ({
  opener: `Hi ${leadName.split(" ")[0]}, this is [Your Name] from SalesAI Advisor. I noticed your interest in optimizing sales processes. Do you have 2 minutes?`,
  validation: [
    "How much time does your team currently spend preparing for meetings?",
    "Which tools do you use to ensure everyone is aligned before a call?",
  ],
  valuePitch: `Our platform acts as an AI assistant that auto-generates briefings and simulations for every meeting, so your team can focus on selling, not researching. The goal is to ${goalLabel.toLowerCase()}.`,
  objections: {
    "I don't have time": "I completely understand. That’s exactly why I’m calling—our solution saves reps an average of 5 hours per week. How would reclaiming that time impact you?",
    "It's too expensive": "Budget is always a concern. What if we schedule a 15-minute demo so I can show you how the ROI outweighs the cost within a single quarter?",
    "We already use a competitor": "Great, that means you value this type of solution. Many companies choose us for our unique focus on simulation and training—which no one else offers.",
  },
  close:
    "Would it be okay if I send over a quick demo invite for next week so you can see it in action?",
});

export function CallScriptModal({ isOpen, onClose }: CallScriptModalProps) {
  const [step, setStep] = useState<"config" | "script">("config");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [valueProps, setValueProps] = useState("");
  const [script, setScript] = useState<any>(null);

  /* ───── Generate script (mocked) ───── */
  const handleGenerateScript = () => {
    if (!selectedLeadId || !selectedGoal) return;
    setIsLoading(true);
    setTimeout(() => {
      const lead = mockLeads.find((l) => l.id === selectedLeadId);
      const goal = simulationGoals.find((g) => g.id === selectedGoal);
      if (lead && goal) {
        setScript(getMockScript(lead.name, goal.label));
      }
      setIsLoading(false);
      setStep("script");
    }, 1500);
  };

  if (!isOpen) return null;

  /* Helper for repeated section UI */
  const ScriptSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white/50 p-3 rounded-lg border">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold text-purple-800">{title}</h4>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Clipboard className="w-3 h-3" />
        </Button>
      </div>
      <div className="text-xs text-gray-800 space-y-2">{children}</div>
    </div>
  );

  /* ────────────────────────────── Modal ────────────────────────────── */
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
        className="relative w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === "config" ? (
            /* ───────── CONFIGURATION STEP ───────── */
            <motion.div key="config" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-purple-600" />
                  Call Script Generator
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

              <div className="space-y-4">
                {/* Lead */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Who are you calling?
                  </label>
                  <Select onValueChange={setSelectedLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLeads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Goal */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Primary goal
                  </label>
                  <Select onValueChange={setSelectedGoal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {simulationGoals.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pain points */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Pain points to address (optional)
                  </label>
                  <Textarea
                    placeholder='E.g. "Low close rates", "Slow onboarding process"...'
                    rows={2}
                    onChange={(e) => setPainPoints(e.target.value)}
                  />
                </div>

                {/* Value props */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Value props to highlight (optional)
                  </label>
                  <Textarea
                    placeholder='E.g. "Save 5h/week per seller", "Unique AI capabilities"...'
                    rows={2}
                    onChange={(e) => setValueProps(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  onClick={handleGenerateScript}
                  disabled={!selectedLeadId || !selectedGoal || isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Generate Script with AI"}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ───────── SCRIPT STEP ───────── */
            <motion.div
              key="script"
              className="p-6 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStep("config")}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Generated Script
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2">
                <ScriptSection title="Opening">
                  <p>{script?.opener}</p>
                </ScriptSection>

                <ScriptSection title="Validation">
                  <ul>
                    {script?.validation.map((q: string, i: number) => (
                      <li key={i} className="list-disc list-inside">
                        {q}
                      </li>
                    ))}
                  </ul>
                </ScriptSection>

                <ScriptSection title="Value Pitch">
                  <p>{script?.valuePitch}</p>
                </ScriptSection>

                <ScriptSection title="Objection Handling">
                  {Object.entries(script?.objections || {}).map(
                    ([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 rounded-md">
                        <p className="font-semibold text-gray-600">"{key}"</p>
                        <p className="mt-1 text-gray-800">
                          → {value as string}
                        </p>
                      </div>
                    )
                  )}
                </ScriptSection>

                <ScriptSection title="Close & Next Steps">
                  <p>{script?.close}</p>
                </ScriptSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
