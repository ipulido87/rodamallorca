import {
  AutoAwesome,
  Close,
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
import { useTranslation } from 'react-i18next'
import { assistantChat } from '../services/assistant-service'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export function BusinessAssistantWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [suggestions, setSuggestions] = useState<string[]>([
    t('assistant.suggestion1'),
    t('assistant.suggestion2'),
    t('assistant.suggestion3'),
  ])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: t('assistant.greeting'),
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
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }])

      if (response.escalated) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: t('assistant.escalatedMessage'),
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: t('assistant.errorMessage'),
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
        aria-label={t('assistant.openAssistant')}
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
              <Typography fontWeight={700}>{t('assistant.title')}</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={1} sx={{ p: 1.5, flex: 1, overflowY: 'auto', bgcolor: '#f8fafc' }}>
            {messages.map((message, idx) => (
              <Box
                key={`${message.role}-${idx}`}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
              </Box>
            ))}
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
                  onClick={() => sendMessage(suggestion)}
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
              placeholder={t('assistant.inputPlaceholder')}
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
