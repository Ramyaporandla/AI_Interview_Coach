// Unique AI Interview Coach logo
// Combines microphone (interview) + neural network (AI) elements
// Modern, distinctive, professional design

export default function LogoIcon({ size = 48, className = '', variant = 'default' }) {
  if (variant === 'minimal') {
    // Ultra-minimal version - microphone with AI accent
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Microphone body - modern, geometric */}
        <rect x="20" y="8" width="8" height="16" rx="4" fill="#1F2937" />
        {/* Microphone stand */}
        <path d="M22 24L22 32L26 32L26 24" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 32L30 32" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
        {/* AI accent - neural network nodes */}
        <circle cx="16" cy="12" r="2" fill="#E35336" opacity="0.9" />
        <circle cx="32" cy="12" r="2" fill="#E35336" opacity="0.9" />
        <circle cx="16" cy="20" r="1.5" fill="#E35336" opacity="0.7" />
        <circle cx="32" cy="20" r="1.5" fill="#E35336" opacity="0.7" />
        {/* Connection lines */}
        <line x1="18" y1="12" x2="20" y2="14" stroke="#E35336" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="14" x2="32" y2="12" stroke="#E35336" strokeWidth="1" opacity="0.5" />
      </svg>
    )
  }

  // Default version - microphone with speech waves and AI elements
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer container circle - subtle */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="#1F2937"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
      
      {/* Speech waves - representing interview/conversation */}
      <path
        d="M8 20 Q10 18, 12 20 T16 20"
        stroke="#E35336"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M8 24 Q10 22, 12 24 T16 24"
        stroke="#E35336"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
      />
      <path
        d="M8 28 Q10 26, 12 28 T16 28"
        stroke="#E35336"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      
      {/* Microphone body - modern, sleek design */}
      <rect x="20" y="10" width="8" height="18" rx="4" fill="#1F2937" />
      {/* Microphone grille - horizontal lines */}
      <line x1="22" y1="14" x2="26" y2="14" stroke="#E35336" strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="18" x2="26" y2="18" stroke="#E35336" strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="22" x2="26" y2="22" stroke="#E35336" strokeWidth="1" opacity="0.4" />
      
      {/* Microphone stand/base */}
      <path d="M22 28L22 34L26 34L26 28" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 34L30 34" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      
      {/* AI neural network nodes - surrounding the microphone */}
      <circle cx="14" cy="14" r="2.5" fill="#E35336" opacity="0.9" />
      <circle cx="34" cy="14" r="2.5" fill="#E35336" opacity="0.9" />
      <circle cx="14" cy="24" r="2" fill="#E35336" opacity="0.7" />
      <circle cx="34" cy="24" r="2" fill="#E35336" opacity="0.7" />
      <circle cx="14" cy="34" r="1.5" fill="#E35336" opacity="0.6" />
      <circle cx="34" cy="34" r="1.5" fill="#E35336" opacity="0.6" />
      
      {/* Connection lines - neural network feel */}
      <line x1="16.5" y1="14" x2="20" y2="16" stroke="#E35336" strokeWidth="1" opacity="0.4" />
      <line x1="28" y1="16" x2="31.5" y2="14" stroke="#E35336" strokeWidth="1" opacity="0.4" />
      <line x1="16" y1="24" x2="20" y2="22" stroke="#E35336" strokeWidth="1" opacity="0.3" />
      <line x1="28" y1="22" x2="32" y2="24" stroke="#E35336" strokeWidth="1" opacity="0.3" />
      
      {/* Central accent dot - AI core */}
      <circle cx="24" cy="19" r="1.5" fill="#E35336" opacity="0.9" />
    </svg>
  )
}
