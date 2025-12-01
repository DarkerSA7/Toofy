'use client'

import { HeaderLight } from '@/components/layout/header-light'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function AnimeListPage() {
  return (
    <>
      <HeaderLight fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
        </div>
      </HeaderLight>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Anime List</h2>
            <p className='text-muted-foreground'>
              Browse all available anime
            </p>
          </div>
        </div>

        <div className='grid gap-4'>
          <div className='rounded-lg border bg-card p-6'>
            <h3 className='text-lg font-semibold mb-2'>Anime Library</h3>
            <p className='text-sm text-muted-foreground'>
              All available anime will appear here.
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}
