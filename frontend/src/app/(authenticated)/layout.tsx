'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/auth-store'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { token, getCurrentUser } = useAuthStore()

  useEffect(() => {
    // If token exists, ensure user data is loaded (non-blocking)
    if (token) {
      getCurrentUser().catch(error => {
        console.error('Failed to get current user:', error)
      })
    }
  }, [token, getCurrentUser])

  return (
    <div className='min-h-screen'>
      <SearchProvider>
        <LayoutProvider>
          <SidebarProvider defaultOpen={false} suppressHydrationWarning>
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                // Set content container, so we can use container queries
                '@container/content',

                // If layout is fixed, set the height
                // to 100svh to prevent overflow
                'has-data-[layout=fixed]:h-svh',

                // If layout is fixed and sidebar is inset,
                // set the height to 100svh - spacing (total margins) to prevent overflow
                'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
              suppressHydrationWarning
            >
              {children}
            </SidebarInset>
          </SidebarProvider>
        </LayoutProvider>
      </SearchProvider>
    </div>
  )
}
