'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateHome() {
  try {
    // Revalidate the tags to clear cache
    revalidateTag('anime-list', 'max')
    revalidateTag('slider-items', 'max')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to revalidate' }
  }
}
