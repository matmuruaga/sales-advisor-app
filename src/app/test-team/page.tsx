"use client";

import { useEffect, useState } from 'react';
import { useSupabaseTeamMembers } from '@/hooks/useSupabaseTeamMembers';

export default function TestTeamPage() {
  const { teamMembers, teamMetrics, loading, error } = useSupabaseTeamMembers();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    setDebugInfo({
      loading,
      error,
      teamMembersCount: teamMembers.length,
      teamMembers: teamMembers.slice(0, 2), // Just show first 2 for debugging
      teamMetrics
    });
  }, [loading, error, teamMembers, teamMetrics]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Data Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Team Members Count: {teamMembers.length}</p>
      </div>
    </div>
  );
}