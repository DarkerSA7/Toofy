'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export function UnauthorizedError() {
  const router = useRouter()

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='rounded-lg border border-border bg-card p-8 shadow-lg'>
          {/* Icon */}
          <div className='mb-6 flex justify-center'>
            <div className='rounded-full bg-destructive/10 p-4'>
              <AlertCircle className='h-12 w-12 text-destructive' />
            </div>
          </div>

          {/* Content */}
          <div className='text-center'>
            <h1 className='mb-2 text-3xl font-bold'>Access Denied</h1>
            <p className='mb-6 text-sm text-muted-foreground'>
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </p>
          </div>

          {/* Divider */}
          <div className='my-6 border-t border-border' />

          {/* Buttons */}
          <div className='flex flex-col gap-3 sm:flex-row sm:gap-2'>
            <button
              onClick={() => router.back()}
              className='flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
            >
              <ArrowLeft className='h-4 w-4' />
              Back
            </button>
            <button
              onClick={() => router.push('/home')}
              className='flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
            >
              <Home className='h-4 w-4' />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
