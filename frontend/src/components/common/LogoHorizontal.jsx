import LogoIcon from './LogoIcon'

// FAANG-level horizontal logo with icon + text
// Enterprise-grade professional design

export default function LogoHorizontal({ 
  iconSize = 40, 
  showTagline = false,
  className = '',
  darkMode = false,
  variant = 'default'
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={iconSize} variant={variant} />
      <div className="flex flex-col">
        <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} tracking-tight`} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          AI Interview Coach
        </span>
        {showTagline && (
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            AI-Powered Interview Preparation
          </span>
        )}
      </div>
    </div>
  )
}
