import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  MessageSquare,
  FileText,
  Globe,
  Linkedin,
  Twitter,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';

/* ───────────────────────── TYPES ───────────────────────── */
interface AIInsightsProps {
  participantId: string | null;
}

type InsightSectionKey =
  | 'background'
  | 'companyInfo'
  | 'sentiment'
  | 'communicationStyle';

/* ───────────────────────── MOCK DATA ───────────────────────── */
const mockInsights: Record<string, any> = {
  'participant-1': {
    name: 'María González',
    role: 'CTO',
    company: 'TechCorp',
    insights: {
      background:
        'CTO with 15 years of experience, focused on ROI and efficiency. Early tech adopter but skeptical of tools that over-promise and are hard to implement.',
      companyInfo:
        'TechCorp is in a cost-optimization phase and demands ROI < 6 months for any new tool.',
      sentiment:
        'Very positive about our solution; wants to see detailed TCO and product roadmap.',
      communicationStyle:
        'Direct and data-driven. Prefers brief demos with clear metrics.',
      interests: ['Machine Learning', 'Cloud', 'Innovation'],
      recentActivity:
        'Posted on LinkedIn about “Practical AI” and the importance of ROI.',
      dealProbability: 85,
    },
  },
};

const mockDeepInsights: Record<string, any> = {
  'participant-1': {
    sentimentTowardsOurTool:
      'Positive. Appreciates cost reduction. Needs proof of rapid implementation.',
    articles: [{ title: 'AI in SaaS', source: 'TechCrunch', url: '#' }],
    relevantComments: [
      { text: 'AI only matters if it saves money.', platform: 'LinkedIn' },
    ],
    publicPhotos: [
      'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
    ],
  },
};

/* ───────────────────────── COMPONENT ───────────────────────── */
export function AIInsights({ participantId }: AIInsightsProps) {
  /* --- state --- */
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<InsightSectionKey>('background');
  const [isDeepResearch, setIsDeepResearch] = useState(false);

  /* --- refs --- */
  const textScrollRef = useRef<HTMLDivElement>(null);

  /* --- derived data --- */
  const participant = participantId ? mockInsights[participantId] : null;
  const deepInsights = participantId ? mockDeepInsights[participantId] : null;

  /* --- reset view when participant changes --- */
  useEffect(() => {
    setIsDeepResearch(false);
    setCurrentSection('background');
  }, [participantId]);

  /* --- fetch section text (simulated) --- */
  useEffect(() => {
    if (!participant || isDeepResearch) return;

    setIsLoading(true);
    setDisplayText('');

    const timer = setTimeout(() => {
      const full = participant.insights[currentSection] ?? '';
      setDisplayText(full);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [participant, currentSection, isDeepResearch]);

  /* --- autoscroll description --- */
  useEffect(() => {
    if (!isLoading && textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
    }
  }, [displayText, isLoading]);

  /* --- tabs config --- */
  const sections: { key: InsightSectionKey; label: string; icon: any }[] = [
    { key: 'background', label: 'Background', icon: FileText },
    { key: 'companyInfo', label: 'Company', icon: Globe },
    { key: 'sentiment', label: 'Sentiment', icon: MessageSquare },
    { key: 'communicationStyle', label: 'Communication', icon: MessageSquare },
  ];

  /* ───────────────────────── RENDER EARLY (no participant) ───────────────────────── */
  if (!participant) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-gray-500 py-8">
        <Brain className="w-12 h-12 mb-3 opacity-30" />
        <p>Select a participant to view AI insights</p>
      </div>
    );
  }

  /* ───────────────────────── VIEWS ───────────────────────── */
  const SummaryView = () => (
    <div className="h-full flex flex-col">
      {/* header */}
      <div className="flex-shrink-0">
        <div className="inline-flex items-center bg-white/60 rounded-lg px-3 py-1.5 shadow-sm mb-4">
          <Brain className="w-4 h-4 mr-2 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-800">AI Insights</h3>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <Card className="p-4">
          {/* participant info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-800">
                {participant.name}
              </h4>
              <p className="text-xxs text-gray-600">
                {participant.role} • {participant.company}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xxs text-gray-500 mb-1">Deal Probability</p>
              <div className="flex items-center space-x-2">
                <Progress value={participant.insights.dealProbability} className="w-12 h-2" />
                <span className="text-xxs">{participant.insights.dealProbability}%</span>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {sections.map(({ key, label, icon: Icon }) => {
              const active = currentSection === key;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentSection(key)}
                  className={`px-3 py-1 rounded-full text-xxs flex items-center transition-colors duration-200 ${
                    active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3 mr-1.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* description + loader */}
          <div className="h-24 mb-4 pr-1 flex items-center justify-center border rounded-lg bg-gray-50/50">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full overflow-y-auto px-2"
                  ref={textScrollRef}
                >
                  <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                    {displayText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* interests & recent activity */}
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-gray-600 mb-1">Interests</h5>
              <div className="flex flex-wrap gap-1">
                {participant.insights.interests?.map((int: string) => (
                  <Badge key={int} variant="outline" className="text-xxs">
                    {int}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-gray-600 mb-1">Recent Activity</h5>
              <p className="text-xs text-gray-700 break-words">
                {participant.insights.recentActivity}
              </p>
            </div>
            {/* socials */}
            <div className="flex items-center space-x-4 pt-3 border-t">
              <div className="flex items-center space-x-1">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">LinkedIn</span>
              </div>
              <div className="flex items-center space-x-1">
                <Twitter className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-500">Twitter</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-500">Website</span>
              </div>
            </div>
          </div>

          {/* CTA deep research */}
          <div className="mt-4 border-t pt-4">
            <Button
              className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow"
              onClick={() => setIsDeepResearch(true)}
              disabled={!deepInsights}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Deep Research
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const DeepResearchView = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setIsDeepResearch(false)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to summary
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-white/30 space-y-5">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Deep Research — {participant.name}
          </h4>

          <div>
            <h5 className="text-xs text-purple-700 font-semibold mb-1">
              Sentiment toward similar tools
            </h5>
            <p className="text-xs bg-purple-50 p-3 rounded-lg leading-relaxed text-gray-700">
              {deepInsights?.sentimentTowardsOurTool}
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-600 mb-1">
              Articles & Mentions
            </h5>
            <ul className="list-disc list-inside space-y-2">
              {deepInsights?.articles.map((a: any, i: number) => (
                <li key={i} className="text-xs">
                  <a href={a.url} className="text-blue-600 hover:underline">
                    {a.title}
                  </a>{' '}
                  <span className="text-gray-400">- {a.source}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-600 mb-1">
              Relevant Comments
            </h5>
            <div className="space-y-2">
              {deepInsights?.relevantComments.map((c: any, i: number) => (
                <blockquote
                  key={i}
                  className="text-xs bg-gray-50 p-2 border-l-2 border-gray-200 rounded-r-lg text-gray-700"
                >
                  {c.text}{' '}
                  <span className="text-gray-400">- {c.platform}</span>
                </blockquote>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-600 mb-1">
              Public Photos
            </h5>
            <div className="flex space-x-2">
              {deepInsights?.publicPhotos.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt="public"
                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ───────────────────────── MAIN RENDER ───────────────────────── */
  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {!isDeepResearch ? (
          <motion.div key="summary" exit={{ opacity: 0, x: -50 }} className="h-full">
            <SummaryView />
          </motion.div>
        ) : (
          <motion.div
            key="deep"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <DeepResearchView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
