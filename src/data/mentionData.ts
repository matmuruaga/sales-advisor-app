export const mentionData = {
  contacts: [
    { id: 'contact-1', name: 'María González', details: 'CTO, TechCorp' },
    { id: 'contact-2', name: 'Ana López', details: 'VP Sales, ClientX' },
    { id: 'contact-3', name: 'Elena Pérez', details: 'CEO, StartupABC' },
  ],
  companies: [
    { id: 'company-1', name: 'TechCorp', details: 'Enterprise Software' },
    { id: 'company-2', name: 'ClientX', details: 'B2B SaaS Provider' },
    { id: 'company-3', name: 'StartupABC', details: 'Fintech Innovator' },
  ],
  reports: [
    { id: 'report-1', name: 'Q2 Sales Performance', details: 'Generated on Jul 15' },
    { id: 'report-2', name: 'TechCorp Opportunity Analysis', details: 'Updated 2 days ago' },
  ],
  team: [
    { id: 'team-1', name: 'Jessica Smith', details: 'Sales Lead' },
    { id: 'team-2', name: 'Mark Evans', details: 'Sales Engineer' },
  ],
};

export type MentionCategory = keyof typeof mentionData;