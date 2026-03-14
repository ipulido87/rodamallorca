import { IconButton, Menu, MenuItem, Typography, Stack } from '@mui/material'
import { Language } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../../i18n/i18n'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const currentLang = supportedLanguages.find((l) => l.code === i18n.language) || supportedLanguages[0]

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color: 'inherit',
          fontSize: 14,
          gap: 0.5,
          borderRadius: 2,
          px: 1,
        }}
      >
        <Language sx={{ fontSize: 20 }} />
        <Typography variant="caption" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {currentLang.flag}
        </Typography>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 160 } } }}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === i18n.language}
            onClick={() => {
              i18n.changeLanguage(lang.code)
              setAnchorEl(null)
            }}
            sx={{ borderRadius: 1, mx: 0.5, my: 0.25 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <span>{lang.flag}</span>
              <Typography variant="body2" fontWeight={500}>
                {lang.label}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
