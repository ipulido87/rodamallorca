import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido a Rodamallorca!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Has iniciado sesión correctamente.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4 }}
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Container>
  );
};
