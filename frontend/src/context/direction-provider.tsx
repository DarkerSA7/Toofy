'use client'

import React, { useState, useEffect } from 'react'

export type Direction = 'ltr' | 'rtl'

type DirectionContextType = {
  direction: Direction
  setDirection: (direction: Direction) => void
}

const DirectionContext = React.createContext<DirectionContextType | null>(null)

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>('ltr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get direction from localStorage or document
    const storedDirection = localStorage.getItem('direction') as Direction | null
    const htmlDir = document.documentElement.dir as Direction | null
    if (storedDirection) {
      setDirection(storedDirection)
    } else if (htmlDir) {
      setDirection(htmlDir)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    localStorage.setItem('direction', direction)
    document.documentElement.dir = direction
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en'
  }, [direction, mounted])

  const value: DirectionContextType = {
    direction,
    setDirection,
  }

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  )
}

export const useDirection = () => {
  const context = React.useContext(DirectionContext)
  if (!context) {
    throw new Error('useDirection must be used within DirectionProvider')
  }
  return context
}
