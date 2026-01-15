import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function PrimaryButton({ 
  children, 
  onClick, 
  className = '', 
  icon = true,
  variant = 'primary',
  ...props 
}) {
  const baseClasses = `
    px-8 py-4
    rounded-xl
    font-bold text-lg
    transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05800] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `

  if (variant === 'primary') {
    return (
      <motion.button
        onClick={onClick}
        className={`
          ${baseClasses}
          bg-[#C05800] text-white
          shadow-lg shadow-[#C05800]/20
          hover:bg-[#713600] hover:shadow-xl hover:shadow-[#C05800]/30
          hover:-translate-y-0.5
          active:scale-95
          ${className}
        `}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {children}
          {icon && <ArrowRight className="w-5 h-5" />}
        </span>
      </motion.button>
    )
  }

  if (variant === 'secondary') {
    return (
      <motion.button
        onClick={onClick}
        className={`
          ${baseClasses}
          bg-white/60 dark:bg-white/20
          backdrop-blur-xl
          border-2 border-[#713600]/30 dark:border-[#713600]/20
          text-[#38240D] dark:text-white
          shadow-lg shadow-black/5
          hover:bg-white/80 dark:hover:bg-white/30
          hover:border-[#713600]/50 dark:hover:border-[#713600]/40
          hover:shadow-xl hover:shadow-black/10
          hover:-translate-y-0.5
          active:scale-95
          ${className}
        `}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }

  return null
}


