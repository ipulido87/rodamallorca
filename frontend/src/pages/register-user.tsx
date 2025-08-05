import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMAIL_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants/validation';
import { register } from '../services/auth-service';

interface RegisterFormData {
  email: string;
  password: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await register(formData.email, formData.password);
      setAlertMessage('✅ Registro exitoso. Ahora inicia sesión.');
      setAlertSeverity('success');
      setAlertOpen(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 409) {
        setAlertMessage('⚠️ El correo ya está registrado');
      } else if (error.response?.status === 400) {
        setAlertMessage('❌ Datos inválidos. Revisa los campos.');
      } else {
        setAlertMessage('❌ Error al registrarse');
      }

      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Registro
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ minLength: EMAIL_MIN_LENGTH }}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ minLength: PASSWORD_MIN_LENGTH }}
          />

          {alertOpen && (
            <Alert
              severity={alertSeverity}
              onClose={handleCloseAlert}
              sx={{
                mb: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.warning.light,
                color: theme.palette.warning.contrastText,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {alertMessage}
            </Alert>
          )}

          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
            Registrarse
          </Button>
          <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate('/login')}>
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
