'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='max-w-md text-center'>
        <h1 className='mb-4 text-4xl font-bold'>Something went wrong</h1>
        <p className='mb-8 text-muted-foreground'>An error occurred. Please try again.</p>
        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <button
            onClick={() => router.push('/home')}
            className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            Go to Home
          </button>
          <button
            onClick={reset}
            className='rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent'
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
