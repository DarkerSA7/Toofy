'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { uploadAPI } from '@/lib/alova-client'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { useAuthStore } from '@/stores/auth-store'
import { X, Plus, Image as ImageIcon, Download } from 'lucide-react'
import { AnimeImportDialog } from './anime-import-dialog'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

interface Anime {
  id: string
  title: string
  slug: string
  alternativeNames: string[]
  description: string
  coverUrl: string
  genres: string[]
  status: 'ongoing' | 'completed' | 'upcoming'
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special'
  episodeCount: number
  studio: string
  season: string
  seasonYear: number
  createdAt: string
  updatedAt: string
}

interface EditAnimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anime: Anime | null
  onSuccess: () => void
}

export function EditAnimeDialog({ open, onOpenChange, anime, onSuccess }: EditAnimeDialogProps) {
  const [editAnimeData, setEditAnimeData] = useState<{
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
    seasonYear: 0,
  })
  
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const [editCurrentGenre, setEditCurrentGenre] = useState('')
  const [editCurrentAlternativeName, setEditCurrentAlternativeName] = useState('')
  const [updatingAnime, setUpdatingAnime] = useState(false)
  const [originalCoverUrl, setOriginalCoverUrl] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Update form data when anime changes
  useEffect(() => {
    if (anime && open) {
      setEditAnimeData({
        title: anime.title,
        alternativeNames: Array.isArray(anime.alternativeNames) ? anime.alternativeNames : [],
        description: anime.description,
        status: anime.status,
        type: anime.type,
        episodes: anime.episodeCount || 0,
        studio: anime.studio,
        genres: Array.isArray(anime.genres) ? anime.genres : [],
        coverUrl: anime.coverUrl,
        season: anime.season || '',
        seasonYear: anime.seasonYear || 0,
      })
      setEditCoverFile(null)
      setOriginalCoverUrl(anime.coverUrl || '')
    }
  }, [anime, open])

  const { getRootProps: getEditCoverProps, getInputProps: getEditCoverInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        const imageUrl = URL.createObjectURL(acceptedFiles[0])
        setEditCoverFile(acceptedFiles[0])
        setEditAnimeData({ ...editAnimeData, coverUrl: imageUrl })
      }
    }
  })

  const handleImportCover = (imageFile: File, imageUrl: string) => {
    setEditCoverFile(imageFile)
    setEditAnimeData({ ...editAnimeData, coverUrl: imageUrl })
    toast.success('Cover image imported successfully!')
  }

  const addEditGenre = () => {
    if (editCurrentGenre.trim() && !editAnimeData.genres.includes(editCurrentGenre.trim())) {
      setEditAnimeData({ ...editAnimeData, genres: [...editAnimeData.genres, editCurrentGenre.trim()] })
      setEditCurrentGenre('')
    }
  }

  const removeEditGenre = (genre: string) => {
    setEditAnimeData({ ...editAnimeData, genres: editAnimeData.genres.filter((g) => g !== genre) })
  }

  const handleUpdateAnime = async () => {
    if (!anime) return
    
    // Validate required fields
    if (!editAnimeData.title.trim()) {
      toast.error('Title is required')
      return
    }
    
    let newCoverImageUrl = ''
    let oldCoverImageUrl = ''
    
    try {
      setUpdatingAnime(true)
      let coverImageUrl = editAnimeData.coverUrl
      
      // Upload new cover image if provided
      if (editCoverFile) {
        try {
          const uploadToast = toast.loading('Uploading cover image...')
          const uploadResult = await uploadAPI.uploadCover(editCoverFile)
          if (uploadResult.success && uploadResult.data?.url) {
            newCoverImageUrl = uploadResult.data.url
            coverImageUrl = newCoverImageUrl
            oldCoverImageUrl = originalCoverUrl // Store old URL for deletion
            toast.dismiss(uploadToast)
            toast.success('Cover uploaded')
          } else {
            throw new Error('Upload failed')
          }
        } catch (error) {
          toast.error('Failed to upload cover image')
          setUpdatingAnime(false)
          return
        }
      }
      
      // Prepare update data - match unified schema
      // Keep the original slug to avoid duplicate key errors
      const updateData: any = {
        title: editAnimeData.title,
        slug: anime.slug,
        alternativeNames: editAnimeData.alternativeNames || [],
        description: editAnimeData.description,
        coverUrl: coverImageUrl,
        genres: editAnimeData.genres || [],
        status: editAnimeData.status.toLowerCase(),
        type: editAnimeData.type,
        episodeCount: editAnimeData.episodes || 0,
        studio: editAnimeData.studio || '',
        season: editAnimeData.season && editAnimeData.season !== '-' ? editAnimeData.season.toLowerCase() : '',
        seasonYear: editAnimeData.seasonYear || 0,
      }

      // Update anime via API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
      const token = useAuthStore.getState().token
      
      const updateRes = await fetch(`${API_BASE_URL}/anime/${anime.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })
      const response = await updateRes.json()
      
      if ((response as any)?.success) {
        toast.success('Anime updated successfully!')
        
        // Delete old cover image from iDrive if a new one was uploaded
        if (newCoverImageUrl && oldCoverImageUrl) {
          try {
            await uploadAPI.deleteCover(oldCoverImageUrl)
          } catch (deleteError) {
            // Silently handle error - don't block the success flow
          }
        }
        
        // Revalidate home page cache
        await revalidateHome()
        
        onSuccess()
        
        // Close dialog last
        onOpenChange(false)
      }
    } catch (error: any) {
      // Delete new cover image from iDrive if it was uploaded
      if (newCoverImageUrl) {
        try {
          await uploadAPI.deleteCover(newCoverImageUrl)
          toast.success('Cover image cleaned up')
        } catch (deleteError) {
          // Silently handle error
        }
      }
      
      const errorMessage = error.response?.data?.message || error.message
      if (errorMessage.includes('already exists')) {
        toast.error('⚠️ An anime with this title already exists!')
      } else {
        toast.error('Error updating anime: ' + errorMessage)
      }
    } finally {
      setUpdatingAnime(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Anime</DialogTitle>
          <DialogDescription>Edit anime information</DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='edit-title'>Title</Label>
            <Input
              id='edit-title'
              value={editAnimeData.title}
              onChange={(e) => setEditAnimeData({ ...editAnimeData, title: e.target.value })}
              placeholder='Anime title'
            />
          </div>

          {/* Alternative Names */}
          <div className='space-y-2'>
            <Label>Alternative Names (Optional)</Label>
            <div className='flex gap-2'>
              <Input
                placeholder='Add alternative name'
                value={editCurrentAlternativeName}
                onChange={(e) => setEditCurrentAlternativeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editCurrentAlternativeName.trim()) {
                    e.preventDefault()
                    setEditAnimeData({ ...editAnimeData, alternativeNames: [...editAnimeData.alternativeNames, editCurrentAlternativeName.trim()] })
                    setEditCurrentAlternativeName('')
                  }
                }}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  if (editCurrentAlternativeName.trim()) {
                    setEditAnimeData({ ...editAnimeData, alternativeNames: [...editAnimeData.alternativeNames, editCurrentAlternativeName.trim()] })
                    setEditCurrentAlternativeName('')
                  }
                }}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            {editAnimeData.alternativeNames.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {editAnimeData.alternativeNames.map((name, index) => (
                  <Badge key={index} variant='secondary' className='gap-1'>
                    {name}
                    <button
                      onClick={() => setEditAnimeData({ ...editAnimeData, alternativeNames: editAnimeData.alternativeNames.filter((_, i) => i !== index) })}
                      className='ml-1 hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className='text-xs text-muted-foreground'>
              Alternative names help with SEO and search
            </p>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Description</Label>
            <Textarea
              id='edit-description'
              value={editAnimeData.description}
              onChange={(e) => setEditAnimeData({ ...editAnimeData, description: e.target.value })}
              placeholder='Anime description'
              rows={4}
            />
          </div>

          {/* Cover Image */}
          <div className='space-y-2'>
            <Label>Cover Image</Label>
            <div
              {...getEditCoverProps()}
              className='border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors'
            >
              <input {...getEditCoverInputProps()} />
              {editAnimeData.coverUrl ? (
                <div className='space-y-2'>
                  <img
                    src={editAnimeData.coverUrl}
                    alt='Cover preview'
                    className='w-56 h-80 object-cover mx-auto rounded-lg shadow-lg'
                    crossOrigin='anonymous'
                    onError={(e) => {
                      // Hide the image if it fails to load - no placeholder
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <p className='text-sm text-muted-foreground'>Click or drag to change image</p>
                </div>
              ) : null}
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => setImportDialogOpen(true)}
              className='w-full'
            >
              <Download className='h-4 w-4 mr-2' />
              Import from URL
            </Button>
          </div>

          {/* Status and Type */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-status'>Status</Label>
              <Select
                value={editAnimeData.status}
                onValueChange={(value) => setEditAnimeData({ ...editAnimeData, status: value as 'ongoing' | 'completed' | 'upcoming' })}
              >
                <SelectTrigger id='edit-status'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ongoing'>Ongoing</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='upcoming'>Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-type'>Type</Label>
              <Select
                value={editAnimeData.type}
                onValueChange={(value) => setEditAnimeData({ ...editAnimeData, type: value as 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' })}
              >
                <SelectTrigger id='edit-type'>
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
          </div>

          {/* Season and Year */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-season-year'>Year</Label>
              <Input
                id='edit-season-year'
                type='number'
                placeholder='Enter year (e.g., 2024)'
                value={editAnimeData.seasonYear || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setEditAnimeData({ ...editAnimeData, seasonYear: value ? parseInt(value) : 0 })
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-season'>Season</Label>
              <Select
                value={editAnimeData.season && editAnimeData.season !== '-' ? editAnimeData.season : ''}
                onValueChange={(value: string) => setEditAnimeData({ ...editAnimeData, season: value })}
              >
                <SelectTrigger id='edit-season'>
                  <SelectValue placeholder='Select season' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Winter'>Winter</SelectItem>
                  <SelectItem value='Spring'>Spring</SelectItem>
                  <SelectItem value='Summer'>Summer</SelectItem>
                  <SelectItem value='Fall'>Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Episodes and Studio */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-episodes'>Total Episodes</Label>
              <Input
                id='edit-episodes'
                type='number'
                value={editAnimeData.episodes}
                onChange={(e) => setEditAnimeData({ ...editAnimeData, episodes: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-studio'>Studio</Label>
              <Input
                id='edit-studio'
                value={editAnimeData.studio}
                onChange={(e) => setEditAnimeData({ ...editAnimeData, studio: e.target.value })}
                placeholder='Studio name'
              />
            </div>
          </div>

          {/* Genres */}
          <div className='space-y-2'>
            <Label>Genres</Label>
            <div className='flex gap-2'>
              <Input
                value={editCurrentGenre}
                onChange={(e) => setEditCurrentGenre(e.target.value)}
                placeholder='Add genre'
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditGenre())}
              />
              <Button type='button' onClick={addEditGenre} size='icon'>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex flex-wrap gap-2 mt-2'>
              {editAnimeData.genres.map((genre) => (
                <Badge key={genre} variant='secondary' className='gap-1'>
                  {genre}
                  <button
                    onClick={() => removeEditGenre(genre)}
                    className='ml-1 hover:text-destructive'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={updatingAnime}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAnime}
              disabled={updatingAnime || !editAnimeData.title}
            >
              {updatingAnime ? (
                <>
                  <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      <AnimeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportCover}
      />
    </Dialog>
  )
}
