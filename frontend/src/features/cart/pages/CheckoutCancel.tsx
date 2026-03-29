import { Cancel } from '@mui/icons-material'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export const CheckoutCancel = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <Cancel sx={{ fontSize: 120, color: 'warning.main' }} />

          <Typography variant="h3" fontWeight="bold">
            {t('checkoutCancel.title')}
          </Typography>

          <Typography variant="h6" color="text.secondary">
            {t('checkoutCancel.noCharge')}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {t('checkoutCancel.returnMessage')}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/cart')}
            >
              {t('checkoutCancel.backToCart')}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/catalog')}
            >
              {t('checkoutCancel.continueShopping')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}
