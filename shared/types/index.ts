export interface Agent {
  id: string;
  name: string;
  personality: string;
  body_color: string;
  voice: string;
  avatar_url?: string;
  knowledge_base?: string;
  system_prompt?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'password';
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
  last_login?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const AVAILABLE_VOICES = [
  'Aoede',
  'Charon', 
  'Fenrir',
  'Kore',
  'Leda',
  'Orus',
  'Puck',
  'Zephyr'
] as const;

export type VoiceType = typeof AVAILABLE_VOICES[number];

export const AGENT_COLORS = [
  '#9CCF31', 
  '#ced4da', 
  '#adb5bd', 
  '#6c757d'
] as const;
