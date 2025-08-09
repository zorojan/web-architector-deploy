import { create } from 'zustand'
import { useEffect } from 'react'
import { Agent } from './presets/agents'
import { useAgents } from '../hooks/use-api'
import { convertApiAgentToLocal } from './agent-adapter'

// Updated agent store that works with API
export const useApiAgent = create<{
  current: Agent | null
  availableAgents: Agent[]
  loading: boolean
  error: string | null
  setCurrent: (agent: Agent) => void
  loadAgents: () => Promise<void>
}>((set, get) => ({
  current: null,
  availableAgents: [],
  loading: false,
  error: null,
  
  setCurrent: (agent: Agent) => {
    set({ current: agent })
  },
  
  loadAgents: async () => {
    try {
      set({ loading: true, error: null })
      
      // This will be called from a React component that has access to the hook
      // For now, we'll use a placeholder that will be replaced
      const agents: Agent[] = []
      
      set({ 
        availableAgents: agents,
        loading: false,
        current: agents[0] || null
      })
    } catch (error) {
      set({ 
        error: 'Failed to load agents',
        loading: false 
      })
    }
  }
}))

// Hook to integrate API data with Zustand store
export function useAgentWithApi() {
  const { agents: apiAgents, loading: apiLoading, error: apiError } = useAgents()
  const { 
    current, 
    availableAgents, 
    setCurrent, 
    loadAgents 
  } = useApiAgent()

  // Convert API agents to local format
  const convertedAgents = apiAgents.map(convertApiAgentToLocal)

  // Update store when API data changes
  useEffect(() => {
    if (convertedAgents.length > 0) {
      useApiAgent.setState({ 
        availableAgents: convertedAgents,
        loading: false,
        error: null,
        current: current || convertedAgents[0]
      })
    }
  }, [convertedAgents, current])

  useEffect(() => {
    if (apiError) {
      useApiAgent.setState({ error: apiError })
    }
  }, [apiError])

  useEffect(() => {
    useApiAgent.setState({ loading: apiLoading })
  }, [apiLoading])

  return {
    current,
    availableAgents: convertedAgents,
    loading: apiLoading,
    error: apiError,
    setCurrent,
    loadAgents
  }
}
