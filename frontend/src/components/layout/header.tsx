'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScroll = 0

    const handleScroll = () => {
      const currentScroll = window.scrollY

      if (currentScroll < 10) {
        // Always show header at top
        setIsVisible(true)
      } else if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down - hide header (only after 100px)
        setIsVisible(false)
      } else if (currentScroll < lastScroll) {
        // Scrolling up - show header immediately
        setIsVisible(true)
      }

      lastScroll = currentScroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-14 bg-sidebar border-b border-sidebar-border transition-transform duration-300',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        !isVisible && '-translate-y-full',
        className
      )}
      {...props}
    >
      <div className='relative flex h-full items-center gap-3 px-4 sm:gap-4'>
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        {children}
      </div>
    </header>
  )
}
