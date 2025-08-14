"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { availableActions } from "@/data/availableActions";
import { ActionHistoryInstance } from "@/data/actionHistory";
import { Target, Calendar, FileText, TrendingUp, Milestone } from "lucide-react";

interface AiSummaryProps {
  instance: ActionHistoryInstance;
}

// Pequeño componente de KPI para reutilizar
const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <div className="bg-white/60 p-3 rounded-lg border">
        <div className="flex items-center text-xxs text-gray-500 mb-1">
            <Icon className="w-3 h-3 mr-1.5" />
            <span>{title}</span>
        </div>
        <p className="text-sm font-bold text-purple-600">{value}</p>
    </div>
);


export const AiSummary = ({ instance }: AiSummaryProps) => {
  const actionDetails = (() => {
    for (const categoryKey in availableActions) {
      const action = availableActions[categoryKey].find(a => a.id === instance.actionId);
      if (action) return action;
    }
    return { title: 'Unknown Action', icon: FileText };
  })();

  // Función para renderizar los resultados según el tipo de acción
  const renderResults = () => {
    switch (instance.actionId) {
        case 'update-crm-opportunity':
            return (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <KpiCard title="Previous Stage" value="Qualification" icon={Milestone} />
                    <KpiCard title="New Stage" value="Proposal Sent" icon={Milestone} />
                </div>
            );
        case 'deal-health-check':
            return (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <KpiCard title="Initial Probability" value={instance.details?.kpis?.["Initial Probability"] || 'N/A'} icon={TrendingUp} />
                    <KpiCard title="New Probability" value={instance.details?.kpis?.["New Probability"] || 'N/A'} icon={TrendingUp} />
                </div>
            );
        case 'generate-briefing':
            return (
                <blockquote className="mt-2 border-l-2 pl-4 text-xs italic text-gray-600 bg-gray-50 p-3 rounded-r-md">
                    {instance.details?.generatedText || 'No details available.'}
                </blockquote>
            );
        default:
             return <p className="text-xs text-gray-700 mt-2 bg-gray-50 p-3 rounded-md">{instance.summary}</p>;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
            <h3 className="font-semibold text-base text-gray-800 flex items-center">
                <actionDetails.icon className="w-4 h-4 mr-2 text-purple-600"/>
                {actionDetails.title}
            </h3>
            <p className="text-xxs text-gray-500">
                Action ID: {instance.id}
            </p>
        </div>
        <Badge variant={instance.status === 'Completed' ? 'default' : 'destructive'}>
          {instance.status}
        </Badge>
      </div>

      {/* Metadatos */}
      <Card className="bg-white/60 p-3">
        <h4 className="text-xxs font-semibold text-gray-500 mb-2">Key Information</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center">
                <Target className="w-3 h-3 mr-2 text-gray-400"/>
                <span className="text-gray-500 mr-2">Target:</span>
                <span className="font-medium text-gray-700 truncate">{instance.target}</span>
            </div>
            <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-gray-400"/>
                <span className="text-gray-500 mr-2">Date:</span>
                <span className="font-medium text-gray-700">{new Date(instance.timestamp).toLocaleDateString()}</span>
            </div>
        </div>
      </Card>

      {/* Resultados */}
      <div>
        <h4 className="text-xxs font-semibold text-gray-500 mb-1">AI Summary & Results</h4>
        {renderResults()}
      </div>
    </div>
  );
};