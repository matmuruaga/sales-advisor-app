import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for lead selector & AI
const mockLeads = [
  {
    id: "participant-1",
    name: "María González (TechCorp)",
    email: "maria.gonzalez@techcorp.com",
  },
  {
    id: "participant-3",
    name: "Ana López (ClientX)",
    email: "ana.lopez@clientx.com",
  },
  {
    id: "participant-7",
    name: "Elena Pérez (StartupABC)",
    email: "elena.perez@startupabc.com",
  },
];

export function ScheduleMeetingModal({
  isOpen,
  onClose,
}: ScheduleMeetingModalProps) {
  /* ───────────── Existing basic state ───────────── */
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  /* ───────────── New state ───────────── */
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [scheduleOption, setScheduleOption] = useState<"now" | "schedule">(
    "now"
  );

  /* ───────────── Email validation ───────────── */
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
      setEmail("");
      setIsManualEntry(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // If the user edits the email manually, unselect the lead
    if (selectedLeadId) setSelectedLeadId("");
    setIsManualEntry(true);
  };

  const handleGenerateAI = () => {
    setSubject("AI Solution Demo & Synergies");
    setBody(
      "Hi,\n\nFollowing our conversation, I’d like to schedule a brief session to show how our platform can integrate with your current stack and generate significant ROI.\n\nI noticed your interest in practical AI, and I’m confident you’ll find value in our approach.\n\nDo any of the suggested times work for you?\n\nBest regards,"
    );
  };

  /* ───────────── Early return if modal is closed ───────────── */
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
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Schedule New Meeting
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ───── Left Column ───── */}
            <div className="space-y-4">
              {/* Lead */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Lead
                </label>
                <Select onValueChange={handleLeadChange} value={selectedLeadId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact..." />
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
                  <Mail className="w-3 h-3 mr-1" /> Guest Email
                </label>
                <div className="relative mt-1">
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {isEmailValid && (
                    <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Create new lead */}
              {isManualEntry && isEmailValid && (
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="createLead" />
                  <label
                    htmlFor="createLead"
                    className="text-xs font-medium"
                  >
                    Create new lead with this email
                  </label>
                </div>
              )}

              {/* Meeting type */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Meeting Type
                </label>
                <Select defaultValue="opportunity">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Send / Schedule */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Send
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant={scheduleOption === "now" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setScheduleOption("now")}
                  >
                    Send now
                  </Button>
                  <Button
                    variant={
                      scheduleOption === "schedule" ? "default" : "outline"
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() => setScheduleOption("schedule")}
                  >
                    Schedule
                  </Button>
                </div>
                {scheduleOption === "schedule" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <Input type="datetime-local" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* ───── Right Column ───── */}
            <div className="space-y-2">
              {/* Subject */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">
                  Subject
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto text-xxs px-2 py-0.5"
                  onClick={handleGenerateAI}
                >
                  <Sparkles className="w-3 h-3 mr-1 text-purple-500" />{" "}
                  Generate with AI
                </Button>
              </div>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              {/* Body */}
              <label className="text-xs font-medium text-gray-600 pt-2 block">
                Message body
              </label>
              <Textarea
                placeholder="Invitation email body..."
                className="h-28"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced options & actions */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="space-y-2 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <Checkbox id="briefing" />
                  <label htmlFor="briefing" className="text-xs font-medium">
                    Include AI briefing for internal attendees
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="followup" />
                  <label htmlFor="followup" className="text-xs font-medium">
                    Enable automatic follow-up sequence
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 self-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Schedule &amp; Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
