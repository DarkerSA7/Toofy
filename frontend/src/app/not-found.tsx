'use client'

import { useRouter } from 'next/navigation'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='max-w-md text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-muted p-4'>
            <FileQuestion className='h-12 w-12 text-muted-foreground' />
          </div>
        </div>

        <h1 className='mb-2 text-4xl font-bold'>404</h1>
        <h2 className='mb-4 text-2xl font-semibold'>Page Not Found</h2>

        <p className='mb-8 text-muted-foreground'>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <button
            onClick={() => router.back()}
            className='flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent'
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <button
            onClick={() => router.push('/home')}
            className='flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            <Home className='h-4 w-4' />
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
