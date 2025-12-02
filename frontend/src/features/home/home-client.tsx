'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import CarouselSlider from './components/carousel-slider'
import { SliderItem } from '@/lib/slider-types'

interface Anime {
  id: string
  slug?: string
  title: string
  coverUrl?: string
  coverImage?: string
  type: string
  status: string
  episodeCount?: number
  episodes?: number
}

interface HomeClientProps {
  animes: Anime[]
  total: number
  currentPage: number
  sliderItems: SliderItem[]
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
}

export function HomeClient({ animes, total, currentPage, sliderItems }: HomeClientProps) {
  const router = useRouter()
  const itemsPerPage = 18
  const totalPages = Math.ceil(total / itemsPerPage)
  const [displaySliderItems] = useState<SliderItem[]>(sliderItems)

  const handlePageChange = (page: number) => {
    router.push(`/home?page=${page}`, { scroll: false })
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        {/* Carousel Slider */}
        <div className='mb-8'>
          <CarouselSlider sliderItems={displaySliderItems} />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <div>
            <h3 className='mb-4 text-xl font-semibold'>New Release</h3>
            
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {animes.map((anime) => (
                    <a key={anime.id} href={`/anime/${anime.slug || anime.id}`} className='group cursor-pointer'>
                      <div className='relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-card shadow-md transition-all'>
                        <img
                          src={anime.coverUrl || anime.coverImage || ''}
                          alt={anime.title}
                          className='h-full w-full object-cover'
                          loading="lazy"
                          decoding="async"
                          crossOrigin='anonymous'
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center"><svg class="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
                            }
                          }}
                        />
                        <div className='absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                      </div>
                      <div className='mt-3 flex items-start justify-between gap-2'>
                        <h3 className='line-clamp-2 flex-1 text-sm font-semibold leading-tight'>
                          {anime.title}
                        </h3>
                        <span className='text-muted-foreground shrink-0 text-xs font-medium'>
                          {anime.type === 'TV' ? 'Series' : anime.type === 'MOVIE' ? 'Movie' : anime.type === 'OVA' ? 'OVA' : anime.type === 'ONA' ? 'ONA' : anime.type}
                        </span>
                      </div>
                    </a>
                ))}
            </div>

            {/* Pagination */}
            <div className='mt-8 flex items-center justify-center space-x-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>

              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className='px-2'>
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='icon'
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ArrowRight className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
