import {
  AutoAwesome,
  Close,
  OpenInNew,
  Send,
  SupportAgent,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assistantChat, type AssistantChatResponse, type AssistantIntent } from '../services/assistant-service'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  payload?: Pick<AssistantChatResponse, 'intent' | 'context'>
}

const INTENT_ROUTE: Record<AssistantIntent, string | null> = {
  workshops: '/talleres',
  products: '/productos',
  rentals: '/rentals',
  services: '/talleres',
  support: null,
  general: null,
}

function buildRouteFromPayload(payload?: ChatMessage['payload']): string | null {
  if (!payload) return null
  const route = INTENT_ROUTE[payload.intent]
  if (!route) return null

  if (payload.intent === 'workshops' && payload.context?.workshops?.[0]?.city) {
    return `${route}?city=${encodeURIComponent(payload.context.workshops[0].city)}`
  }

  return route
}

function ContextPreview({ payload }: { payload?: ChatMessage['payload'] }) {
  if (!payload?.context) return null

  const items: string[] = []

  payload.context.workshops?.forEach((workshop) => {
    items.push(`🛠️ ${workshop.name}${workshop.city ? ` · ${workshop.city}` : ''}`)
  })

  payload.context.products?.forEach((product) => {
    items.push(`🧩 ${product.title} · ${product.price}€`)
  })

  payload.context.rentals?.forEach((rental) => {
    items.push(`🚴 ${rental.title} · ${rental.price}€/día`)
  })

  payload.context.services?.forEach((service) => {
    items.push(`🔧 ${service.name} · ${service.workshopName}`)
  })

  if (items.length === 0) return null

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {items.slice(0, 4).map((item) => (
        <Typography key={item} variant="caption" sx={{ opacity: 0.9 }}>
          {item}
        </Typography>
      ))}
    </Stack>
  )
}

export function BusinessAssistantWidget() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Necesito un taller en Palma',
    'Quiero alquilar una bici',
    'Tengo un problema con una reserva',
  ])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: '¡Hola! Soy el asistente de RodaMallorca. Puedo ayudarte con talleres, productos, alquileres, servicios o escalar incidencias a soporte.',
    },
  ])

  const sendMessage = async (text: string) => {
    const message = text.trim()
    if (!message || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const response = await assistantChat(message, conversationId)
      setConversationId(response.conversationId)
      setSuggestions(response.suggestions)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
          payload: {
            intent: response.intent,
            context: response.context,
          },
        },
      ])

      if (response.escalated) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Si quieres, dime qué error te salió y te ayudo a dejar el reporte listo para soporte.',
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Ahora mismo no puedo responder. Prueba de nuevo en unos segundos.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1400,
          boxShadow: 6,
        }}
        aria-label="Abrir asistente"
      >
        {open ? <Close /> : <SupportAgent />}
      </Fab>

      {open && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 90,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            maxWidth: 400,
            height: 520,
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesome fontSize="small" />
              <Typography fontWeight={700}>Asistente RodaMallorca</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={1} sx={{ p: 1.5, flex: 1, overflowY: 'auto', bgcolor: '#f8fafc' }}>
            {messages.map((message, idx) => {
              const route = buildRouteFromPayload(message.payload)

              return (
                <Box
                  key={`${message.role}-${idx}`}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: message.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                  <ContextPreview payload={message.payload} />

                  {route && (
                    <Chip
                      size="small"
                      icon={<OpenInNew />}
                      label="Ver resultados"
                      onClick={() => navigate(route)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )
            })}
            {loading && (
              <Box sx={{ alignSelf: 'flex-start', px: 1 }}>
                <CircularProgress size={18} />
              </Box>
            )}
          </Stack>

          <Box sx={{ px: 1.5, pt: 1, pb: 0.5, borderTop: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              {suggestions.slice(0, 3).map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  size="small"
                  onClick={() => {
                    void sendMessage(suggestion)
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
            <TextField
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void sendMessage(input)
                }
              }}
              placeholder="Escribe tu consulta..."
              fullWidth
              size="small"
            />
            <IconButton
              color="primary"
              onClick={() => {
                void sendMessage(input)
              }}
              disabled={loading || !input.trim()}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  )
}
