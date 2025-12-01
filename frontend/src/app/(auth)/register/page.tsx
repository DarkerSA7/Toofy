'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error } = useAuthStore()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await register(displayName, email, password)
      toast.success('Registration successful!')
      router.push('/home')
    } catch (err) {
      toast.error(error || 'Registration failed')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='rounded-lg border border-border bg-card p-8 shadow-lg'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-bold'>Toofy.Tv</h1>
            <p className='mt-2 text-sm text-muted-foreground'>Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='displayName' className='text-sm font-medium'>
                Display Name
              </label>
              <Input
                id='displayName'
                type='text'
                placeholder='John Doe'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                required
                className='h-10'
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className='h-10'
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className='h-10'
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm Password
              </label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder='••••••••'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className='h-10'
              />
            </div>

            {error && (
              <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              className='h-10 w-full'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className='my-6 border-t border-border' />

          {/* Sign in link */}
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>Already have an account? </span>
            <Link href='/login' className='font-medium text-primary hover:underline'>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
