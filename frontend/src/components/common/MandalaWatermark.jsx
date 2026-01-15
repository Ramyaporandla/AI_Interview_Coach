import { motion } from 'framer-motion'
import { useState } from 'react'

// Classic intricate mandala watermark SVG - traditional design
const ClassicMandalaSVG = ({ opacity = 0.08, size = 200, strokeColor = '#38240D', hovered = false }) => {
  const scale = hovered ? 1.15 : 1
  const glowOpacity = hovered ? opacity * 2 : opacity
  
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        opacity: glowOpacity,
        transform: `scale(${scale})`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: hovered ? 'drop-shadow(0 0 25px rgba(227, 83, 54, 0.4))' : 'none'
      }}
      width={size}
      height={size}
    >
      {/* Outer decorative rings - classic mandala style */}
      <circle cx="100" cy="100" r="88" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.6" />
      <circle cx="100" cy="100" r="82" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.5" />
      <circle cx="100" cy="100" r="76" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
      
      {/* Middle rings with decorative patterns */}
      <circle cx="100" cy="100" r="68" fill="none" stroke={strokeColor} strokeWidth="0.45" opacity="0.6" />
      <circle cx="100" cy="100" r="62" fill="none" stroke={strokeColor} strokeWidth="0.35" opacity="0.5" />
      <circle cx="100" cy="100" r="56" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
      <circle cx="100" cy="100" r="48" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.5" />
      <circle cx="100" cy="100" r="42" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
      
      {/* Classic lotus petal patterns - outer ring (16 petals) */}
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 75 * Math.cos(rad)
        const y = 100 + 75 * Math.sin(rad)
        return (
          <g key={`petal-outer-${i}`}>
            <circle cx={x} cy={y} r="4" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.6" />
            <circle cx={x} cy={y} r="2.5" fill={strokeColor} opacity="0.5" />
          </g>
        )
      })}
      
      {/* Middle ring petals (12 petals) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 55 * Math.cos(rad)
        const y = 100 + 55 * Math.sin(rad)
        return (
          <g key={`petal-mid-${i}`}>
            <circle cx={x} cy={y} r="5" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.7" />
            <circle cx={x} cy={y} r="3" fill={strokeColor} opacity="0.6" />
          </g>
        )
      })}
      
      {/* Inner decorative elements - classic geometric patterns */}
      <circle cx="100" cy="100" r="36" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.6" />
      <circle cx="100" cy="100" r="30" fill="none" stroke={strokeColor} strokeWidth="0.35" opacity="0.5" />
      <circle cx="100" cy="100" r="26" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
      <circle cx="100" cy="100" r="22" fill="none" stroke={strokeColor} strokeWidth="0.35" opacity="0.5" />
      
      {/* Classic lotus center - 8 petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 18 * Math.cos(rad)
        const y1 = 100 + 18 * Math.sin(rad)
        const x2 = 100 + 24 * Math.cos(rad)
        const y2 = 100 + 24 * Math.sin(rad)
        return (
          <line
            key={`lotus-petal-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.5"
            opacity="0.7"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Center flower */}
      <circle cx="100" cy="100" r="14" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.8" />
      <circle cx="100" cy="100" r="10" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.7" />
      <circle cx="100" cy="100" r="6" fill={strokeColor} opacity="0.7" />
      <circle cx="100" cy="100" r="3" fill={strokeColor} opacity="0.9" />
      
      {/* Connecting lines - outer (8 lines) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 48 * Math.cos(rad)
        const y1 = 100 + 48 * Math.sin(rad)
        const x2 = 100 + 68 * Math.cos(rad)
        const y2 = 100 + 68 * Math.sin(rad)
        return (
          <line
            key={`line-outer-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.4"
            opacity="0.5"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Connecting lines - middle (12 lines) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 22 * Math.cos(rad)
        const y1 = 100 + 22 * Math.sin(rad)
        const x2 = 100 + 30 * Math.cos(rad)
        const y2 = 100 + 30 * Math.sin(rad)
        return (
          <line
            key={`line-mid-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.3"
            opacity="0.4"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Decorative dots - classic pattern (8 dots) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 38 * Math.cos(rad)
        const y = 100 + 38 * Math.sin(rad)
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r="2" fill={strokeColor} opacity="0.7" />
        )
      })}
      
      {/* Inner decorative dots (6 dots) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 20 * Math.cos(rad)
        const y = 100 + 20 * Math.sin(rad)
        return (
          <circle key={`inner-dot-${i}`} cx={x} cy={y} r="1.5" fill={strokeColor} opacity="0.8" />
        )
      })}
    </svg>
  )
}

export default function MandalaWatermark({ 
  position = 'top-right', 
  size = 200, 
  opacity = 0.08,
  rotate = true,
  strokeColor = '#38240D'
}) {
  const [hovered, setHovered] = useState(false)
  
  const rotationDirection = position === 'top-right' || position === 'bottom-left' 
    ? [0, 360] 
    : [360, 0]

  const duration = position === 'top-right' ? 35 : position === 'bottom-left' ? 45 : 30

  // Determine stroke color based on theme
  const lightColor = strokeColor || '#38240D'
  const darkColor = '#FDFBD4'

  if (rotate) {
    return (
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          rotate: rotationDirection,
          scale: hovered ? 1.1 : 1,
        }}
        transition={{
          rotate: {
            duration,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 0.3,
            ease: "easeOut"
          }
        }}
        className="pointer-events-auto cursor-pointer transition-all duration-300"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Light mode */}
        <div className="dark:hidden">
          <ClassicMandalaSVG opacity={opacity} size={size} strokeColor={lightColor} hovered={hovered} />
        </div>
        {/* Dark mode */}
        <div className="hidden dark:block">
          <ClassicMandalaSVG opacity={opacity * 0.7} size={size} strokeColor={darkColor} hovered={hovered} />
        </div>
      </motion.div>
    )
  }

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="pointer-events-auto cursor-pointer transition-all duration-300"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Light mode */}
      <div className="dark:hidden">
        <ClassicMandalaSVG opacity={opacity} size={size} strokeColor={lightColor} hovered={hovered} />
      </div>
      {/* Dark mode */}
      <div className="hidden dark:block">
        <ClassicMandalaSVG opacity={opacity * 0.7} size={size} strokeColor={darkColor} hovered={hovered} />
      </div>
    </div>
  )
}
