import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import { Seo } from '../../shared/components/Seo'

interface InfoPageProps {
  title: string
  description: string
  canonicalPath: string
  sections: Array<{
    heading: string
    content: string
  }>
}

export const InfoPage = ({
  title,
  description,
  canonicalPath,
  sections,
}: InfoPageProps) => {
  return (
    <>
      <Seo
        title={`${title} | RodaMallorca`}
        description={description}
        canonicalPath={canonicalPath}
        keywords="alquiler bicicletas Mallorca, talleres de bicicletas, ciclismo Mallorca"
      />

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {description}
            </Typography>

            <Stack spacing={3}>
              {sections.map((section) => (
                <Box key={section.heading}>
                  <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 1 }}>
                    {section.heading}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  )
}
