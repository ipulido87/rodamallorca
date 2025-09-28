import {
  ArrowBackIos,
  ArrowForwardIos,
  Close,
  Fullscreen,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material'
import {
  Backdrop,
  Box,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  Fab,
  IconButton,
  ImageList,
  ImageListItem,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'

interface ProductImage {
  id: string
  original: string
  medium: string
  thumbnail: string
  position: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productTitle: string
}

export const ProductImageGallery = ({
  images,
  productTitle,
}: ProductImageGalleryProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({})
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })

  const zoomImageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentImage = images[selectedIndex]

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }, [selectedIndex])

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }))
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 1))
    if (zoomLevel <= 1) {
      setPanPosition({ x: 0, y: 0 })
    }
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Pan functionality for zoomed images
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoomLevel((prev) => Math.min(Math.max(prev * delta, 1), 5))
  }

  if (!images || images.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <Box
          sx={{
            height: '100%',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <ZoomIn sx={{ fontSize: 48, mb: 1 }} />
            <Box>No images available</Box>
          </Box>
        </Box>
      </Card>
    )
  }
  console.log('Final adapted images:', images)

  return (
    <Box>
      {/* Main Image Display */}
      <Card
        sx={{
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'zoom-in',
        }}
        onClick={() => setZoomOpen(true)}
      >
        <Box sx={{ position: 'relative', height: 400 }}>
          {!imageLoaded[selectedIndex] && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
            />
          )}

          <CardMedia
            component="img"
            image={currentImage.medium}
            alt={`${productTitle} - Image ${selectedIndex + 1}`}
            onLoad={() => handleImageLoad(selectedIndex)}
            sx={{
              height: 400,
              objectFit: 'cover',
              opacity: imageLoaded[selectedIndex] ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Overlay controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
            }}
          >
            <Fab
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setZoomOpen(true)
              }}
              sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
            >
              <Fullscreen />
            </Fab>
          </Box>

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <ArrowBackIos />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              {selectedIndex + 1} / {images.length}
            </Box>
          )}
        </Box>
      </Card>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <ImageList
          cols={isMobile ? 4 : 6}
          gap={8}
          sx={{
            height: 'auto',
            '& .MuiImageListItem-root': {
              cursor: 'pointer',
              borderRadius: 1,
              overflow: 'hidden',
            },
          }}
        >
          {images.map((image, index) => (
            <ImageListItem
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              sx={{
                border: selectedIndex === index ? 3 : 1,
                borderColor:
                  selectedIndex === index ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <img
                src={image.thumbnail}
                alt={`${productTitle} thumbnail ${index + 1}`}
                loading="lazy"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Zoom Dialog */}
      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.9)',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0,0,0,0.95)' },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => setZoomOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <Close />
          </IconButton>

          {/* Zoom controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <IconButton
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <ZoomIn />
            </IconButton>
            <IconButton
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <ZoomOut />
            </IconButton>
          </Box>

          {/* Navigation in zoom */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ArrowBackIos />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Zoomable image */}
          <img
            ref={zoomImageRef}
            src={currentImage.original}
            alt={`${productTitle} - Full size`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${zoomLevel}) translate(${
                panPosition.x / zoomLevel
              }px, ${panPosition.y / zoomLevel}px)`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              cursor:
                zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              userSelect: 'none',
            }}
            draggable={false}
          />

          {/* Zoom level indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
