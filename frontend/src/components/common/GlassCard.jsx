import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      className={`
        relative
        bg-gradient-to-br from-white/40 via-white/30 to-white/20
        dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/60
        backdrop-blur-2xl
        border border-white/50 border-cyan-500/30
        dark:border-gray-700/50 dark:border-gray-600/30
        rounded-2xl
        shadow-[0_8px_32px_0_rgba(59,130,246,0.15)]
        dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
        ${hover ? 'group hover:bg-gradient-to-br hover:from-white/50 hover:via-white/40 hover:to-white/30 dark:hover:from-gray-900/90 dark:hover:via-gray-800/80 dark:hover:to-gray-900/70 hover:border-cyan-400/50 dark:hover:border-gray-600/50 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] hover:shadow-cyan-500/30 dark:hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.7)]' : ''}
        transition-all duration-300 ease-out
        text-gray-900 dark:text-gray-50
        ${className}
      `}
      whileHover={hover ? { 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Soft blue glow shadow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
      
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Glass reflection effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
