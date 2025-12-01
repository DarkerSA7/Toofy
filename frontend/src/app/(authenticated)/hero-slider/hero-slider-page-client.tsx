'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminProtection } from '@/components/admin-protection'
import { PERMISSIONS } from '@/hooks/use-permission'
import { HeroSliderManager } from './hero-slider-manager'
import { toast } from 'sonner'
import { SliderItem } from '@/lib/slider-types'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { useAuthStore } from '@/stores/auth-store'

interface HeroSliderPageClientProps {
  sliderItems: SliderItem[]
}

export function HeroSliderPageClient({ sliderItems }: HeroSliderPageClientProps) {
  const [items, setItems] = useState<SliderItem[]>(sliderItems)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveOrder = async (updatedItems: SliderItem[]) => {
    try {
      setIsSaving(true)
      
      // Get token from auth store
      const { token } = useAuthStore.getState()
      
      // Save to backend API
      const response = await fetch('http://localhost:8081/api/slider', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(updatedItems),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save slider order')
      }

      // Update local state
      setItems(updatedItems)
      
      // Revalidate cache to update home page
      await revalidateHome()
      
      toast.success('Slider order saved successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving slider order'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminProtection requiredPermission={PERMISSIONS.MANAGE_SLIDER}>
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>

        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Hero Slider Manager</h2>
              <p className='text-muted-foreground'>
                Manage and arrange anime in the hero slider. Drag to reorder.
              </p>
            </div>
          </div>

          <HeroSliderManager 
            sliderItems={items} 
            onSaveOrder={handleSaveOrder}
            loading={false}
          />
        </Main>
      </>
    </AdminProtection>
  )
}
