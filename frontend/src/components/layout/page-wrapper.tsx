import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted'>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </div>
  )
}
