import { create } from 'zustand';
import { Agent } from './presets/agents';

// API клиент
const API_BASE_URL = 'http://localhost:3001/api';

// Функция для получения агентов из API
async function fetchAgentsFromAPI(): Promise<Agent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    
    const apiAgents = await response.json();
    
    // Преобразуем данные из API в формат, который ожидает приложение
    return apiAgents
      .filter((agent: any) => agent.is_active) // Только активные агенты
      .map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        personality: agent.personality,
        bodyColor: agent.body_color,
        voice: agent.voice,
        avatarUrl: agent.avatar_url || ''
      }));
  } catch (error) {
    console.error('Error fetching agents from API:', error);
    
    // Fallback к статическим агентам при ошибке
    const { StartupConsultant, AIAdvisor, TechnicalArchitect, DevOpsSpecialist } = await import('./presets/agents');
    return [StartupConsultant, AIAdvisor, TechnicalArchitect, DevOpsSpecialist];
  }
}

// Store для агентов с API
export const useApiAgents = create<{
  agents: Agent[];
  current: Agent | null;
  loading: boolean;
  error: string | null;
  loadAgents: () => Promise<void>;
  setCurrent: (agent: Agent) => void;
}>((set, get) => ({
  agents: [],
  current: null,
  loading: false,
  error: null,
  
  loadAgents: async () => {
    try {
      set({ loading: true, error: null });
      const agents = await fetchAgentsFromAPI();
      set({ 
        agents,
        loading: false,
        current: get().current || agents[0] || null
      });
    } catch (error) {
      set({ 
        error: 'Не удалось загрузить агентов',
        loading: false
      });
    }
  },
  
  setCurrent: (agent: Agent) => {
    set({ current: agent });
  }
}));
