import { amber, blue, blueGrey, indigo, red, teal } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: indigo[600], // Azul profundo Mediterráneo
      light: indigo[400], // Para gradientes y hover
      dark: indigo[800], // Para texto y contraste
    },
    secondary: {
      main: blueGrey[500], // Gris azulado como las piedras de Mallorca
      light: blueGrey[300], // Para fondos sutiles
      dark: blueGrey[700], // Para texto secundario
    },
    success: {
      main: teal[500], // Verde agua mediterráneo
      light: teal[300], // Para fondos success
      dark: teal[700], // Para contraste
    },
    warning: {
      main: amber[600], // Naranja atardecer mallorquín
      light: amber[400], // Para backgrounds
      dark: amber[800], // Para texto
    },
    info: {
      main: blue[500], // Azul cielo
      light: blue[300],
      dark: blue[700],
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f8fafc', // Blanco roto más cálido
      paper: '#ffffff', // Blanco puro para cards
    },
    text: {
      primary: '#1e293b', // Gris muy oscuro, más cálido que negro
      secondary: '#64748b', // Gris medio
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Más redondeado, más moderno
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Cards más redondeadas
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
  },
})
