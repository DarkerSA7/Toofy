'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for hydration
    const timer = setTimeout(() => {
      // If already authenticated, redirect to home
      if (token) {
        router.push('/home')
      } else {
        setIsReady(true)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [token, router])

  if (!isReady && token) {
    return null
  }

  return <>{children}</>
}
