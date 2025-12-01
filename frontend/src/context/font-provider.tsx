'use client'

import React, { useState, useEffect } from 'react'

type FontSize = 'small' | 'medium' | 'large'

type FontContextType = {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const FontContext = React.createContext<FontContextType | null>(null)

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get font size from localStorage
    const storedFontSize = localStorage.getItem('fontSize') as FontSize | null
    if (storedFontSize) {
      setFontSize(storedFontSize)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    localStorage.setItem('fontSize', fontSize)

    // Update document class
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg')
    const fontSizeMap = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    }
    document.documentElement.classList.add(fontSizeMap[fontSize])
  }, [fontSize, mounted])

  const value: FontContextType = {
    fontSize,
    setFontSize,
  }

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  )
}

export const useFont = () => {
  const context = React.useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within FontProvider')
  }
  return context
}
