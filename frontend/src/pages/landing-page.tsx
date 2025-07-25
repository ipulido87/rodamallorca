import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido a RodaMallorca
        </Typography>
        <Typography variant="body1" gutterBottom>
          Por favor, inicia sesión o regístrate para continuar.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/register')}>
            Registrarse
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
