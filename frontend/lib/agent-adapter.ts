import { Agent as ApiAgent } from '../lib/api-client'
import { Agent as LocalAgent, INTERLOCUTOR_VOICE } from '../lib/presets/agents'

// Convert API agent to local agent format
export function convertApiAgentToLocal(apiAgent: ApiAgent): LocalAgent {
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    personality: apiAgent.personality,
    bodyColor: apiAgent.body_color,
    voice: apiAgent.voice as INTERLOCUTOR_VOICE,
    avatarUrl: apiAgent.avatar_url || ''
  }
}

// Convert local agent to API agent format
export function convertLocalAgentToApi(localAgent: LocalAgent): Partial<ApiAgent> {
  return {
    id: localAgent.id,
    name: localAgent.name,
    personality: localAgent.personality,
    body_color: localAgent.bodyColor,
    voice: localAgent.voice,
    avatar_url: localAgent.avatarUrl,
    is_active: true
  }
}
