import { Box, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../features/auth/hooks/useAuth';

export const Home = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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
