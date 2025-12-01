// Centralized slider types

export interface SliderItem {
  id: string
  animeId: string
  title: string
  coverUrl: string
  status: string
  type: string
  season?: string
  seasonYear?: number
  order: number
}

export interface AnimeForSlider {
  id: string
  title: string
  slug: string
  coverUrl: string
  status: string
  type: string
  season?: string
  seasonYear?: number
}
