import { BarChart2, CheckCircle, Mail, Target, Info, Sparkles, TrendingUp, AlertCircle, Calendar, Clock, Building } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MeetingInfoPanelProps {
  meetingId: string | null;
}

/* --- ENRICHED MOCK DATA WITH COMPANY CONTEXT --- */
const mockMeetingDetails = {
  'meeting-1': {
    companyContext: {
      name: 'TechCorp',
      industry: 'SaaS Platform',
      dealValue: '$125K',
      stage: 'Technical Evaluation',
      priority: 'High',
    },
    summary:
      'Strategic demo meeting with María González (CTO) at TechCorp, a high-growth B2B SaaS platform. María is known for her pragmatic, ROI-focused approach to technology decisions. This $125K opportunity is in the technical evaluation stage, and our goal is to demonstrate seamless integration capabilities while addressing her team\'s efficiency concerns.',
    objectives: [
      'Demonstrate REST API integration in under 5 minutes to showcase technical simplicity',
      'Present the "InnovateFlow Inc." case study showing 40% productivity gains',
      'Confirm María as the primary technical decision-maker and influencer',
      'Secure commitment for a 2-week Proof of Concept with their staging environment',
      'Identify potential expansion opportunities within their development team',
    ],
    emailAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 82,
      keywords: ['integration', 'productivity', 'API', 'security', 'ROI', 'scalability', 'efficiency'],
      summary:
        'Email thread analysis reveals strong technical interest. María has asked detailed questions about API rate limits, security protocols, and monitoring capabilities. Her responses are prompt and detailed, indicating this is a priority evaluation. Recent mentions of "Q4 efficiency goals" suggest budget availability and urgency.',
      keyInsights: [
        'Mentioned current integration challenges with 3 different tools',
        'Asked about GDPR compliance twice - critical requirement',
        'Referenced team growth from 12 to 25 developers this year',
      ],
    },
    followUp:
      'Send PoC proposal with TechCorp-specific integration scenarios by Friday 5PM. Include GDPR compliance documentation and reference architecture diagrams. Follow up with development team lead introductions by Tuesday if no response.',
    aiRecommendations: [
      'Lead with security and compliance benefits - high priority for María',
      'Prepare demo using their actual tech stack (Node.js, PostgreSQL, AWS)',
      'Have technical support engineer available for deep-dive questions',
    ],
  },
  'meeting-2': {
    companyContext: {
      name: 'ClientX Digital',
      industry: 'Marketing Agency',
      dealValue: '$89K',
      stage: 'Contract Negotiation',
      priority: 'Medium',
    },
    summary:
      'Contract finalization meeting with Ana López (VP Sales) at ClientX Digital. This established marketing agency has been evaluating our solution for 6 weeks and we\'ve reached the commercial negotiation phase. The $89K annual deal represents a strategic entry into the marketing agency vertical.',
    objectives: [
      'Address remaining concerns about multi-client data separation',
      'Negotiate volume pricing for their 50+ client accounts',
      'Finalize implementation timeline to meet their Q1 client onboarding goals',
      'Secure verbal commitment and next steps for contract execution',
    ],
    emailAnalysis: {
      sentiment: 'Cautious-Positive',
      sentimentScore: 68,
      keywords: ['pricing', 'implementation', 'timeline', 'ROI', 'client-management', 'scalability'],
      summary:
        'Ana\'s communication style is methodical and detail-oriented. Recent emails focus heavily on implementation logistics and cost justification. She\'s mentioned needing to present ROI projections to their CFO, indicating buy-in from finance is required. Positive reference to our competitor analysis suggests we\'re the preferred vendor.',
      keyInsights: [
        'CFO approval required for deals >$75K - financial justification critical',
        'Q1 client onboarding deadline creates implementation pressure',
        'Concerns about data privacy with multiple client accounts',
      ],
    },
    followUp:
      'Send ROI calculator and implementation timeline within 24 hours. Prepare CFO-focused business case presentation. Schedule technical workshop with their client success team for data separation demonstration.',
    aiRecommendations: [
      'Focus on ROI metrics and cost-per-client value proposition',
      'Prepare multi-tenant architecture diagrams for security concerns',
      'Offer phased implementation to reduce risk and show quick wins',
    ],
  },
  'meeting-3': {
    companyContext: {
      name: 'Sales Team',
      industry: 'Internal',
      dealValue: 'N/A',
      stage: 'Weekly Review',
      priority: 'High',
    },
    summary:
      'Weekly sales team alignment meeting to review pipeline progress, analyze deal momentum, and strategize on key opportunities. Focus on Q4 targets and identifying potential risks in our major deals.',
    objectives: [
      'Review pipeline health and Q4 forecast accuracy',
      'Analyze conversion rates and identify improvement opportunities',
      'Discuss resource allocation for high-priority deals',
      'Share competitive intelligence and market insights',
    ],
    emailAnalysis: {
      sentiment: 'Focused',
      sentimentScore: 75,
      keywords: ['pipeline', 'targets', 'conversion', 'resources', 'strategy'],
      summary:
        'Team communications show strong focus on execution and accountability. Recent discussions around competitive pressures and the need for better qualification of inbound leads.',
      keyInsights: [
        'Pipeline velocity has increased 15% this quarter',
        'Need better discovery process for technical stakeholders',
        'Marketing qualified leads show higher close rates',
      ],
    },
    followUp:
      'Update CRM with all discussed action items. Schedule individual coaching sessions for deals requiring strategic support.',
    aiRecommendations: [
      'Focus on pipeline quality metrics, not just quantity',
      'Implement better lead scoring for technical evaluation stage',
      'Create battle cards for competitive situations',
    ],
  },
};

export function MeetingInfoPanel({ meetingId }: MeetingInfoPanelProps) {
  /* ───────────── Empty state ───────────── */
  if (
    !meetingId ||
    !mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails]
  ) {
    return (
      <div className="text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center">
        <div className="bg-white/60 backdrop-blur-sm rounded-full p-6 mb-4 shadow-lg">
          <Info className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-lg font-medium mb-2">No Meeting Selected</p>
        <p className="text-sm text-gray-400">Select a meeting to view detailed AI insights</p>
      </div>
    );
  }

  const details =
    mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails];

  /* ───────────── Render ───────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Gradient */}
      <div className="flex-shrink-0">
        <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-xl p-4 shadow-lg border border-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-800">AI Meeting Intelligence</h3>
                <p className="text-sm text-purple-600">Strategic insights and recommendations</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
              <div className="flex items-center text-xs text-purple-600 font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Live Analysis
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-6 mt-6">
        {/* Company Context Header */}
        {details.companyContext && (
          <Card className="bg-gradient-to-br from-slate-50 via-white to-gray-50 border-slate-200/50 shadow-lg backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-slate-600 to-gray-600 rounded-lg p-2 shadow-md">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold text-slate-800">{details.companyContext.name}</h4>
                    <p className="text-sm text-slate-600">{details.companyContext.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">{details.companyContext.dealValue}</div>
                  <div className="text-xs text-slate-500">{details.companyContext.stage}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={`${details.companyContext.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'} font-medium`}>
                  {details.companyContext.priority} Priority
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Strategic Summary - Hero Card */}
        <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200/50 shadow-xl backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-2 shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-purple-900 ml-3">
                Strategic Meeting Summary
              </h4>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {details.summary}
              </p>
            </div>
          </div>
        </Card>

        {/* Key Objectives */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-2 shadow-md">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-800 ml-3">
                Key Meeting Objectives
              </h4>
            </div>
            <div className="space-y-3">
              {details.objectives.map((obj, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-3">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Email Analysis - Premium Card */}
        <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200/50 shadow-xl backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-2 shadow-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-blue-900 ml-3">
                Email Intelligence Analysis
              </h4>
            </div>
            
            {/* Sentiment Gauge */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Overall Sentiment Analysis
                </span>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  <Badge
                    className={`${details.emailAnalysis.sentiment === 'Positive' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-orange-100 text-orange-700 border-orange-200'
                    } text-xs font-medium`}
                  >
                    {details.emailAnalysis.sentiment}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress
                  value={details.emailAnalysis.sentimentScore}
                  className="h-3 bg-gray-200"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Negative</span>
                  <span className="font-semibold text-gray-700">{details.emailAnalysis.sentimentScore}% Positive</span>
                  <span>Positive</span>
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            <div className="mb-5">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                Key Topics Detected
              </h5>
              <div className="flex flex-wrap gap-2">
                {details.emailAnalysis.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-xs font-medium px-3 py-1 hover:shadow-md transition-shadow"
                  >
                    #{kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BarChart2 className="w-4 h-4 text-blue-500 mr-2" />
                AI Communication Analysis
              </h5>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200/50 shadow-sm">
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  {details.emailAnalysis.summary}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Follow-up - Action Card */}
        <Card className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200/50 shadow-xl backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-full p-2 shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-orange-900 ml-3">
                Next Steps & Follow-up
              </h4>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {details.followUp}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-200/50">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-3 border border-orange-200/50">
                  <div className="flex items-center text-sm font-semibold text-orange-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Recommended Action Timeline: Within 24-48 hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Insights from Email Analysis */}
        {details.emailAnalysis?.keyInsights && (
          <Card className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-cyan-200/50 shadow-lg backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full p-2 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-cyan-900 ml-3">
                  Key Communication Insights
                </h4>
              </div>
              <div className="space-y-3">
                {details.emailAnalysis.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-cyan-200/50 shadow-sm">
                    <div className="bg-cyan-100 rounded-full p-1 mt-0.5 mr-3">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                    </div>
                    <p className="text-sm text-cyan-800 font-medium leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* AI Recommendations */}
        {details.aiRecommendations && (
          <Card className="bg-gradient-to-br from-emerald-50 via-white to-green-50 border-emerald-200/50 shadow-xl backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-full p-2 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-emerald-900 ml-3">
                  AI Strategic Recommendations
                </h4>
              </div>
              <div className="space-y-3">
                {details.aiRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="bg-emerald-500 rounded-full p-1.5 mr-3 mt-0.5 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-emerald-800 font-medium leading-relaxed flex-1">{recommendation}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-emerald-200/50">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg p-4 border border-emerald-200/50">
                  <div className="flex items-center text-sm font-semibold text-emerald-700">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Recommendations powered by conversation analysis and behavioral patterns
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
