/**
 * Simple API client for making HTTP requests
 * Using native Fetch API with Authorization token
 */

import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'

// Helper function to get token
function getToken(): string {
  const { token } = useAuthStore.getState()
  return token || ''
}

// Helper function to make API requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}

// Alova-like instance for API requests
export const alovaInstance = {
  Get: (url: string, options?: any) => apiRequest(url, { method: 'GET' }),
  Post: (url: string, data?: any, options?: any) =>
    apiRequest(url, { method: 'POST', body: JSON.stringify(data) }),
  Put: (url: string, data?: any, options?: any) =>
    apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),
  Delete: (url: string, options?: any) => apiRequest(url, { method: 'DELETE' }),
}

// Anime API methods
export const animeAPI = {
  // Get all anime
  getAll: (page = 1, limit = 18) =>
    alovaInstance.Get(`/anime?page=${page}&limit=${limit}`, {
      name: 'getAnimes',
    }),

  // Get single anime by ID
  getById: (id: string) =>
    alovaInstance.Get(`/anime/${id}`, {
      name: `getAnime_${id}`,
    }),

  // Get anime by slug
  getBySlug: (slug: string) =>
    alovaInstance.Get(`/anime/slug/${slug}`, {
      name: `getAnimeBySlug_${slug}`,
    }),

  // Create new anime
  create: (data: any) =>
    alovaInstance.Post('/anime', data, {
      name: 'createAnime',
    }),

  // Update anime
  update: (id: string, data: any) =>
    alovaInstance.Put(`/anime/${id}`, data, {
      name: `updateAnime_${id}`,
    }),

  // Delete anime
  delete: (id: string) =>
    alovaInstance.Delete(`/anime/${id}`, {
      name: `deleteAnime_${id}`,
    }),
}

// Episodes API methods
export const episodesAPI = {
  // Get episodes for anime
  getByAnimeId: (animeId: string) =>
    alovaInstance.Get(`/episodes?animeId=${animeId}`, {
      name: `getEpisodes_${animeId}`,
    }),

  // Get single episode
  getById: (id: string) =>
    alovaInstance.Get(`/episodes/${id}`, {
      name: `getEpisode_${id}`,
    }),

  // Create episode
  create: (data: any) =>
    alovaInstance.Post('/episodes', data, {
      name: 'createEpisode',
    }),

  // Update episode
  update: (id: string, data: any) =>
    alovaInstance.Put(`/episodes/${id}`, data, {
      name: `updateEpisode_${id}`,
    }),

  // Delete episode
  delete: (id: string) =>
    alovaInstance.Delete(`/episodes/${id}`, {
      name: `deleteEpisode_${id}`,
    }),
}

// Slider API methods
export const sliderAPI = {
  // Get all slider items
  getAll: () =>
    alovaInstance.Get('/slider', {
      name: 'getSliderItems',
    }),

  // Get single slider item
  getById: (id: string) =>
    alovaInstance.Get(`/slider/${id}`, {
      name: `getSliderItem_${id}`,
    }),

  // Create slider item
  create: (data: any) =>
    alovaInstance.Post('/slider', data, {
      name: 'createSliderItem',
    }),

  // Update slider item
  update: (id: string, data: any) =>
    alovaInstance.Put(`/slider/${id}`, data, {
      name: `updateSliderItem_${id}`,
    }),

  // Delete slider item
  delete: (id: string) =>
    alovaInstance.Delete(`/slider/${id}`, {
      name: `deleteSliderItem_${id}`,
    }),
}


// Upload API methods
export const uploadAPI = {
  uploadCover: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/upload/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    return response.json()
  },
  deleteCover: async (coverUrl: string) => {
    const token = getToken()
    
    if (!coverUrl) {
      console.error('[deleteCover] Cover URL is required')
      throw new Error('Cover URL is required')
    }
    
    console.log('[deleteCover] Starting deletion for URL:', coverUrl)
    console.log('[deleteCover] API endpoint:', `${API_BASE_URL}/upload/cover`)
    console.log('[deleteCover] Token exists:', !!token)
    
    const response = await fetch(`${API_BASE_URL}/upload/cover`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: coverUrl }),
    })
    
    console.log('[deleteCover] Response status:', response.status)
    
    const result = await response.json()
    
    console.log('[deleteCover] Response body:', result)
    
    if (!response.ok) {
      console.error('[deleteCover] Delete failed:', result)
      throw new Error(result.message || `Failed to delete cover: ${response.status}`)
    }
    
    console.log('[deleteCover] Successfully deleted:', result)
    return result
  },
}

export default alovaInstance
