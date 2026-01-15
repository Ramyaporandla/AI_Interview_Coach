import { motion } from 'framer-motion'

// Tech-aesthetic mandala SVG - geometric, minimal, Stripe/Linear style
// Thin strokes, no heavy fills, subtle and professional
const TechMandalaSVG = ({ className = '', opacity = 0.06, size = 300, strokeColor = '#713600', glowColor = '#C05800' }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    width={size}
    height={size}
  >
    {/* Outer rings - minimal, geometric */}
    <circle cx="100" cy="100" r="85" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
    <circle cx="100" cy="100" r="75" fill="none" stroke={strokeColor} strokeWidth="0.25" opacity="0.3" />
    
    {/* Middle rings */}
    <circle cx="100" cy="100" r="60" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
    <circle cx="100" cy="100" r="50" fill="none" stroke={strokeColor} strokeWidth="0.25" opacity="0.3" />
    
    {/* Inner core */}
    <circle cx="100" cy="100" r="35" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.4" />
    <circle cx="100" cy="100" r="25" fill="none" stroke={strokeColor} strokeWidth="0.25" opacity="0.3" />
    
    {/* Geometric nodes - tech aesthetic (8 nodes) */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180
      const x = 100 + 70 * Math.cos(rad)
      const y = 100 + 70 * Math.sin(rad)
      return (
        <g key={`node-${i}`}>
          {/* Subtle glow accent */}
          <circle cx={x} cy={y} r="3" fill={glowColor} opacity="0.15" />
          {/* Node */}
          <circle cx={x} cy={y} r="1.5" fill={strokeColor} opacity="0.5" />
        </g>
      )
    })}
    
    {/* Inner nodes (6 nodes) */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180
      const x = 100 + 40 * Math.cos(rad)
      const y = 100 + 40 * Math.sin(rad)
      return (
        <circle key={`inner-node-${i}`} cx={x} cy={y} r="1" fill={strokeColor} opacity="0.4" />
      )
    })}
    
    {/* Connecting lines - minimal tech feel (8 lines) */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180
      const x1 = 100 + 25 * Math.cos(rad)
      const y1 = 100 + 25 * Math.sin(rad)
      const x2 = 100 + 50 * Math.cos(rad)
      const y2 = 100 + 50 * Math.sin(rad)
      return (
        <line
          key={`line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth="0.2"
          opacity="0.3"
          strokeLinecap="round"
        />
      )
    })}
    
    {/* Radial lines from center (6 lines) */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180
      const x1 = 100 + 25 * Math.cos(rad)
      const y1 = 100 + 25 * Math.sin(rad)
      const x2 = 100 + 35 * Math.cos(rad)
      const y2 = 100 + 35 * Math.sin(rad)
      return (
        <line
          key={`radial-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth="0.2"
          opacity="0.25"
          strokeLinecap="round"
        />
      )
    })}
    
    {/* Center node with subtle glow */}
    <circle cx="100" cy="100" r="2" fill={glowColor} opacity="0.2" />
    <circle cx="100" cy="100" r="1" fill={strokeColor} opacity="0.5" />
  </svg>
)

export default function AnimatedMandalaLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Top-right mandala - slow rotation + breathing */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute top-10 right-10 w-96 h-96 md:w-[500px] md:h-[500px]"
      >
        {/* Light mode */}
        <div className="dark:hidden">
          <TechMandalaSVG 
            className="w-full h-full" 
            opacity={0.06}
            size={500}
            strokeColor="#713600"
            glowColor="#C05800"
          />
        </div>
        {/* Dark mode */}
        <div className="hidden dark:block">
          <TechMandalaSVG 
            className="w-full h-full" 
            opacity={0.04}
            size={500}
            strokeColor="#FDFBD4"
            glowColor="#C05800"
          />
        </div>
      </motion.div>

      {/* Bottom-left mandala - counter rotation + breathing */}
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          rotate: {
            duration: 42,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute bottom-10 left-10 w-80 h-80 md:w-[450px] md:h-[450px]"
      >
        {/* Light mode */}
        <div className="dark:hidden">
          <TechMandalaSVG 
            className="w-full h-full" 
            opacity={0.05}
            size={450}
            strokeColor="#713600"
            glowColor="#C05800"
          />
        </div>
        {/* Dark mode */}
        <div className="hidden dark:block">
          <TechMandalaSVG 
            className="w-full h-full" 
            opacity={0.035}
            size={450}
            strokeColor="#FDFBD4"
            glowColor="#C05800"
          />
        </div>
      </motion.div>
    </div>
  )
}

