'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, Plus, Check, GripHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { SliderItem, AnimeForSlider } from '@/lib/slider-types'

interface HeroSliderManagerProps {
  sliderItems: SliderItem[]
  onSaveOrder: (items: SliderItem[]) => void
  loading: boolean
}

type AllAnime = AnimeForSlider[]

function SortableSliderCard({ item, onRemove }: { item: SliderItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`relative flex flex-col flex-shrink-0 transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      }`}
    >
      {/* Cover Image */}
      <div className='relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted shadow-md'>
        {item.coverUrl ? (
          <img
            src={item.coverUrl.startsWith('http') ? item.coverUrl : `http://localhost:8081${item.coverUrl}`}
            alt={item.title}
            className='h-full w-full object-cover'
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : null}
        
        {/* Order Badge */}
        <div className='absolute top-2 right-2 flex items-center justify-center pointer-events-none'>
          <span className='text-2xl font-bold text-white/30 drop-shadow-lg'>#</span>
          <span className='text-2xl font-bold text-white drop-shadow-lg -ml-1'>{item.order + 1}</span>
        </div>

        {/* Drag Handle - Top Left */}
        <div
          {...attributes}
          {...listeners}
          className='absolute top-2 left-2 flex items-center justify-center cursor-grab active:cursor-grabbing'
        >
          <GripHorizontal className='h-5 w-5 text-white drop-shadow-md' />
        </div>

        {/* Remove Button - Top Right */}
        <Button
          variant='destructive'
          size='sm'
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
          className='absolute top-2 right-12 h-7 w-7 p-0 pointer-events-auto'
        >
          <Trash2 className='h-3 w-3' />
        </Button>
      </div>

      {/* Info */}
      <div className='mt-3 space-y-1'>
        <h3 className='line-clamp-2 text-sm font-semibold leading-tight'>
          {item.title}
        </h3>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              item.status === 'ongoing' ? 'bg-green-500' : item.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
            }`}
          />
          <span className='capitalize'>{item.status}</span>
          <span>•</span>
          <span>{item.type === 'TV' ? 'Series' : item.type === 'MOVIE' ? 'Movie' : item.type === 'OVA' ? 'OVA' : item.type === 'ONA' ? 'ONA' : item.type}</span>
          {item.season && item.seasonYear && (
            <>
              <span>•</span>
              <span className='capitalize'>{item.season} {item.seasonYear}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSliderManager({ sliderItems, onSaveOrder, loading }: HeroSliderManagerProps) {
  const [items, setItems] = useState<SliderItem[]>([])
  const [allAnime, setAllAnime] = useState<AllAnime>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setItems(sliderItems)
  }, [sliderItems])

  useEffect(() => {
    fetchAllAnime()
    
    // Fallback: Load anime from home page data if API fails
    const loadFromHome = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
        const response = await fetch(`${API_BASE_URL}/anime`)
        if (response.ok) {
          const data = await response.json()
          let animeList: any[] = []
          if (Array.isArray(data)) {
            animeList = data
          } else if (data.data?.data && Array.isArray(data.data.data)) {
            animeList = data.data.data
          } else if (data.data && Array.isArray(data.data)) {
            animeList = data.data
          }
          if (animeList.length > 0) {
            setAllAnime(animeList)
          }
        }
      } catch (error) {
        // Silently fail
      }
    }
    
    // Try fallback after 2 seconds if main fetch didn't work
    const timer = setTimeout(() => {
      if (allAnime.length === 0) {
        loadFromHome()
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const fetchAllAnime = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
      const response = await fetch(`${API_BASE_URL}/anime?page=1&limit=1000`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle different response formats
        let animeList: any[] = []
        
        if (Array.isArray(data)) {
          animeList = data
        } else if (data.data?.data && Array.isArray(data.data.data)) {
          // API returns { data: { data: [...] } }
          animeList = data.data.data
        } else if (data.data && Array.isArray(data.data)) {
          animeList = data.data
        } else if (data.anime && Array.isArray(data.anime)) {
          animeList = data.anime
        } else if (data.items && Array.isArray(data.items)) {
          animeList = data.items
        }
        
        setAllAnime(animeList)
      } else {
        setAllAnime([])
      }
    } catch (error) {
      setAllAnime([])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }))

      setItems(newItems)
    }
  }

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      order: index,
    }))
    setItems(newItems)
  }

  const handleAddAnime = (anime: AnimeForSlider) => {
    const newItem: SliderItem = {
      id: anime.id || `slider-${Date.now()}`,
      animeId: anime.id,
      title: anime.title,
      coverUrl: anime.coverUrl || '',
      status: anime.status || 'unknown',
      type: anime.type || 'TV',
      season: anime.season,
      seasonYear: anime.seasonYear,
      order: items.length,
    }
    setItems([...items, newItem])
    setSearchQuery('')
    toast.success(`${anime.title} added to slider`)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSaveOrder(items)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredAnime = Array.isArray(allAnime)
    ? allAnime.filter(
        (anime) =>
          anime.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !items.some((item) => item.animeId === anime.id)
      )
    : []

  if (loading) {
    return (
      <div className='flex h-96 items-center justify-center rounded-lg border bg-card'>
        <div className='flex flex-col items-center gap-3'>
          <div className='relative'>
            <div className='border-muted h-12 w-12 rounded-full border-4'></div>
            <div className='border-primary absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent'></div>
          </div>
          <p className='text-muted-foreground text-sm'>Loading slider items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header with Buttons */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Slider Items ({items.length})</h3>
          <p className='text-sm text-muted-foreground'>Drag to reorder, max 5 items recommended</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setShowSearchDialog(true)} variant='outline' className='gap-2'>
            <Plus className='h-4 w-4' />
            Add Anime
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className='gap-2'>
            <Check className='h-4 w-4' />
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>

      {/* Slider Items - Grid Layout */}
      {items.length === 0 ? (
        <div className='flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30'>
          <p className='text-muted-foreground'>No items in slider yet. Add some anime below.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 justify-center'>
              {items.map((item) => (
                <SortableSliderCard key={item.id} item={item} onRemove={handleRemoveItem} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add Anime to Slider</DialogTitle>
            <DialogDescription>Search and select anime to add to your slider</DialogDescription>
          </DialogHeader>

          <Input
            placeholder='Search anime by name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full'
            autoFocus
          />

          {searchQuery.length > 0 && (
            <div className='max-h-96 overflow-y-auto rounded-lg border'>
              {filteredAnime.length === 0 ? (
                <div className='flex h-24 items-center justify-center'>
                  <p className='text-sm text-muted-foreground'>No results for "{searchQuery}"</p>
                </div>
              ) : (
                filteredAnime.slice(0, 20).map((anime) => (
                  <button
                    key={anime.id}
                    onClick={() => {
                      handleAddAnime(anime)
                      setSearchQuery('')
                    }}
                    className='w-full flex items-center gap-3 border-b p-3 text-left transition-colors hover:bg-muted last:border-b-0'
                  >
                    <div className='relative h-14 w-10 flex-shrink-0 overflow-hidden rounded'>
                      <img
                        src={(() => {
                          let url = anime.coverUrl || ''
                          if (url.startsWith('/api')) {
                            url = `${process.env.NEXT_PUBLIC_API_URL}${url.replace('/api', '')}`
                          }
                          return url
                        })()}
                        alt={anime.title}
                        className='h-full w-full object-cover'
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"%3E%3Crect fill="%23e5e7eb" width="100" height="150"/%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm truncate'>{anime.title}</p>
                      <p className='text-xs text-muted-foreground'>{anime.type}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
