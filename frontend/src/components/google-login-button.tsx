import GoogleIcon from '@mui/icons-material/Google'
import { Button } from '@mui/material'

export function GoogleLoginButton() {
  // En tu GoogleLoginButton, agrega un callback URL
  const handleLogin = () => {
    const base = import.meta.env.VITE_API_URL
    const callbackUrl = `${window.location.origin}/auth/callback`
    window.location.href = `${base}/auth/google?redirect=${encodeURIComponent(
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
