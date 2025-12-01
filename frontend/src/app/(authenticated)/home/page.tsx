import { HomeClient } from '@/features/home/home-client'
import type { Metadata } from 'next'

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Home - Anime Dashboard',
  description: 'Browse and discover the latest anime releases',
}

// استخدام On-demand ISR لتحديث البيانات فقط عند الإضافة أو التعديل أو الحذف
// يتم استدعاء revalidateTag في Server Actions عند تغيير البيانات

// Server Component - On-demand ISR
async function getSliderItems() {
  try {
    // جلب بيانات السلايدر من الخادم باستخدام On-demand ISR
    const response = await fetch('http://localhost:8081/api/slider', {
      next: { 
        tags: ['slider-items'], // Tag for on-demand revalidation
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      // إذا لم يكن API السلايدر متاحًا، استخدم بيانات الأنمي كبديل
      const animesResponse = await fetch('http://localhost:8081/api/anime?page=1&limit=5', {
        next: { 
          tags: ['anime-list'], // Tag for on-demand revalidation
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!animesResponse.ok) {
        return { data: [] }
      }
      
      const animesResult = await animesResponse.json()
      
      // Backend returns { success: true, data: { data: [], total, page, limit, total_pages } }
      const animesList = animesResult.data?.data || animesResult.data || []
      
      if (animesResult.success && Array.isArray(animesList)) {
        // استخدم الأنمي الموجودة في الخادم كبيانات للسلايدر
        return {
          data: animesList.map((anime: any, index: number) => ({
            id: anime.id,
            animeId: anime.id,
            title: anime.title,
            coverUrl: anime.coverUrl || anime.image || '',
            status: anime.status,
            type: anime.type,
            season: anime.season,
            seasonYear: anime.seasonYear,
            order: index, // ترتيب بناءً على الفهرس
          }))
        }
      }
      
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

// Server Component - On-demand ISR
async function getAnimes(page: number = 1, limit: number = 18) {
  try {
    const response = await fetch(`http://localhost:8081/api/anime?page=${page}&limit=${limit}`, {
      next: { 
        tags: ['anime-list'], // Tag for on-demand revalidation
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return { data: [], total: 0 }
    }
    
    const result = await response.json()
    
    // Backend returns { success: true, data: { data: [], total, page, limit, total_pages } }
    const animesList = result.data?.data || result.data || []
    
    if (result.success && Array.isArray(animesList)) {
      return {
        data: animesList,
        total: result.data?.total || result.total || 0
      }
    }
    
    return { data: [], total: 0 }
  } catch (error) {
    return { data: [], total: 0 }
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  
  // جلب بيانات السلايدر والأنمي بالتوازي لتحسين الأداء
  const [sliderResult, animesResult] = await Promise.all([
    getSliderItems(),
    getAnimes(currentPage, 18)
  ])
  
  const { data: sliderItems } = sliderResult
  const { data: animes, total } = animesResult
  
  return <HomeClient 
    animes={animes} 
    total={total} 
    currentPage={currentPage} 
    sliderItems={sliderItems}
  />
}
