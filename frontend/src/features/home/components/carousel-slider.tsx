'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SliderItem } from '@/lib/slider-types'

interface Anime {
  id: string
  slug?: string
  title: string
  coverUrl: string
  status: string
  type: string
  season?: string
  seasonYear?: number
  position?: 'far-left' | 'left' | 'center' | 'right' | 'far-right'
}

interface CarouselSliderProps {
  sliderItems: SliderItem[]
}

export default function CarouselSlider({ sliderItems }: CarouselSliderProps) {
  const [slides, setSlides] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sliderItems || sliderItems.length === 0) {
      setError('No slider items available')
      return
    }

    const activeSlides = sliderItems
      .sort((a, b) => a.order - b.order)

    if (activeSlides.length > 0) {
      const sliderData: Anime[] = activeSlides.map(item => ({
        id: item.id,
        slug: item.animeId,
        title: item.title,
        coverUrl: item.coverUrl,
        status: item.status,
        type: item.type,
        season: item.season,
        seasonYear: item.seasonYear,
      }))
      setSlides(sliderData)
      setError(null)
    } else {
      setError('No slider items available')
    }
  }, [sliderItems])

  // التأكد من أن currentIndex لا يتجاوز عدد العناصر المتاحة
  useEffect(() => {
    if (slides.length > 0 && currentIndex >= slides.length) {
      setCurrentIndex(0)
    }
  }, [slides.length, currentIndex])

  const totalSlides = slides.length

  const getVisibleSlides = (): Anime[] => {
    if (slides.length === 0) return []

    const visibleSlides: Anime[] = []

    // عرض الصور الخمس بما فيها البطاقات البعيدة
    const farLeftIndex = (currentIndex - 2 + totalSlides) % totalSlides
    visibleSlides.push({ ...slides[farLeftIndex], position: 'far-left' })

    const leftIndex = (currentIndex - 1 + totalSlides) % totalSlides
    visibleSlides.push({ ...slides[leftIndex], position: 'left' })

    visibleSlides.push({ ...slides[currentIndex], position: 'center' })

    const rightIndex = (currentIndex + 1) % totalSlides
    visibleSlides.push({ ...slides[rightIndex], position: 'right' })

    const farRightIndex = (currentIndex + 2) % totalSlides
    visibleSlides.push({ ...slides[farRightIndex], position: 'far-right' })

    return visibleSlides
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides)
    setDragProgress(0)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides)
    setDragProgress(0)
  }

  useEffect(() => {
    if (isAutoPlaying && !isDragging && slides.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextSlide()
      }, 3000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, currentIndex, isDragging, slides.length])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsAutoPlaying(true)
    }
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    setIsAutoPlaying(false)
    setHasDragged(false)

    if ('touches' in e) {
      dragStartX.current = e.touches[0].clientX
      dragStartY.current = e.touches[0].clientY
    } else {
      dragStartX.current = e.clientX
      dragStartY.current = e.clientY
    }
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const dragDistanceX = clientX - dragStartX.current
    const dragDistanceY = clientY - dragStartY.current

    if (Math.abs(dragDistanceY) > Math.abs(dragDistanceX)) return

    if (Math.abs(dragDistanceX) > 5) {
      setHasDragged(true)
    }

    const containerWidth = containerRef.current?.clientWidth || 600
    const maxDragDistance = containerWidth / 3
    let progress = dragDistanceX / maxDragDistance

    progress = Math.max(-1, Math.min(1, progress))

    setDragProgress(progress)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)
    setIsAutoPlaying(true)
    
    // لا تقم بالتنقل إذا كان هناك عنصر واحد فقط أو لا توجد عناصر
    if (totalSlides <= 1) {
      setDragProgress(0)
      return
    }

    if (dragProgress > 0.3) {
      prevSlide()
    } else if (dragProgress < -0.3) {
      nextSlide()
    } else {
      setDragProgress(0)
    }
  }

  const visibleSlides = getVisibleSlides()

  if (loading) {
    return (
      <div className='relative mx-auto w-full overflow-x-hidden py-8'>
        <div className='flex h-[400px] items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='relative'>
              <div className='border-muted h-12 w-12 rounded-full border-4'></div>
              <div className='border-primary absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent'></div>
            </div>
            <p className='text-muted-foreground text-sm'>Loading anime...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || slides.length === 0) {
    return (
      <div className='relative mx-auto w-full overflow-x-hidden py-8'>
        <div className='flex h-[400px] items-center justify-center'>
          {error && <p className='text-muted-foreground'>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div
      className='relative mx-auto w-full overflow-x-hidden py-8 select-none'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        className='relative flex h-[400px] items-center justify-center touch-none select-none'
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {visibleSlides.map((slide: Anime) => {
          let baseX = 0
          let baseScale = 1
          let zIndex = 10
          let opacity = 1

          // تعديل قيم zIndex لمنع تداخل الصور وإضافة البطاقات البعيدة
          if (slide.position === 'far-left') {
            baseX = -620
            baseScale = 0.6
            zIndex = 1
            opacity = 0
          } else if (slide.position === 'left') {
            baseX = -310
            baseScale = 0.8
            zIndex = 5
          } else if (slide.position === 'center') {
            baseX = 0
            baseScale = 1
            zIndex = 10 // الصورة المركزية دائمًا في المقدمة
          } else if (slide.position === 'right') {
            baseX = 310
            baseScale = 0.8
            zIndex = 5
          } else if (slide.position === 'far-right') {
            baseX = 620
            baseScale = 0.6
            zIndex = 1
            opacity = 0
          }

          let adjustedX = baseX
          let adjustedScale = baseScale
          let adjustedOpacity = opacity

          // تعديل كيفية تغيير الإحداثيات والأحجام أثناء السحب
          if (dragProgress !== 0) {
            if (slide.position === 'far-left') {
              adjustedX = baseX + dragProgress * 310
              adjustedScale = baseScale + dragProgress * 0.2
              adjustedOpacity = Math.min(1, dragProgress * 2)
            } else if (slide.position === 'left') {
              adjustedX = baseX + dragProgress * 310
              adjustedScale = baseScale + dragProgress * 0.2
            } else if (slide.position === 'center') {
              adjustedX = baseX + dragProgress * 310
              adjustedScale = baseScale - Math.abs(dragProgress) * 0.2
            } else if (slide.position === 'right') {
              adjustedX = baseX + dragProgress * 310
              adjustedScale = baseScale - dragProgress * 0.2
            } else if (slide.position === 'far-right') {
              adjustedX = baseX + dragProgress * 310
              adjustedScale = baseScale - dragProgress * 0.2
              adjustedOpacity = Math.min(1, -dragProgress * 2)
            }
          }

          const transition = isDragging
            ? { duration: 0 }
            : { type: 'spring' as const, stiffness: 300, damping: 30 }

          // استخدام معرف فريد لكل شريحة بناءً على الموضع
          // لكن مع الاحتفاظ بنفس المعرف للشريحة نفسها عند تحريكها
          const slideKey = slide.position === 'center' ? `center-${slide.id}` : 
                         slide.position === 'left' ? `left-${slide.id}` : 
                         slide.position === 'right' ? `right-${slide.id}` : 
                         slide.position === 'far-left' ? `far-left-${slide.id}` : 
                         `far-right-${slide.id}`;
                         
          return (
            <motion.div
              key={slide.id}
              className={`absolute ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
              animate={{
                x: adjustedX,
                scale: adjustedScale,
                opacity: adjustedOpacity,
                zIndex,
              }}
              transition={transition}
              onClick={() => {
                if (hasDragged) return
                window.location.href = `/anime/${slide.slug || slide.id}`
              }}
            >
              <div className='relative overflow-hidden rounded-lg select-none'>
                <img
                  src={(() => {
                    let url = slide.coverUrl || ''
                    // Convert localhost URLs to production API URL
                    if (url.includes('localhost:8081')) {
                      const path = url.split('localhost:8081')[1]
                      url = `${process.env.NEXT_PUBLIC_API_URL}${path.replace('/api', '')}`
                    }
                    // Convert relative URLs to absolute
                    if (url.startsWith('/api')) {
                      url = `${process.env.NEXT_PUBLIC_API_URL}${url.replace('/api', '')}`
                    }
                    return url
                  })()}
                  alt={slide.title}
                  className='pointer-events-none h-[400px] w-[320px] object-cover select-none'
                  draggable='false'
                  loading={slide.position === 'center' || slide.position === 'left' || slide.position === 'right' ? 'eager' : 'lazy'}
                  decoding={slide.position === 'center' ? 'sync' : 'async'}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  crossOrigin='anonymous'
                  onError={(e) => {
                    // Hide the image if it fails to load - no placeholder
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {slide.position === 'center' && (
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 select-none'>
                    <h3 className='mb-2 truncate text-[17px] font-bold tracking-tight text-white select-none' style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                      {slide.title}
                    </h3>
                    <div className='flex items-center gap-2 text-[13px] font-semibold text-white/95 select-none' style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      <span className='relative flex h-2 w-2'>
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                            slide.status === 'ongoing' || slide.status === 'AIRING'
                              ? 'bg-green-400'
                              : slide.status === 'completed' || slide.status === 'COMPLETED'
                                ? 'bg-blue-400'
                                : 'bg-red-400'
                          }`}
                        ></span>
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${
                            slide.status === 'ongoing' || slide.status === 'AIRING'
                              ? 'bg-green-500'
                              : slide.status === 'completed' || slide.status === 'COMPLETED'
                                ? 'bg-blue-500'
                                : 'bg-red-500'
                          }`}
                        ></span>
                      </span>
                      <span>
                        {slide.status === 'ongoing' || slide.status === 'AIRING'
                          ? 'Ongoing'
                          : slide.status === 'completed' || slide.status === 'COMPLETED'
                            ? 'Completed'
                            : slide.status === 'upcoming' || slide.status === 'UPCOMING'
                              ? 'Upcoming'
                              : slide.status?.charAt(0).toUpperCase() + slide.status?.slice(1).toLowerCase()}
                      </span>
                      <span>•</span>
                      <span>
                        {slide.season && slide.seasonYear
                          ? `${slide.season.charAt(0).toUpperCase() + slide.season.slice(1).toLowerCase()} ${slide.seasonYear}`
                          : 'N/A'}
                      </span>
                      <span>•</span>
                      <span>{slide.type || 'TV'}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <button
        onClick={prevSlide}
        className='bg-background/80 hover:bg-background absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border transition-colors'
        aria-label='Previous slide'
      >
        <ChevronLeft className='h-6 w-6' />
      </button>

      <button
        onClick={nextSlide}
        className='bg-background/80 hover:bg-background absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border transition-colors'
        aria-label='Next slide'
      >
        <ChevronRight className='h-6 w-6' />
      </button>

      <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1.5'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative overflow-hidden rounded-full transition-all duration-500 ${
              index === currentIndex
                ? 'h-1.5 w-8 bg-primary'
                : 'h-1.5 w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60 hover:w-4'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentIndex && (
              <span className='absolute inset-0 bg-primary/50 animate-pulse' />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
