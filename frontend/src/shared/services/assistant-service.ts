import { API } from '../api/api-client'

export type AssistantIntent =
  | 'workshops'
  | 'products'
  | 'rentals'
  | 'services'
  | 'support'
  | 'general'

export interface AssistantChatResponse {
  conversationId: string
  intent: AssistantIntent
  reply: string
  suggestions: string[]
  escalated: boolean
  context?: {
    workshops?: Array<{ id: string; name: string; city: string | null }>
    products?: Array<{ id: string; title: string; price: number }>
    rentals?: Array<{ id: string; title: string; price: number }>
    services?: Array<{ id: string; name: string; workshopName: string }>
  }
}

export async function assistantChat(message: string, conversationId?: string) {
  const { data } = await API.post<AssistantChatResponse>('/assistant/chat', {
    message,
    conversationId,
  })

  return data
}
