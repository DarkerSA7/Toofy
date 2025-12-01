'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download, X } from 'lucide-react'
import { importCoverFromUrl } from '@/lib/anime-import-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AnimeImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (imageFile: File, imageUrl: string) => void
}

export function AnimeImportDialog({ open, onOpenChange, onImport }: AnimeImportDialogProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ imageUrl: string; imageFile: File } | null>(null)

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    try {
      setLoading(true)
      const loadingToast = toast.loading('Importing cover image...')

      const result = await importCoverFromUrl(url) as any
      const { imageFile, imageUrl, isBangumi } = result

      // Skip Canvas conversion for Bangumi (CORS issues) - use blob directly
      if (isBangumi) {
        toast.dismiss(loadingToast)
        setPreview({ imageUrl, imageFile })
        return
      }

      // Convert image to high-quality JPEG for consistency (same as add-anime-dialog)
      const canvas = document.createElement('canvas')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const jpegFile = new File([blob], `anime_cover_${Date.now()}.jpg`, { type: 'image/jpeg' })
              const jpegUrl = URL.createObjectURL(jpegFile)
              toast.dismiss(loadingToast)
              setPreview({ imageUrl: jpegUrl, imageFile: jpegFile })
            }
          }, 'image/jpeg', 0.95)
        }
      }

      img.onerror = () => {
        // Fallback if image conversion fails
        toast.dismiss(loadingToast)
        setPreview({ imageUrl, imageFile })
      }

      img.src = imageUrl
    } catch (error: any) {
      toast.error(error.message || 'Failed to import cover')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (preview) {
      onImport(preview.imageFile, preview.imageUrl)
      setUrl('')
      setPreview(null)
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    setPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Import Anime Cover</DialogTitle>
          <DialogDescription>
            Paste a link from AniList, MyAnimeList, or Bangumi
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Anime URL</label>
              <Input
                placeholder='https://anilist.co/anime/11061'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleImport()}
              />
              <p className='text-xs text-muted-foreground'>
                Supported: anilist.co/anime/*, myanimelist.net/anime/*, bangumi.tv/subject/*
              </p>
            </div>

            <Button
              onClick={handleImport}
              disabled={loading || !url.trim()}
              className='w-full'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Importing...
                </>
              ) : (
                <>
                  <Download className='h-4 w-4 mr-2' />
                  Import
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex justify-center rounded-lg border border-border p-4'>
              <img
                src={preview.imageUrl}
                alt='Cover preview'
                className='h-80 w-56 rounded object-cover shadow-lg'
              />
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleBack}
                className='flex-1'
              >
                <X className='h-4 w-4 mr-2' />
                Back
              </Button>
              <Button onClick={handleConfirm} className='flex-1'>
                <Download className='h-4 w-4 mr-2' />
                Use This
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
