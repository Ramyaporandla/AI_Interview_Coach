import { motion } from 'framer-motion'

// Elegant animated geometric art patterns for glass cards
// Tech-aesthetic, sophisticated, professional

export default function AnimatedArtPattern({ variant = 'welcome', className = '' }) {
  if (variant === 'welcome') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant floating gradient orbs */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#C05800]/15 via-[#C05800]/8 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#713600]/12 via-[#C05800]/6 to-transparent rounded-full blur-3xl"
        />
        
        {/* Elegant rotating geometric pattern */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute top-8 right-8"
        >
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer elegant rings */}
            <circle cx="70" cy="70" r="60" stroke="#C05800" strokeWidth="0.8" opacity="0.2" fill="none" />
            <circle cx="70" cy="70" r="50" stroke="#713600" strokeWidth="0.6" opacity="0.15" fill="none" />
            <circle cx="70" cy="70" r="40" stroke="#C05800" strokeWidth="0.5" opacity="0.2" fill="none" />
            
            {/* Elegant nodes with subtle glow */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = 70 + 45 * Math.cos(rad)
              const y = 70 + 45 * Math.sin(rad)
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#C05800" opacity="0.15" />
                  <circle cx={x} cy={y} r="2" fill="#C05800" opacity="0.3" />
                </g>
              )
            })}
            
            {/* Inner elegant pattern */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = 70 + 30 * Math.cos(rad)
              const y = 70 + 30 * Math.sin(rad)
              return (
                <circle key={`inner-${i}`} cx={x} cy={y} r="2.5" fill="#713600" opacity="0.25" />
              )
            })}
            
            {/* Connecting elegant lines */}
            {[0, 72, 144, 216, 288].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x1 = 70 + 30 * Math.cos(rad)
              const y1 = 70 + 30 * Math.sin(rad)
              const x2 = 70 + 45 * Math.cos(rad)
              const y2 = 70 + 45 * Math.sin(rad)
              return (
                <line
                  key={`line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#C05800"
                  strokeWidth="0.4"
                  opacity="0.2"
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
        </motion.div>
      </div>
    )
  }

  if (variant === 'mock-interview') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Subtle gradient orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-[#C05800]/20 via-[#C05800]/10 to-transparent rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 35, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#713600]/18 via-[#C05800]/8 to-transparent rounded-full blur-2xl"
        />
        
        {/* Elegant circuit pattern */}
        <motion.div
          animate={{
            rotate: [0, -360],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute top-1/2 right-1/4 transform -translate-y-1/2"
        >
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Elegant circuit lines */}
            <path d="M15 55 L35 55" stroke="#C05800" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
            <path d="M75 55 L95 55" stroke="#C05800" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
            <path d="M55 15 L55 35" stroke="#713600" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
            <path d="M55 75 L55 95" stroke="#713600" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
            
            {/* Elegant nodes */}
            <circle cx="55" cy="55" r="5" fill="#C05800" opacity="0.2" />
            <circle cx="55" cy="55" r="3" fill="#C05800" opacity="0.35" />
            <circle cx="15" cy="55" r="2.5" fill="#C05800" opacity="0.25" />
            <circle cx="95" cy="55" r="2.5" fill="#C05800" opacity="0.25" />
            <circle cx="55" cy="15" r="2.5" fill="#713600" opacity="0.2" />
            <circle cx="55" cy="95" r="2.5" fill="#713600" opacity="0.2" />
            
            {/* Elegant diagonal connections */}
            <path d="M20 20 L35 35" stroke="#C05800" strokeWidth="0.8" opacity="0.15" strokeLinecap="round" />
            <path d="M90 90 L75 75" stroke="#C05800" strokeWidth="0.8" opacity="0.15" strokeLinecap="round" />
            <path d="M20 90 L35 75" stroke="#713600" strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
            <path d="M90 20 L75 35" stroke="#713600" strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    )
  }

  if (variant === 'interview-types') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant floating particles */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-4 right-4 w-2 h-2 bg-[#C05800] rounded-full blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-8 right-12 w-1.5 h-1.5 bg-[#713600] rounded-full blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            opacity: [0.18, 0.38, 0.18],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-4 left-4 w-2 h-2 bg-[#C05800] rounded-full blur-sm"
        />
        
        {/* Elegant hexagon pattern */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M40 10 L60 20 L60 40 L40 50 L20 40 L20 20 Z"
              stroke="#C05800"
              strokeWidth="0.8"
              opacity="0.2"
              fill="none"
            />
            <path
              d="M40 20 L52 26 L52 36 L40 42 L28 36 L28 26 Z"
              stroke="#713600"
              strokeWidth="0.6"
              opacity="0.15"
              fill="none"
            />
            <circle cx="40" cy="31" r="3" fill="#C05800" opacity="0.25" />
          </svg>
        </motion.div>
      </div>
    )
  }

  if (variant === 'stats') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant wave pattern */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 right-0 w-32 h-32"
        >
          <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Elegant wave lines */}
            <path
              d="M0 64 Q32 32, 64 64 T128 64"
              stroke="#C05800"
              strokeWidth="1"
              opacity="0.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M0 80 Q32 48, 64 80 T128 80"
              stroke="#713600"
              strokeWidth="0.8"
              opacity="0.15"
              fill="none"
              strokeLinecap="round"
            />
            {/* Elegant dots */}
            {[16, 48, 80, 112].map((x, i) => (
              <circle key={i} cx={x} cy={64 + (i % 2 === 0 ? 0 : 16)} r="2" fill="#C05800" opacity="0.25" />
            ))}
          </svg>
        </motion.div>
        
        {/* Subtle gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#C05800]/15 to-transparent rounded-full blur-2xl"
        />
      </div>
    )
  }

  if (variant === 'charts') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant data visualization pattern */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            rotate: {
              duration: 50,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute top-4 right-4"
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Elegant bar chart pattern */}
            {[10, 25, 40, 55, 70, 85].map((x, i) => {
              const height = 20 + (i % 3) * 15
              return (
                <rect
                  key={i}
                  x={x}
                  y={80 - height}
                  width="8"
                  height={height}
                  fill="#C05800"
                  opacity="0.15"
                  rx="2"
                />
              )
            })}
            
            {/* Elegant line pattern */}
            <path
              d="M5 60 Q25 50, 45 40 T85 30"
              stroke="#713600"
              strokeWidth="1.5"
              opacity="0.2"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Elegant nodes */}
            {[15, 35, 55, 75].map((x, i) => {
              const y = 55 - i * 5
              return (
                <circle key={i} cx={x} cy={y} r="2.5" fill="#C05800" opacity="0.25" />
              )
            })}
          </svg>
        </motion.div>
        
        {/* Subtle gradient orb */}
        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#713600]/12 to-transparent rounded-full blur-2xl"
        />
      </div>
    )
  }

  if (variant === 'recent-sessions') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant timeline pattern */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <svg width="100%" height="100%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Elegant timeline line */}
            <line x1="20" y1="50" x2="180" y2="50" stroke="#C05800" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
            
            {/* Elegant timeline nodes */}
            {[30, 70, 110, 150].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy="50" r="4" fill="#C05800" opacity="0.2" />
                <circle cx={x} cy="50" r="2" fill="#C05800" opacity="0.3" />
                <line x1={x} y1="30" x2={x} y2="70" stroke="#713600" strokeWidth="0.8" opacity="0.1" />
              </g>
            ))}
          </svg>
        </motion.div>
        
        {/* Elegant floating particles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            className="absolute"
            style={{
              left: `${20 + i * 25}%`,
              top: '20%',
              width: '3px',
              height: '3px',
              background: '#C05800',
              borderRadius: '50%',
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    )
  }

  return null
}
