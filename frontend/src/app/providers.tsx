'use client'

import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { FontProvider } from '@/context/font-provider'
import { DirectionProvider } from '@/context/direction-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for hydration to complete
    setIsReady(true)
  }, [])

  // Don't render until hydration is complete
  if (!isReady) {
    return null
  }

  return (
    <ThemeProvider>
      <FontProvider>
        <DirectionProvider>
          {children}
          <Toaster duration={5000} />
        </DirectionProvider>
      </FontProvider>
    </ThemeProvider>
  )
}
