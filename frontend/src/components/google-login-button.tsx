import GoogleIcon from '@mui/icons-material/Google'
import { Button } from '@mui/material'

export function GoogleLoginButton() {
  const handleLogin = () => {
    const base = import.meta.env.VITE_API_URL
    window.location.href = `${base}/auth/google`
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
