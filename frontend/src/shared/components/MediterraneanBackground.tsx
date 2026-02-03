import { Box, keyframes } from '@mui/material'

// Gradient animation - Mediterranean sunset colors
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

// Wave animation
const waveMove = keyframes`
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-25px) translateY(3px);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
`

// Road line animation (cyclist moving)
const roadPulse = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`

// Sun rays rotation
const sunRays = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

// Floating particles (light reflections on water)
const floatUp = keyframes`
  0% {
    transform: translateY(100%) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
`

export function MediterraneanBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        // Animated gradient - Mallorca sunset colors
        background: `linear-gradient(
          135deg,
          #1a237e 0%,
          #0d47a1 15%,
          #0288d1 30%,
          #00acc1 45%,
          #26c6da 55%,
          #ff7043 70%,
          #ff5722 85%,
          #bf360c 100%
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
      }}
    >
      {/* Serra de Tramuntana Mountains Silhouette */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: 0,
          width: '100%',
          height: 'auto',
          opacity: 0.3,
        }}
      >
        <path
          fill="#1a237e"
          d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>

      {/* Route 312 - Winding Road */}
      <Box
        component="svg"
        viewBox="0 0 1440 400"
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: 0,
          width: '100%',
          height: 'auto',
          opacity: 0.4,
        }}
      >
        <path
          d="M-50,300 Q200,250 400,280 T800,260 T1200,290 T1500,250"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="4"
          strokeDasharray="20,10"
          style={{
            animation: 'roadPulse 3s linear infinite',
          }}
        />
        {/* Road center line */}
        <path
          d="M-50,300 Q200,250 400,280 T800,260 T1200,290 T1500,250"
          fill="none"
          stroke="rgba(255,193,7,0.8)"
          strokeWidth="2"
          strokeDasharray="30,20"
          style={{
            strokeDashoffset: 1000,
            animation: 'roadPulse 8s linear infinite',
          }}
        />
      </Box>

      {/* Mediterranean Waves - Layer 1 */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '110%',
          height: '120px',
          animation: `${waveMove} 8s ease-in-out infinite`,
        }}
      >
        <path
          fill="rgba(2, 136, 209, 0.4)"
          d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>

      {/* Mediterranean Waves - Layer 2 */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '-5%',
          width: '110%',
          height: '100px',
          animation: `${waveMove} 6s ease-in-out infinite`,
          animationDelay: '-2s',
        }}
      >
        <path
          fill="rgba(0, 172, 193, 0.5)"
          d="M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,197.3C672,192,768,224,864,234.7C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>

      {/* Mediterranean Waves - Layer 3 (front) */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '105%',
          height: '80px',
          animation: `${waveMove} 4s ease-in-out infinite`,
          animationDelay: '-1s',
        }}
      >
        <path
          fill="rgba(38, 198, 218, 0.6)"
          d="M0,288L48,272C96,256,192,224,288,224C384,224,480,256,576,261.3C672,267,768,245,864,224C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>

      {/* Sun with rays */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffeb3b 0%, #ff9800 50%, transparent 70%)',
          boxShadow: '0 0 60px rgba(255, 152, 0, 0.6), 0 0 100px rgba(255, 193, 7, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `
              repeating-conic-gradient(
                from 0deg,
                transparent 0deg 8deg,
                rgba(255, 193, 7, 0.1) 8deg 10deg
              )
            `,
            animation: `${sunRays} 60s linear infinite`,
          },
        }}
      />

      {/* Light particles floating (water reflections) */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            animation: `${floatUp} ${8 + Math.random() * 12}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Cyclist silhouette on the road */}
      <Box
        component="svg"
        viewBox="0 0 64 64"
        sx={{
          position: 'absolute',
          bottom: '18%',
          left: '20%',
          width: 40,
          height: 40,
          opacity: 0.5,
          animation: `${waveMove} 4s ease-in-out infinite`,
        }}
      >
        <path
          fill="#1a237e"
          d="M50,38c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10S55.5,38,50,38z M50,54c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S53.3,54,50,54z M14,38c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10S19.5,38,14,38z M14,54c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S17.3,54,14,54z M32,20c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4S29.8,20,32,20z M44,32l-8-8l-8,4l-6,10h6l4-6l4,4v12h4V36L44,32z"
        />
      </Box>

      {/* Overlay gradient for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* CSS for road animation */}
      <style>
        {`
          @keyframes roadPulse {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
        `}
      </style>
    </Box>
  )
}
