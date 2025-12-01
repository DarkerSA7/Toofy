import { HeroSliderPageClient } from './hero-slider-page-client'
import { SliderItem } from '@/lib/slider-types'

// Server Component - On-demand ISR
async function getSliderItems() {
  try {
    const response = await fetch('http://localhost:8081/api/slider', {
      next: { 
        tags: ['slider-items'],
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return { data: [] }
    }
    
    const result = await response.json()
    
    if (result.success && result.data && Array.isArray(result.data)) {
      return result
    }
    
    return { data: [] }
  } catch (error) {
    return { data: [] }
  }
}

export default async function HeroSliderPage() {
  const { data: sliderItems } = await getSliderItems()
  
  return <HeroSliderPageClient sliderItems={sliderItems} />
}
