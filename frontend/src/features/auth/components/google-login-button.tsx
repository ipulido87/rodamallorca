import GoogleIcon from '@mui/icons-material/Google'
import { Button } from '@mui/material'
import { API_URL } from '../../../constants/api'

interface GoogleLoginButtonProps {
  role?: 'USER' | 'WORKSHOP_OWNER'
  mode?: 'login' | 'register' // ← AÑADIR este prop
}

export function GoogleLoginButton({
  role = 'USER',
  mode = 'login', // ← Valor por defecto
}: GoogleLoginButtonProps) {
  const handleLogin = () => {
    // ✅ USAR ruta diferente según el modo
    const endpoint =
      mode === 'login'
        ? '/auth/google/login' // ← Nueva ruta para LOGIN (solo verifica)
        : '/auth/google' // ← Ruta original para REGISTRO (crea usuarios)

    const callbackUrl = `${window.location.origin}/auth/callback`
    window.location.href = `${API_URL}${endpoint}?role=${role}&redirect=${encodeURIComponent(
      callbackUrl
    )}`
  }

  return (
    <Button
      variant="outlined"
      fullWidth
      size="large"
      startIcon={<GoogleIcon />}
      onClick={handleLogin}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        color: '#555',
        borderColor: '#ccc',
        '&:hover': {
          borderColor: '#999',
          backgroundColor: '#f7f7f7',
        },
      }}
    >
      Continuar con Google
    </Button>
  )
}
