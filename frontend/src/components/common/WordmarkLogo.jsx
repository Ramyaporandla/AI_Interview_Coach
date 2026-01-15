// FAANG-level wordmark logo
// Text-first design with subtle AI accent
// Enterprise-grade professional typography

export default function WordmarkLogo({ 
  showTagline = false,
  className = '',
  darkMode = false,
  size = 'default' // 'small' | 'default' | 'large'
}) {
  const sizeClasses = {
    small: {
      mainText: 'text-lg',
      tagline: 'text-xs',
      accentSize: 4,
      gap: 'gap-2'
    },
    default: {
      mainText: 'text-2xl',
      tagline: 'text-xs',
      accentSize: 6,
      gap: 'gap-3'
    },
    large: {
      mainText: 'text-4xl',
      tagline: 'text-sm',
      accentSize: 8,
      gap: 'gap-4'
    }
  }

  const sizes = sizeClasses[size] || sizeClasses.default
  const textColor = darkMode ? 'text-white' : 'text-gray-800'
  const taglineColor = darkMode ? 'text-gray-400' : 'text-gray-600'

  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      {/* Subtle AI accent - minimal geometric node */}
      <div className="flex-shrink-0">
        <svg
          width={sizes.accentSize * 2}
          height={sizes.accentSize * 2}
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Minimal geometric accent - abstract AI node */}
          <circle cx="6" cy="6" r="4" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="6" cy="6" r="2.5" fill="#06b6d4" opacity="0.8" />
          <circle cx="6" cy="6" r="1" fill="#0891b2" />
        </svg>
      </div>
      
      {/* Wordmark text */}
      <div className="flex flex-col">
        <span 
          className={`${sizes.mainText} font-bold ${textColor} tracking-tight leading-tight`}
          style={{ 
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Interview Coach
        </span>
        {showTagline && (
          <span 
            className={`${sizes.tagline} font-medium ${taglineColor} mt-0.5`}
            style={{ 
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            AI-Powered Preparation
          </span>
        )}
      </div>
    </div>
  )
}

