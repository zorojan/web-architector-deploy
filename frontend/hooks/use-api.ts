import { useState, useEffect } from 'react'
import { api, Agent } from '../lib/api-client'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        setError(null)
        const agentsData = await api.getAgents()
        setAgents(agentsData)
      } catch (err) {
        console.error('Failed to fetch agents:', err)
        setError('Не удалось загрузить агентов')
        // Fallback to empty array if API fails
        setAgents([])
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return { agents, loading, error, refetch: () => window.location.reload() }
}

export function useGeminiApiKey() {
  const [apiKey, setApiKey] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoading(true)
        setError(null)
        const key = await api.getSetting('gemini_api_key')
        setApiKey(key)
      } catch (err) {
        console.error('Failed to fetch API key:', err)
        setError('Не удалось загрузить API ключ')
        // Try to use environment variable as fallback
        setApiKey(import.meta.env.VITE_GEMINI_API_KEY || '')
      } finally {
        setLoading(false)
      }
    }

    fetchApiKey()
  }, [])

  return { apiKey, loading, error }
}
