import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Only access browser APIs if we're in the browser
    if (typeof window === 'undefined') {
      return 'light' // Default for SSR
    }
    
    // Check localStorage first (user's manual preference takes priority)
    try {
      const savedTheme = localStorage.getItem('theme')
      const manualThemeSet = localStorage.getItem('theme-manual')
      
      // If user has manually set theme, use it
      if (manualThemeSet === 'true' && (savedTheme === 'dark' || savedTheme === 'light')) {
        console.log('[ThemeContext] Using saved manual theme:', savedTheme)
        return savedTheme
      }
      
      // If there's a saved theme but no manual flag, still use it (backward compatibility)
      if (savedTheme === 'dark' || savedTheme === 'light') {
        console.log('[ThemeContext] Using saved theme:', savedTheme)
        return savedTheme
      }
    } catch (e) {
      // localStorage might not be available (e.g., private browsing)
      console.warn('localStorage not available:', e)
    }
    
    // Check system preference as fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('[ThemeContext] Using system preference: dark')
      return 'dark'
    }
    
    console.log('[ThemeContext] Using default theme: light')
    return 'light'
  })

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    
    // Remove both classes first to avoid conflicts
    root.classList.remove('light', 'dark')
    
    // Add the current theme class
    root.classList.add(theme)
    
    // Verify the class was added
    if (!root.classList.contains(theme)) {
      console.error('[ThemeContext] Failed to apply theme class:', theme)
      // Force add it
      root.className = root.className.replace(/light|dark/g, '') + ' ' + theme
    }
    
    // Persist to localStorage immediately
    try {
      localStorage.setItem('theme', theme)
      // Set a flag to indicate user has manually set theme (if not already set)
      if (localStorage.getItem('theme-manual') !== 'true') {
        localStorage.setItem('theme-manual', 'true')
      }
    } catch (e) {
      // localStorage might not be available (e.g., private browsing)
      console.warn('Could not save theme to localStorage:', e)
    }
    
    console.log('[ThemeContext] Theme changed to:', theme, '| HTML class:', root.className)
  }, [theme])

  // Listen for system theme changes (only if user hasn't manually set a preference)
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !window.matchMedia) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      try {
        const manualThemeSet = localStorage.getItem('theme-manual')
        const savedTheme = localStorage.getItem('theme')
        
        // Don't override if user has manually set theme
        if (!manualThemeSet && !savedTheme) {
          console.log('[ThemeContext] System theme changed, updating to:', e.matches ? 'dark' : 'light')
          setTheme(e.matches ? 'dark' : 'light')
        }
      } catch (e) {
        // localStorage might not be available
        console.warn('Could not check localStorage:', e)
      }
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'
      console.log('[ThemeContext] Toggling theme from', prevTheme, 'to', newTheme)
      
      // Immediately save to localStorage to prevent system preference override
      try {
        localStorage.setItem('theme', newTheme)
        localStorage.setItem('theme-manual', 'true') // Mark as manually set
        console.log('[ThemeContext] Saved theme to localStorage:', newTheme)
      } catch (e) {
        console.warn('Could not save theme to localStorage:', e)
      }
      
      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

