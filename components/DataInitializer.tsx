import React, { useEffect, useState } from 'react';
import { useAgent } from '@/lib/state';
import { Agent } from '@/lib/presets/agents';

interface DataInitializerProps {
  children: React.ReactNode;
}

export default function DataInitializer({ children }: DataInitializerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const agents = await response.json();
        
        console.log('📊 DataInitializer raw agents from API:', agents);
        
        // Преобразуем агентов из API в формат, ожидаемый приложением
        const formattedAgents: Agent[] = agents.map((agent: any) => ({
          id: agent.id.toString(),
          name: agent.name,
          personality: agent.personality || agent.instructions || '',
          bodyColor: agent.body_color || '#9CCF31',
          voice: (agent.voice as any) || 'Aoede',
          avatarUrl: agent.avatar_url || undefined,
        }));

        console.log('🎭 DataInitializer formatted agents:', formattedAgents);

        // Обновляем состояние напрямую
        useAgent.setState(state => ({
          ...state,
          availablePresets: formattedAgents,
          current: formattedAgents[0] || state.current
        }));

        setLoading(false);
      } catch (err) {
        console.error('Error loading agents:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  if (loading) {
    return <div>Loading agents...</div>;
  }

  if (error) {
    return <div>Error loading agents: {error}</div>;
  }

  return <>{children}</>;
}
