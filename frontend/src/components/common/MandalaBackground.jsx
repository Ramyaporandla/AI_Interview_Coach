import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

// Classic intricate mandala SVG pattern - traditional design with more detail
const ClassicMandalaSVG = ({ 
  className = '', 
  opacity = 0.1, 
  size = 200, 
  strokeColor = '#38240D',
  hovered = false,
  mouseX = 0,
  mouseY = 0
}) => {
  const scale = hovered ? 1.1 : 1
  const glowOpacity = hovered ? opacity * 1.5 : opacity
  
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        opacity: glowOpacity,
        transform: `scale(${scale})`,
        transition: 'all 0.3s ease-out',
        filter: hovered ? 'drop-shadow(0 0 20px rgba(227, 83, 54, 0.3))' : 'none'
      }}
      width={size}
      height={size}
    >
      {/* Outer decorative rings - classic mandala style */}
      <circle cx="100" cy="100" r="92" fill="none" stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />
      <circle cx="100" cy="100" r="88" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.5" />
      <circle cx="100" cy="100" r="85" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.4" />
      
      {/* Middle rings with decorative patterns */}
      <circle cx="100" cy="100" r="75" fill="none" stroke={strokeColor} strokeWidth="0.7" opacity="0.6" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      <circle cx="100" cy="100" r="65" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.4" />
      <circle cx="100" cy="100" r="55" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.4" />
      
      {/* Classic lotus petal patterns - outer ring (16 petals) */}
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 78 * Math.cos(rad)
        const y = 100 + 78 * Math.sin(rad)
        return (
          <g key={`petal-outer-${i}`}>
            <circle cx={x} cy={y} r="5" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.6" />
            <circle cx={x} cy={y} r="3" fill={strokeColor} opacity="0.4" />
          </g>
        )
      })}
      
      {/* Middle ring petals (12 petals) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 62 * Math.cos(rad)
        const y = 100 + 62 * Math.sin(rad)
        return (
          <g key={`petal-mid-${i}`}>
            <circle cx={x} cy={y} r="6" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.7" />
            <circle cx={x} cy={y} r="4" fill={strokeColor} opacity="0.5" />
          </g>
        )
      })}
      
      {/* Inner decorative elements - classic geometric patterns */}
      <circle cx="100" cy="100" r="38" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.6" />
      <circle cx="100" cy="100" r="32" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      <circle cx="100" cy="100" r="28" fill="none" stroke={strokeColor} strokeWidth="0.4" opacity="0.4" />
      <circle cx="100" cy="100" r="22" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      
      {/* Classic lotus center - 8 petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 18 * Math.cos(rad)
        const y1 = 100 + 18 * Math.sin(rad)
        const x2 = 100 + 25 * Math.cos(rad)
        const y2 = 100 + 25 * Math.sin(rad)
        return (
          <line
            key={`lotus-petal-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.6"
            opacity="0.7"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Center flower */}
      <circle cx="100" cy="100" r="15" fill="none" stroke={strokeColor} strokeWidth="0.7" opacity="0.8" />
      <circle cx="100" cy="100" r="10" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.7" />
      <circle cx="100" cy="100" r="6" fill={strokeColor} opacity="0.6" />
      <circle cx="100" cy="100" r="3" fill={strokeColor} opacity="0.8" />
      
      {/* Connecting lines - outer (8 lines) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 50 * Math.cos(rad)
        const y1 = 100 + 50 * Math.sin(rad)
        const x2 = 100 + 70 * Math.cos(rad)
        const y2 = 100 + 70 * Math.sin(rad)
        return (
          <line
            key={`line-outer-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.5"
            opacity="0.5"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Connecting lines - middle (12 lines) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 28 * Math.cos(rad)
        const y1 = 100 + 28 * Math.sin(rad)
        const x2 = 100 + 38 * Math.cos(rad)
        const y2 = 100 + 38 * Math.sin(rad)
        return (
          <line
            key={`line-mid-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.4"
            opacity="0.4"
            strokeLinecap="round"
          />
        )
      })}
      
      {/* Decorative dots - classic pattern (8 dots) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 45 * Math.cos(rad)
        const y = 100 + 45 * Math.sin(rad)
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r="2.5" fill={strokeColor} opacity="0.6" />
        )
      })}
      
      {/* Inner decorative dots (6 dots) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 100 + 20 * Math.cos(rad)
        const y = 100 + 20 * Math.sin(rad)
        return (
          <circle key={`inner-dot-${i}`} cx={x} cy={y} r="2" fill={strokeColor} opacity="0.7" />
        )
      })}
    </svg>
  )
}

// Interactive Mandala Component with mouse tracking
const InteractiveMandala = ({ position, size, opacity, strokeColor, rotationSpeed }) => {
  const [hovered, setHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 50, stiffness: 100 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5])
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!hovered) return
      
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const mandalaElement = elements.find(el => el.closest('[data-mandala]'))
      
      if (mandalaElement) {
        const rect = mandalaElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const xPos = (e.clientX - centerX) / (rect.width / 2)
        const yPos = (e.clientY - centerY) / (rect.height / 2)
        
        mouseX.set(xPos * 0.3)
        mouseY.set(yPos * 0.3)
        setMousePosition({ x: xPos, y: yPos })
      }
    }
    
    if (hovered) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    } else {
      mouseX.set(0)
      mouseY.set(0)
      setMousePosition({ x: 0, y: 0 })
    }
  }, [hovered, mouseX, mouseY])
  
  const rotationDirection = position === 'top-right' || position === 'bottom-left' 
    ? [0, 360] 
    : [360, 0]

  // Position styles
  const positionStyles = {
    'top-right': { top: '10px', right: '5px' },
    'bottom-left': { bottom: '10px', left: '5px' },
    'top-left': { top: '32px', left: '8px' },
    'bottom-right': { bottom: '32px', right: '8px' },
  }

  return (
    <motion.div
      data-mandala={position}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        mouseX.set(0)
        mouseY.set(0)
      }}
      animate={{
        rotate: rotationDirection,
        scale: hovered ? 1.08 : 1,
      }}
      style={{
        ...positionStyles[position],
        width: `${size}px`,
        height: `${size}px`,
        rotateX: hovered ? rotateX : 0,
        rotateY: hovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        cursor: hovered ? 'pointer' : 'default',
      }}
      transition={{
        rotate: {
          duration: rotationSpeed,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      className="absolute transition-all duration-300"
    >
      {/* Light mode */}
      <div className="dark:hidden">
        <ClassicMandalaSVG 
          className="w-full h-full" 
          opacity={opacity} 
          strokeColor={strokeColor || "#38240D"}
          hovered={hovered}
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
        />
      </div>
      {/* Dark mode */}
      <div className="hidden dark:block">
        <ClassicMandalaSVG 
          className="w-full h-full" 
          opacity={opacity * 0.8} 
          strokeColor="#FDFBD4"
          hovered={hovered}
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
        />
      </div>
    </motion.div>
  )
}

export default function MandalaBackground() {
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })
  
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  const isMobile = windowSize.width < 768
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto -z-10">
      {/* Top-right mandala - larger, interactive */}
      <InteractiveMandala
        position="top-right"
        size={isMobile ? 320 : 400}
        opacity={0.18}
        strokeColor="#38240D"
        rotationSpeed={35}
      />

      {/* Bottom-left mandala - medium, interactive */}
      <InteractiveMandala
        position="bottom-left"
        size={isMobile ? 288 : 360}
        opacity={0.16}
        strokeColor="#38240D"
        rotationSpeed={45}
      />

      {/* Small corner mandala - top-left, interactive */}
      <InteractiveMandala
        position="top-left"
        size={isMobile ? 224 : 256}
        opacity={0.14}
        strokeColor="#38240D"
        rotationSpeed={30}
      />

      {/* Bottom-right small mandala - interactive */}
      <InteractiveMandala
        position="bottom-right"
        size={isMobile ? 192 : 224}
        opacity={0.15}
        strokeColor="#38240D"
        rotationSpeed={40}
      />
    </div>
  )
}
