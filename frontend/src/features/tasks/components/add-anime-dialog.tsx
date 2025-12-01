'use client'

import { useState } from 'react'
import { animeAPI, uploadAPI } from '@/lib/alova-client'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Upload, Image as ImageIcon, Download, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

type AddAnimeDialogProps = {
  open: boolean
  onOpenChange: () => void
  onSuccess?: () => void
}

export function AddAnimeDialog({ open, onOpenChange, onSuccess }: AddAnimeDialogProps) {
  const [newAnime, setNewAnime] = useState<{
    title: string
    alternativeNames: string[]
    description: string
    status: 'ongoing' | 'completed' | 'upcoming'
    type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special'
    episodes: number
    studio: string
    genres: string[]
    coverUrl: string
    season: string
    seasonYear: number
  }>({
    title: '',
    alternativeNames: [],
    description: '',
    status: 'ongoing',
    type: 'TV',
    episodes: 12,
    studio: '',
    genres: [],
    coverUrl: '',
    season: '',
    seasonYear: new Date().getFullYear(),
  })
  const [currentGenre, setCurrentGenre] = useState('')
  const [currentAltName, setCurrentAltName] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)

  const addGenre = () => {
    if (currentGenre.trim() && !newAnime.genres.includes(currentGenre.trim())) {
      setNewAnime({ ...newAnime, genres: [...newAnime.genres, currentGenre.trim()] })
      setCurrentGenre('')
    }
  }

  const removeGenre = (genre: string) => {
    setNewAnime({ ...newAnime, genres: newAnime.genres.filter((g) => g !== genre) })
  }

  const addAltName = () => {
    if (currentAltName.trim() && !newAnime.alternativeNames.includes(currentAltName.trim())) {
      setNewAnime({ ...newAnime, alternativeNames: [...newAnime.alternativeNames, currentAltName.trim()] })
      setCurrentAltName('')
    }
  }

  const removeAltName = (name: string) => {
    setNewAnime({ ...newAnime, alternativeNames: newAnime.alternativeNames.filter((n) => n !== name) })
  }

  // Helper: Import from AniList
  const importFromAniList = async (anilistId: string) => {
    
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
    
    // Download cover - use extraLarge for best quality
    let coverFile: File | null = null
    let coverUrl = ''
    const coverImageUrl = data.coverImage?.extraLarge || data.coverImage?.large || data.coverImage?.medium
    if (coverImageUrl) {
      try {
        const imageResponse = await fetch(coverImageUrl)
        const blob = await imageResponse.blob()
        coverFile = new File([blob], `cover_anilist_${anilistId}.jpg`, { type: 'image/jpeg' })
        coverUrl = URL.createObjectURL(coverFile)
        setCoverFile(coverFile)
      } catch (error) {
        // Silently handle error
      }
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
      coverImage: coverUrl,
    }
  }

  // Main import function
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    
    // Detect URL type (AniList or MyAnimeList only)
    const anilistMatch = importUrl.match(/anilist\.co\/anime\/(\d+)/)
    const malMatch = importUrl.match(/myanimelist\.net\/anime\/(\d+)/)
    
    if (!anilistMatch && !malMatch) {
      toast.error('Invalid URL. Supported: anilist.co/anime/XXX or myanimelist.net/anime/XXX')
      return
    }
    
    try {
      setImporting(true)
      const loadingToast = toast.loading('Importing anime data...')
      
      // If AniList URL - use AniList directly
      if (anilistMatch) {
        const anilistId = anilistMatch[1]
        const anilistData = await importFromAniList(anilistId)
        
        // Update form with AniList data
        setNewAnime({
          title: anilistData.title,
          alternativeNames: anilistData.alternativeNames,
          description: anilistData.description,
          status: anilistData.status,
          type: anilistData.type,
          episodes: anilistData.episodes,
          studio: anilistData.studio,
          genres: anilistData.genres,
          coverUrl: anilistData.coverImage,
          season: anilistData.season,
          seasonYear: anilistData.seasonYear,
        })
        
        // Dismiss loading toast and show success toast
        toast.dismiss()
        toast.success('Anime data imported from AniList!')
        setImportUrl('')
        setImporting(false)
        return
      }
      
      // If MyAnimeList URL
      let malData: any = null
      
      if (malMatch) {
        const malId = malMatch[1]
        
        // Get data directly from MAL using Jikan API
        const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}`)
        const jikanData = await jikanResponse.json()
        malData = jikanData.data
        
      }
      
      if (!malData) {
        // Dismiss loading toast and show error
        toast.dismiss()
        toast.error('Failed to get anime data')
        setImporting(false)
        return
      }
      
      // Map type from MAL
      let animeType: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' = 'TV'
      if (malData.type === 'TV') animeType = 'TV'
      else if (malData.type === 'Movie') animeType = 'Movie'
      else if (malData.type === 'OVA') animeType = 'OVA'
      else if (malData.type === 'ONA') animeType = 'ONA'
      else if (malData.type === 'Special') animeType = 'Special'
      
      // Map status from MAL
      let animeStatus: 'ongoing' | 'completed' | 'upcoming' = 'completed'
      if (malData.status === 'Currently Airing') animeStatus = 'ongoing'
      else if (malData.status === 'Not yet aired') animeStatus = 'upcoming'
      else animeStatus = 'completed'
      
      // Extract genres from MAL
      const genres: string[] = []
      if (malData.genres && Array.isArray(malData.genres)) {
        malData.genres.forEach((genre: any) => {
          if (genres.length < 5) {
            genres.push(genre.name)
          }
        })
      }
      
      // Extract season and year from MAL
      let season = ''
      let seasonYear = new Date().getFullYear()
      
      if (malData.season) {
        season = malData.season.toLowerCase()
      }
      
      if (malData.year) {
        seasonYear = malData.year
      } else if (malData.aired && malData.aired.from) {
        const date = new Date(malData.aired.from)
        seasonYear = date.getFullYear()
        const month = date.getMonth() + 1
        if (!season) {
          if (month >= 1 && month <= 3) season = 'winter'
          else if (month >= 4 && month <= 6) season = 'spring'
          else if (month >= 7 && month <= 9) season = 'summer'
          else season = 'fall'
        }
      }
      
      // Extract studio from MAL
      let studio = ''
      if (malData.studios && Array.isArray(malData.studios) && malData.studios.length > 0) {
        studio = malData.studios[0].name
      }
      
      // Step 3: Download cover image
      let coverImageUrl = ''
      let downloadedFile: File | null = null
      
      // Always use MAL image (more reliable and no CORS issues)
      if (malData.images && malData.images.jpg && malData.images.jpg.large_image_url) {
        try {
          const malImageUrl = malData.images.jpg.large_image_url
          const imageResponse = await fetch(malImageUrl)
          const blob = await imageResponse.blob()
          const fileName = `cover_${malData.mal_id}.jpg`
          downloadedFile = new File([blob], fileName, { type: 'image/jpeg' })
          coverImageUrl = URL.createObjectURL(downloadedFile)
          setCoverFile(downloadedFile)
        } catch (error) {
        }
      }
      
      // Extract alternative names from MAL
      const alternativeNames: string[] = []
      if (malData.title && malData.title !== malData.title_english) {
        alternativeNames.push(malData.title)
      }
      if (malData.title_japanese) {
        alternativeNames.push(malData.title_japanese)
      }
      if (malData.titles && Array.isArray(malData.titles)) {
        malData.titles.forEach((t: any) => {
          if (t.title && !alternativeNames.includes(t.title)) {
            alternativeNames.push(t.title)
          }
        })
      }
      
      // Update form with imported data
      setNewAnime({
        title: malData.title_english || malData.title,
        alternativeNames: alternativeNames,
        description: malData.synopsis || '',
        status: animeStatus,
        type: animeType,
        episodes: malData.episodes || 12,
        studio: studio,
        genres: genres,
        coverUrl: coverImageUrl,
        season: season,
        seasonYear: seasonYear,
      })
      
      // Dismiss loading toast and show success
      toast.dismiss()
      toast.success('Anime data imported from MyAnimeList!')
      setImportUrl('')
      
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss()
      
      // Show appropriate error message
      if (error.response?.status === 404) {
        toast.error('Anime not found')
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.')
      } else {
        toast.error('Failed to import: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setImporting(false)
    }
  }

  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setCoverFile(acceptedFiles[0])
        const url = URL.createObjectURL(acceptedFiles[0])
        setNewAnime({ ...newAnime, coverUrl: url })
      }
    }
  })

  const handleSubmit = async () => {
    if (!newAnime.title) {
      toast.error('Please enter anime title')
      return
    }
    
    if (uploading) return
    
    let coverImageUrl = ''
    
    try {
      setUploading(true)
      
      // Upload cover if selected
      if (coverFile) {
        const uploadToast = toast.loading('Uploading cover image...')
        try {
          const uploadResult = await uploadAPI.uploadCover(coverFile)
          if (uploadResult.success && uploadResult.data?.url) {
            coverImageUrl = uploadResult.data.url
            toast.dismiss(uploadToast)
            toast.success('Cover uploaded')
          } else {
            throw new Error('Upload failed')
          }
        } catch (error) {
          toast.dismiss(uploadToast)
          toast.error('Failed to upload cover')
          setUploading(false)
          return
        }
      }
      
      // Create anime - match unified schema
      // Generate unique slug by adding timestamp to avoid duplicates
      const baseSlug = newAnime.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const slug = `${baseSlug}-${Date.now()}`
      
      // Validate season
      const validSeasons = ['spring', 'summer', 'fall', 'winter', '']
      const season = newAnime.season ? newAnime.season.toLowerCase() : ''
      if (season && !validSeasons.includes(season)) {
        toast.error(`Invalid season: ${newAnime.season}. Must be: Spring, Summer, Fall, or Winter`)
        setUploading(false)
        return
      }
      
      const animeData: any = {
        title: newAnime.title,
        slug: slug,
        alternativeNames: newAnime.alternativeNames || [],
        description: newAnime.description,
        coverUrl: coverImageUrl,
        genres: newAnime.genres && newAnime.genres.length > 0 ? newAnime.genres : [],
        status: newAnime.status,
        type: newAnime.type,
        episodeCount: newAnime.episodes,
        studio: newAnime.studio || '',
        season: season,
        seasonYear: newAnime.seasonYear || 0,
      }

      // Create anime
      const response = await animeAPI.create(animeData)
      
      if ((response as any)?.success) {
        toast.success('Anime added successfully!')
        
        // Revalidate home page cache
        await revalidateHome()
        
        // Trigger data refresh
        if (onSuccess) onSuccess()
        
        // Reset form
        setNewAnime({
          title: '',
          alternativeNames: [],
          description: '',
          status: 'ongoing',
          type: 'TV',
          episodes: 12,
          studio: '',
          genres: [],
          coverUrl: '',
          season: '',
          seasonYear: new Date().getFullYear(),
        })
        setCoverFile(null)
        
        // Close dialog last
        onOpenChange()
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      
      // Delete cover image from iDrive if it was uploaded
      if (coverImageUrl) {
        try {
          await uploadAPI.deleteCover(coverImageUrl)
          toast.success('Cover image cleaned up')
        } catch (deleteError) {
          // Silently handle error
        }
      }
      
      if (errorMessage.includes('duplicate key')) {
        toast.error('Anime with this title already exists!')
      } else if (errorMessage.includes('already exists')) {
        toast.error('Anime already exists!')
      } else {
        toast.error('Error: ' + errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Anime</DialogTitle>
          <DialogDescription>Add a new anime to your collection</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Import from AniList or MyAnimeList */}
          <div className='space-y-2 p-4 border rounded-lg bg-muted/30'>
            <Label>Import from AniList or MyAnimeList (Optional)</Label>
            <p className='text-xs text-muted-foreground mb-2'>
              Paste a URL to auto-fill anime information (supports anilist.co and myanimelist.net)
            </p>
            <div className='flex gap-2'>
              <Input
                placeholder='https://anilist.co/anime/137 or https://myanimelist.net/anime/136'
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={importing}
              />
              <Button
                onClick={handleImportFromUrl}
                disabled={importing || !importUrl.trim()}
                variant='secondary'
              >
                {importing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className='space-y-2'>
            <Label>Cover Image</Label>
            <div
              {...getCoverProps()}
              className='border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors'
            >
              <input {...getCoverInputProps()} />
              {newAnime.coverUrl ? (
                <div className='relative w-48 h-72 mx-auto'>
                  <img
                    src={newAnime.coverUrl}
                    alt='Cover'
                    className='w-full h-full object-cover rounded-lg'
                  />
                  <Button
                    size='icon'
                    variant='destructive'
                    className='absolute top-2 right-2'
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewAnime({ ...newAnime, coverUrl: '' })
                      setCoverFile(null)
                    }}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 py-8'>
                  <ImageIcon className='h-12 w-12 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    Click or drag to upload cover image
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>Title *</Label>
            <Input
              id='title'
              placeholder='Enter anime title'
              value={newAnime.title}
              onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
            />
          </div>

          {/* Alternative Names */}
          <div className='space-y-2'>
            <Label>Alternative Names</Label>
            <div className='flex gap-2'>
              <Input
                placeholder='Add alternative name (e.g., Japanese title)'
                value={currentAltName}
                onChange={(e) => setCurrentAltName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAltName())}
              />
              <Button type='button' size='icon' onClick={addAltName}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            {newAnime.alternativeNames.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {newAnime.alternativeNames.map((name, index) => (
                  <Badge key={index} variant='secondary'>
                    {name}
                    <button
                      type='button'
                      onClick={() => removeAltName(name)}
                      className='ml-1 hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Type and Status */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Type *</Label>
              <Select
                value={newAnime.type}
                onValueChange={(value: any) => setNewAnime({ ...newAnime, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TV'>TV</SelectItem>
                  <SelectItem value='Movie'>Movie</SelectItem>
                  <SelectItem value='OVA'>OVA</SelectItem>
                  <SelectItem value='ONA'>ONA</SelectItem>
                  <SelectItem value='Special'>Special</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Status *</Label>
              <Select
                value={newAnime.status}
                onValueChange={(value: any) => setNewAnime({ ...newAnime, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ongoing'>Ongoing</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='upcoming'>Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Episodes and Studio */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Episodes</Label>
              <Input
                type='number'
                value={newAnime.episodes}
                onChange={(e) => setNewAnime({ ...newAnime, episodes: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className='space-y-2'>
              <Label>Studio</Label>
              <Input
                placeholder='Enter studio name'
                value={newAnime.studio}
                onChange={(e) => setNewAnime({ ...newAnime, studio: e.target.value })}
              />
            </div>
          </div>

          {/* Season and Year */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Year</Label>
              <Input
                type='number'
                placeholder='2024'
                value={newAnime.seasonYear}
                onChange={(e) => setNewAnime({ ...newAnime, seasonYear: parseInt(e.target.value) || new Date().getFullYear() })}
              />
            </div>

            <div className='space-y-2'>
              <Label>Season</Label>
              <Select
                value={newAnime.season}
                onValueChange={(value: string) => setNewAnime({ ...newAnime, season: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select season' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='winter'>Winter</SelectItem>
                  <SelectItem value='spring'>Spring</SelectItem>
                  <SelectItem value='summer'>Summer</SelectItem>
                  <SelectItem value='fall'>Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              placeholder='Enter anime description'
              rows={4}
              value={newAnime.description}
              onChange={(e) => setNewAnime({ ...newAnime, description: e.target.value })}
            />
          </div>

          {/* Genres */}
          <div className='space-y-2'>
            <Label>Genres</Label>
            <div className='flex gap-2'>
              <Input
                placeholder='Add genre (e.g., Action)'
                value={currentGenre}
                onChange={(e) => setCurrentGenre(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addGenre()
                  }
                }}
              />
              <Button type='button' onClick={addGenre} size='icon'>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            {newAnime.genres.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {newAnime.genres.map((genre) => (
                  <Badge key={genre} variant='secondary' className='gap-1'>
                    {genre}
                    <button
                      onClick={() => removeGenre(genre)}
                      className='ml-1 hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onOpenChange}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!newAnime.title || uploading}>
              {uploading ? (
                <>
                  <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Anime
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
