import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Container } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { StripeConnectDiagnostic } from '../components/stripe-connect-diagnostic'

export const StripeDiagnosticPage = () => {
  const { workshopId } = useParams<{ workshopId: string }>()
  const navigate = useNavigate()

  if (!workshopId) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <p>Workshop ID no proporcionado</p>
          <Button onClick={() => navigate('/my-workshops')}>Volver a Mis Talleres</Button>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ py: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/my-workshops')}
            sx={{ mb: 2 }}
          >
            Volver a Mis Talleres
          </Button>
        </Box>
      </Container>
      <StripeConnectDiagnostic workshopId={workshopId} />
    </>
  )
}
