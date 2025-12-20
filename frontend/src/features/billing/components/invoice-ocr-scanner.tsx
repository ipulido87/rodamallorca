import { CameraAlt, Upload, Close, Visibility } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Alert,
} from '@mui/material'
import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'

export interface OcrInvoiceData {
  invoiceNumber?: string
  date?: string
  taxId?: string
  providerName?: string
  amounts?: {
    subtotal?: number
    tax?: number
    total?: number
  }
  concepts?: string[]
}

interface InvoiceOcrScannerProps {
  open: boolean
  onClose: () => void
  onDataExtracted: (data: OcrInvoiceData) => void
}

export const InvoiceOcrScanner = ({ open, onClose, onDataExtracted }: InvoiceOcrScannerProps) => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File) => {
    setLoading(true)
    setProgress(0)
    setError(null)
    setExtractedText('')

    try {
      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Inicializar Tesseract
      const worker = await createWorker('spa', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      // Realizar OCR
      const {
        data: { text },
      } = await worker.recognize(file)

      setExtractedText(text)

      // Parsear el texto para extraer datos de factura
      const invoiceData = parseInvoiceText(text)

      await worker.terminate()

      setLoading(false)
      onDataExtracted(invoiceData)
    } catch (err) {
      console.error('Error en OCR:', err)
      setError('Error al procesar la imagen. Intenta con otra foto más clara.')
      setLoading(false)
    }
  }

  const parseInvoiceText = (text: string): OcrInvoiceData => {
    const data: OcrInvoiceData = {
      concepts: [],
      amounts: {},
    }

    // Buscar número de factura (patrones comunes)
    const invoiceNumberPatterns = [
      /(?:FACTURA|INVOICE|N[°ºª]?)[:\s]*([A-Z0-9\-\/]+)/i,
      /(?:F|FA|INV)[:\s\-]*(\d{4,})/i,
    ]
    for (const pattern of invoiceNumberPatterns) {
      const match = text.match(pattern)
      if (match) {
        data.invoiceNumber = match[1].trim()
        break
      }
    }

    // Buscar fecha (varios formatos)
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    ]
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        data.date = match[1]
        break
      }
    }

    // Buscar NIF/CIF/DNI
    const taxIdPatterns = [
      /(?:NIF|CIF|DNI|VAT)[:\s]*([A-Z0-9]{8,12})/i,
      /\b([A-Z]\d{7,8}[A-Z0-9])\b/,
    ]
    for (const pattern of taxIdPatterns) {
      const match = text.match(pattern)
      if (match) {
        data.taxId = match[1].replace(/\s/g, '').toUpperCase()
        break
      }
    }

    // Buscar nombre del proveedor (primera línea con texto significativo)
    const lines = text.split('\n').filter((line) => line.trim().length > 0)
    if (lines.length > 0) {
      // Buscar la primera línea que parezca un nombre de empresa (con mayúsculas y más de 5 caracteres)
      for (const line of lines.slice(0, 10)) {
        if (line.length > 5 && /[A-Z]/.test(line) && !line.match(/FACTURA|INVOICE|TOTAL/i)) {
          data.providerName = line.trim()
          break
        }
      }
    }

    // Buscar montos (base, IVA, total)
    const amountPatterns = {
      subtotal: /(?:BASE|SUBTOTAL|BASE\s*IMPONIBLE)[:\s]*([0-9.,]+)\s*€?/i,
      tax: /(?:IVA|TAX|VAT)[:\s]*([0-9.,]+)\s*€?/i,
      total: /(?:TOTAL|AMOUNT)[:\s]*([0-9.,]+)\s*€?/i,
    }

    for (const [key, pattern] of Object.entries(amountPatterns)) {
      const match = text.match(pattern)
      if (match) {
        const amount = parseFloat(match[1].replace(',', '.'))
        if (!isNaN(amount)) {
          if (key === 'subtotal') {
            data.amounts!.subtotal = amount
          } else if (key === 'tax') {
            data.amounts!.tax = amount
          } else if (key === 'total') {
            data.amounts!.total = amount
          }
        }
      }
    }

    // Extraer conceptos (líneas que parecen items de factura)
    const conceptLines = text
      .split('\n')
      .filter(
        (line) =>
          line.trim().length > 10 &&
          !line.match(/FACTURA|TOTAL|IVA|FECHA|NIF|CIF/i) &&
          line.match(/[a-záéíóúñ]/i)
      )
      .slice(0, 5) // Máximo 5 conceptos

    data.concepts = conceptLines.map((line) => line.trim())

    return data
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const handleClose = () => {
    setImagePreview(null)
    setExtractedText('')
    setError(null)
    setProgress(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Escanear Factura con OCR</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            Sube una foto o imagen de la factura. El OCR extraerá automáticamente: número de
            factura, fecha, NIF/CIF, proveedor, importes y conceptos.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Subir Imagen
            </Button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CameraAlt />}
              onClick={() => cameraInputRef.current?.click()}
              disabled={loading}
            >
              Tomar Foto
            </Button>
          </Box>

          {loading && (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Procesando imagen con OCR...
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                    {progress}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {imagePreview && !loading && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Imagen procesada:
                </Typography>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Invoice preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                />
              </CardContent>
            </Card>
          )}

          {extractedText && !loading && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">Texto extraído:</Typography>
                  <IconButton size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    maxHeight: 200,
                    overflow: 'auto',
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  {extractedText}
                </Box>
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✓ Datos extraídos correctamente. Se han aplicado al formulario automáticamente.
                </Alert>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
