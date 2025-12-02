/**
 * Convert image URLs to absolute URLs for display
 * Handles localhost URLs, relative paths, and absolute URLs
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return ''

  let finalUrl = url

  // Convert localhost URLs to production API URL
  if (finalUrl.includes('localhost:8081')) {
    const path = finalUrl.split('localhost:8081')[1]
    finalUrl = `${process.env.NEXT_PUBLIC_API_URL}${path.replace('/api', '')}`
  }
  // Convert relative URLs to absolute
  else if (finalUrl.startsWith('/api')) {
    finalUrl = `${process.env.NEXT_PUBLIC_API_URL}${finalUrl.replace('/api', '')}`
  }
  // If it's already an absolute URL or a data URL, return as is
  else if (finalUrl.startsWith('http') || finalUrl.startsWith('data:')) {
    return finalUrl
  }

  return finalUrl
}
