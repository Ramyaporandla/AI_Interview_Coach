// Ultra-minimal logo mark - for favicon, app icon, small spaces
// Microphone + AI elements - simplified version
// Unique, recognizable design

export default function LogoMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Microphone body */}
      <rect x="13" y="6" width="6" height="12" rx="3" fill="#1F2937" />
      {/* Microphone stand */}
      <path d="M14 18L14 22L18 22L18 18" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 22L20 22" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      {/* AI accent nodes */}
      <circle cx="10" cy="10" r="1.5" fill="#E35336" opacity="0.9" />
      <circle cx="22" cy="10" r="1.5" fill="#E35336" opacity="0.9" />
      {/* Central accent */}
      <circle cx="16" cy="12" r="1" fill="#E35336" opacity="0.9" />
    </svg>
  )
}
