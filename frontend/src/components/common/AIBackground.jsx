import { motion } from 'framer-motion'

/**
 * AI-Style Background Component - Light Blue Theme
 * Full-screen background with animated AI elements and blue glow effects
 * NO blinking - only smooth transform animations
 */
export default function AIBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50" />
      
      {/* Animated gradient orbs - Only transform animations, NO opacity */}
      <motion.div
        className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-br from-cyan-400/50 via-blue-400/40 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-to-tr from-blue-400/45 via-indigo-400/35 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/40 via-purple-400/30 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Additional orbs - Only scale, NO opacity */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-300/35 to-blue-300/25 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-300/30 to-indigo-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.18, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      {/* Static AI circuit lines - NO animations at all */}
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ai-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="50%" stopColor="rgba(14, 165, 233, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="ai-glow-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.5)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
          </linearGradient>
        </defs>
        
        {/* Static connecting lines */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5) * Math.PI / 180
          const centerX = 50
          const centerY = 50
          const radius1 = 15 + (i % 4) * 8
          const radius2 = 25 + (i % 4) * 12
          const x1 = centerX + radius1 * Math.cos(angle)
          const y1 = centerY + radius1 * Math.sin(angle)
          const x2 = centerX + radius2 * Math.cos(angle)
          const y2 = centerY + radius2 * Math.sin(angle)
          return (
            <line
              key={`line-${i}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#ai-glow-gradient)"
              strokeWidth="1.5"
              opacity="0.3"
            />
          )
        })}
        
        {/* Static radial lines */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15) * Math.PI / 180
          const centerX = 50
          const centerY = 50
          const radius = 10 + (i % 5) * 6
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          return (
            <line
              key={`radial-${i}`}
              x1="50%"
              y1="50%"
              x2={`${x}%`}
              y2={`${y}%`}
              stroke="url(#ai-glow-gradient)"
              strokeWidth="0.8"
              opacity="0.2"
            />
          )
        })}
        
        {/* Static nodes - NO animations */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5) * Math.PI / 180
          const centerX = 50
          const centerY = 50
          const radius = 20 + (i % 5) * 8
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          return (
            <circle
              key={`node-${i}`}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="url(#ai-glow-gradient-2)"
              opacity="0.5"
            />
          )
        })}
      </svg>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(219, 234, 254, 0.4) 50%, rgba(191, 219, 254, 0.3) 100%)'
        }}
      />
      
      {/* Static floating particles - NO opacity animations, only position */}
      {Array.from({ length: 12 }).map((_, i) => {
        const positions = [
          { top: '10%', left: '15%' },
          { top: '25%', right: '20%' },
          { bottom: '30%', left: '18%' },
          { bottom: '15%', right: '22%' },
          { top: '50%', left: '10%' },
          { top: '20%', right: '12%' },
          { top: '70%', left: '25%' },
          { bottom: '50%', right: '15%' },
          { top: '40%', left: '5%' },
          { bottom: '25%', left: '30%' },
          { top: '60%', right: '8%' },
          { bottom: '40%', left: '8%' },
        ]
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md shadow-lg shadow-cyan-400/40 opacity-50"
            style={positions[i]}
            animate={{
              scale: [1, 1.2, 1],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        )
      })}
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-white/10" />
    </div>
  )
}
