// src/data/actionHistory.ts

export interface ActionHistoryInstance {
  id: string;          // ID único de esta ejecución
  actionId: string;    // ID de la plantilla de acción (ej. 'auto-follow-up')
  category: string;    // Categoría a la que pertenece (ej. 'sales-ops')
  timestamp: string;
  status: 'Completed' | 'Failed';
  target: string;      // A quién se aplicó la acción
  summary: string;     // Un resumen del resultado
  details?: {
    kpis?: Record<string, string>;
    generatedText?: string;
  }
}

export const actionHistory: ActionHistoryInstance[] = [
  {
    id: 'hist-1',
    actionId: 'auto-follow-up',
    category: 'sales-ops',
    timestamp: '2025-07-22T10:00:00Z',
    status: 'Completed',
    target: 'Ana López (VP Sales, ClientX)',
    summary: 'A 3-email sequence was initiated. The first email has been sent.',
    details: {
      kpis: { "Open Rate (Est.)": "65%", "Reply Rate (Est.)": "20%" }
    }
  },
  {
    id: 'hist-2',
    actionId: 'deal-health-check',
    category: 'analytics',
    timestamp: '2025-07-21T15:30:00Z',
    status: 'Completed',
    target: 'TechCorp Opportunity',
    summary: 'Analysis complete. Deal probability increased by 5%.',
     details: {
      kpis: { "Initial Probability": "68%", "New Probability": "73%", "Positive Sentiment": "85%" }
    }
  },
  {
    id: 'hist-3',
    actionId: 'generate-briefing',
    category: 'sales-ops',
    timestamp: '2025-07-20T09:00:00Z',
    status: 'Completed',
    target: 'María González (CTO, TechCorp)',
    summary: 'Pre-meeting briefing document was successfully generated.',
    details: {
      generatedText: "María is a CTO with 15 years of experience, focused on ROI. Key talking points: seamless integration, 6-month ROI, and our 'Innovate Inc.' case study..."
    }
  },
];