import { BarChart2, CheckCircle, Mail, Target, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface MeetingInfoPanelProps {
  meetingId: string | null;
}

/* --- ENRICHED MOCK DATA FOR INVESTOR DEMO --- */
const mockMeetingDetails = {
  'meeting-1': {
    summary:
      'Demo meeting with María González (CTO), a pragmatic, ROI-focused technical leader. The goal is to show how our solution integrates seamlessly into her current stack and accelerates her team’s productivity, addressing her skepticism toward complex tools.',
    objectives: [
      'Demonstrate integration with REST APIs in under 5 minutes.',
      'Present the “Innovate Inc.” case study as social proof of ROI.',
      'Confirm María as the main technical decision-maker.',
      'Secure a Proof of Concept (PoC) as a clear next step.',
    ],
    emailAnalysis: {
      sentiment: 'Positive',
      sentimentScore: 82,
      keywords: ['integration', 'productivity', 'API', 'security', 'ROI'],
      summary:
        'Email exchanges show high interest in efficiency and security. María (CTO) has been very receptive and asked specific technical questions, indicating a serious evaluation of the solution.',
    },
    followUp:
      'Prepare a detailed PoC proposal and send it before EOD Friday. Follow up next Tuesday if there is no response.',
  },
  'meeting-2': {
    summary:
      'Review of the commercial proposal sent to ClientX. We will discuss terms, project scope, and the next steps to close the deal.',
    objectives: [
      'Clarify doubts about the proposal.',
      'Negotiate licensing terms.',
      'Obtain a verbal commitment for closing.',
    ],
    emailAnalysis: {
      sentiment: 'Neutral',
      sentimentScore: 65,
      keywords: ['proposal', 'costs', 'timeline', 'agreement'],
      summary:
        'Ana (VP Sales) has confirmed receipt and scheduled the meeting to discuss details. The tone is professional and direct, focused on deal logistics.',
    },
    followUp:
      'Send a summary of the agreed points immediately after the meeting.',
  },
};

export function MeetingInfoPanel({ meetingId }: MeetingInfoPanelProps) {
  /* ───────────── Empty state ───────────── */
  if (
    !meetingId ||
    !mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails]
  ) {
    return (
      <div className="text-center py-8 text-gray-500 h-full flex flex-col justify-center items-center">
        <Info className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No detailed information for this meeting.</p>
      </div>
    );
  }

  const details =
    mockMeetingDetails[meetingId as keyof typeof mockMeetingDetails];

  /* ───────────── Render ───────────── */
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="inline-flex items-center bg-white/60 rounded-lg px-3 py-1.5 shadow-sm">
          <Info className="w-4 h-4 mr-2 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-800">
            Meeting Details
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4">
        {/* Strategic Summary */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Strategic Summary
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            {details.summary}
          </p>
        </Card>

        {/* Key Objectives */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-gray-500" />
            Key Objectives
          </h4>
          <ul className="space-y-2">
            {details.objectives.map((obj, index) => (
              <li
                key={index}
                className="flex items-start text-xs text-gray-700"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Email Analysis */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            Email Analysis
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">
                  Overall Sentiment:
                </span>
                <Badge
                  variant={
                    details.emailAnalysis.sentiment === 'Positive'
                      ? 'default'
                      : 'destructive'
                  }
                  className="text-xxs"
                >
                  {details.emailAnalysis.sentiment}
                </Badge>
              </div>
              <Progress
                value={details.emailAnalysis.sentimentScore}
                className="h-2"
              />
            </div>

            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-1">
                Detected Keywords:
              </h5>
              <div className="flex flex-wrap gap-1">
                {details.emailAnalysis.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="text-xxs capitalize"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-1">
                AI Summary:
              </h5>
              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md border">
                {details.emailAnalysis.summary}
              </p>
            </div>
          </div>
        </Card>

        {/* Follow-up */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Next Steps (Follow-up)
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            {details.followUp}
          </p>
        </Card>
      </div>
    </div>
  );
}
