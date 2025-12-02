'use client'

import { useState } from 'react'
import { animeAPI, uploadAPI } from '@/lib/alova-client'
import { getImageUrl } from '@/lib/image-url-helper'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, CheckCircle2, XCircle } from 'lucide-react'

type BulkAddAnimeDialogProps = {
  open: boolean
  onOpenChange: () => void
  onSuccess?: () => void
}

type ImportResult = {
  url: string
  status: 'pending' | 'success' | 'error'
  title?: string
  error?: string
}

export function BulkAddAnimeDialog({ open, onOpenChange, onSuccess }: BulkAddAnimeDialogProps) {
  const [urls, setUrls] = useState('')
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [progress, setProgress] = useState(0)

  // Helper: Import from AniList
  const importFromAniList = async (anilistId: string, downloadCover: boolean = true) => {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          title { romaji english native }
          synonyms
          description
          format
          status
          episodes
          season
          seasonYear
          studios { nodes { name } }
          genres
          coverImage { extraLarge large medium }
        }
      }
    `
    
    // Use native fetch for external APIs that don't need caching
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(anilistId) }
      })
    })
    const responseData = await response.json()
    
    const data = responseData.data.Media
    
    // Map format
    let type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' = 'TV'
    if (data.format === 'TV') type = 'TV'
    else if (data.format === 'MOVIE') type = 'Movie'
    else if (data.format === 'OVA') type = 'OVA'
    else if (data.format === 'ONA') type = 'ONA'
    else if (data.format === 'SPECIAL') type = 'Special'
    
    // Map status
    let status: 'ongoing' | 'completed' | 'upcoming' = 'completed'
    if (data.status === 'RELEASING') status = 'ongoing'
    else if (data.status === 'NOT_YET_RELEASED') status = 'upcoming'
    else status = 'completed'
    
    // Alternative names
    const altNames: string[] = []
    if (data.title.english && data.title.english !== data.title.romaji) {
      altNames.push(data.title.english)
    }
    if (data.title.native) {
      altNames.push(data.title.native)
    }
    if (data.synonyms && Array.isArray(data.synonyms)) {
      altNames.push(...data.synonyms.slice(0, 5))
    }
    
    // Download cover only if requested - use extraLarge for best quality
    let coverImageUrl = ''
    if (downloadCover && data.coverImage) {
      const bestQualityUrl = data.coverImage.extraLarge || data.coverImage.large || data.coverImage.medium
      if (bestQualityUrl) {
        try {
          const imageResponse = await fetch(bestQualityUrl)
          const blob = await imageResponse.blob()
          const file = new File([blob], `cover_anilist_${anilistId}.jpg`, { type: 'image/jpeg' })
          const uploadResponse = await uploadAPI.uploadCover(file)
          if ((uploadResponse as any)?.success) {
            coverImageUrl = (uploadResponse as any).data.url
          }
        } catch (error) {
          // Silently handle error
        }
      }
    } else if (!downloadCover && data.coverImage) {
      // Just use the URL directly without downloading when we're just checking
      coverImageUrl = 'placeholder'
    }
    
    return {
      title: data.title.english || data.title.romaji,
      alternativeNames: altNames,
      description: data.description?.replace(/<[^>]*>/g, '') || '',
      type,
      status,
      episodes: data.episodes || 12,
      studio: data.studios?.nodes?.[0]?.name || '',
      genres: data.genres?.slice(0, 5) || [],
      season: data.season?.toUpperCase() || '',
      seasonYear: data.seasonYear || new Date().getFullYear(),
      coverImage: coverImageUrl,
    }
  }

  // Helper: Import from MyAnimeList
  const importFromMAL = async (malId: string, downloadCover: boolean = true) => {
    // Use native fetch for external APIs
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}`)
    const jikanData = await jikanResponse.json()
    const malData = jikanData.data
    
    // Map type
    let type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' = 'TV'
    if (malData.type === 'TV') type = 'TV'
    else if (malData.type === 'Movie') type = 'Movie'
    else if (malData.type === 'OVA') type = 'OVA'
    else if (malData.type === 'ONA') type = 'ONA'
    else if (malData.type === 'Special') type = 'Special'
    
    // Map status
    let status: 'ongoing' | 'completed' | 'upcoming' = 'completed'
    if (malData.status === 'Currently Airing') status = 'ongoing'
    else if (malData.status === 'Not yet aired') status = 'upcoming'
    else status = 'completed'
    
    // Alternative names
    const altNames: string[] = []
    if (malData.title && malData.title !== malData.title_english) {
      altNames.push(malData.title)
    }
    if (malData.title_japanese) {
      altNames.push(malData.title_japanese)
    }
    if (malData.titles && Array.isArray(malData.titles)) {
      malData.titles.forEach((t: any) => {
        if (t.title && !altNames.includes(t.title)) {
          altNames.push(t.title)
        }
      })
    }
    
    // Download cover only if requested
    let coverImageUrl = ''
    if (downloadCover && malData.images && malData.images.jpg && malData.images.jpg.large_image_url) {
      try {
        const imageResponse = await fetch(malData.images.jpg.large_image_url)
        const blob = await imageResponse.blob()
        const file = new File([blob], `cover_mal_${malId}.jpg`, { type: 'image/jpeg' })
        const uploadResponse = await uploadAPI.uploadCover(file)
        if ((uploadResponse as any)?.success) {
          coverImageUrl = (uploadResponse as any).data.url
        }
      } catch (error) {
        // Silently handle error
      }
    } else if (!downloadCover && malData.images && malData.images.jpg) {
      // Just use the URL directly without downloading when we're just checking
      coverImageUrl = 'placeholder'
    }
    
    // Extract genres
    const genres: string[] = []
    if (malData.genres && Array.isArray(malData.genres)) {
      malData.genres.forEach((genre: any) => {
        if (genres.length < 5) {
          genres.push(genre.name)
        }
      })
    }
    
    // Extract season and year
    let season = ''
    let seasonYear = new Date().getFullYear()
    
    if (malData.season) {
      season = malData.season.toUpperCase()
    }
    
    if (malData.year) {
      seasonYear = malData.year
    } else if (malData.aired && malData.aired.from) {
      const date = new Date(malData.aired.from)
      seasonYear = date.getFullYear()
      const month = date.getMonth() + 1
      if (!season) {
        if (month >= 1 && month <= 3) season = 'WINTER'
        else if (month >= 4 && month <= 6) season = 'SPRING'
        else if (month >= 7 && month <= 9) season = 'SUMMER'
        else season = 'FALL'
      }
    }
    
    // Extract studio
    let studio = ''
    if (malData.studios && Array.isArray(malData.studios) && malData.studios.length > 0) {
      studio = malData.studios[0].name
    }
    
    return {
      title: malData.title,
      alternativeNames: altNames,
      description: malData.synopsis || '',
      type,
      status,
      episodes: malData.episodes || 12,
      studio,
      genres,
      season,
      seasonYear,
      coverImage: coverImageUrl,
    }
  }

  const handleBulkImport = async () => {
    const urlList = urls.split('\n').filter(url => url.trim())
    
    if (urlList.length === 0) {
      toast.error('Please enter at least one URL')
      return
    }
    
    if (importing) {
      return
    }
    
    try {
      setImporting(true)
      const importResults: ImportResult[] = urlList.map(url => ({
        url: url.trim(),
        status: 'pending'
      }))
      setResults(importResults)
      setProgress(0)
      
      // Import in parallel (max 3 at a time to avoid rate limiting)
      const importPromises = urlList.map(async (url, i) => {
      const trimmedUrl = url.trim()
      let coverImageUrl = ''
      
      try {
        const anilistMatch = trimmedUrl.match(/anilist\.co\/anime\/(\d+)/)
        const malMatch = trimmedUrl.match(/myanimelist\.net\/anime\/(\d+)/)
        
        if (!anilistMatch && !malMatch) {
          throw new Error('Invalid URL format')
        }
        
        let animeData: any
        
        if (anilistMatch) {
          // Get full data with cover
          animeData = await importFromAniList(anilistMatch[1], true)
        } else if (malMatch) {
          // Get full data with cover
          animeData = await importFromMAL(malMatch[1], true)
        }
        
        // Store cover URL for cleanup if needed
        coverImageUrl = animeData.coverImage || ''
        
        // Prepare anime data - only include non-empty values
        // Generate unique slug by adding timestamp to avoid duplicates
        const baseSlug = animeData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const createData: any = {
          title: animeData.title,
          slug: `${baseSlug}-${Date.now()}`,
          description: animeData.description || '',
          status: animeData.status.toLowerCase(),
          type: animeData.type,
          episodeCount: animeData.episodes || 0,
          coverUrl: animeData.coverImage || '',
        }
        
        // Always include alternativeNames, even if empty
        createData.alternativeNames = animeData.alternativeNames || [];
        
        if (animeData.studio) createData.studio = animeData.studio
        if (animeData.genres && animeData.genres.length > 0) {
          createData.genres = animeData.genres
        }
        if (animeData.season) createData.season = animeData.season.toLowerCase()
        if (animeData.seasonYear) createData.seasonYear = animeData.seasonYear
        
        // Create anime
        await animeAPI.create(createData)
        
        return {
          index: i,
          url: trimmedUrl,
          status: 'success' as const,
          title: animeData.title
        }
      } catch (error: any) {
        // Delete cover image from iDrive if it was uploaded
        if (coverImageUrl && coverImageUrl !== 'placeholder') {
          try {
            await uploadAPI.deleteCover(coverImageUrl)
          } catch (deleteError) {
            // Silently handle error
          }
        }
        
        return {
          index: i,
          url: trimmedUrl,
          status: 'error' as const,
          error: error.message || 'Failed to import'
        }
      }
    })
    
    // Wait for all imports to complete
    const results = await Promise.allSettled(importPromises)
    
    // Update results
    let successCount = 0
    let errorCount = 0
    
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const data = result.value
        importResults[data.index] = {
          url: data.url,
          status: data.status,
          title: data.title,
          error: data.error
        }
        if (data.status === 'success') {
          successCount++
        } else {
          errorCount++
        }
      } else {
        importResults[i].status = 'error'
        importResults[i].error = 'Failed to import'
        errorCount++
      }
    })
    
      setResults([...importResults])
      setProgress(100)
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} anime!`)
        handleReset()
        
        // Revalidate home page cache
        await revalidateHome()
        
        if (onSuccess) {
          onSuccess()
        }
        
        onOpenChange()
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} anime`)
      }
    } catch (error: any) {
      toast.error('Error during bulk import: ' + (error.message || 'Unknown error'))
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setUrls('')
    setResults([])
    setProgress(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle>Bulk Add Anime</DialogTitle>
          <DialogDescription>
            Import multiple anime at once from AniList or MyAnimeList
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* URL Input */}
          <div className='space-y-2'>
            <Label>Anime URLs (one per line)</Label>
            <Textarea
              placeholder={'https://anilist.co/anime/137\nhttps://myanimelist.net/anime/136\nhttps://anilist.co/anime/21'}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              disabled={importing}
              rows={10}
              className='font-mono text-sm'
            />
            <p className='text-xs text-muted-foreground'>
              Supports AniList and MyAnimeList URLs. Paste one URL per line.
            </p>
          </div>

          {/* Progress */}
          {importing && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Importing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-primary/20'>
                <div
                  className='h-full bg-primary transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className='space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4'>
              <Label>Import Results</Label>
              {results.map((result, index) => (
                <div
                  key={index}
                  className='flex items-start gap-2 text-sm p-2 rounded border'
                >
                  {result.status === 'pending' && (
                    <Loader2 className='h-4 w-4 animate-spin mt-0.5 flex-shrink-0' />
                  )}
                  {result.status === 'success' && (
                    <CheckCircle2 className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  )}
                  {result.status === 'error' && (
                    <XCircle className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>
                      {result.title || result.url}
                    </p>
                    {result.error && (
                      <p className='text-xs text-red-500 truncate'>{result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-2'>
            {results.length > 0 && !importing && (
              <Button variant='outline' onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button
              onClick={handleBulkImport}
              disabled={importing || !urls.trim()}
            >
              {importing ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Import All
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
