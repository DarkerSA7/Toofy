'use client'

import { useState } from 'react'
import { animeAPI, uploadAPI } from '@/lib/alova-client'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Anime {
  id: string
  title: string
  coverUrl?: string
}

interface DeleteAnimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anime: Anime | null
  onSuccess: () => void
}

export function DeleteAnimeDialog({ open, onOpenChange, anime, onSuccess }: DeleteAnimeDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAnime = async () => {
    if (!anime) return
    
    try {
      setDeleting(true)
      console.log('[handleDeleteAnime] Starting deletion for anime:', anime.title, anime.id)
      
      // Step 1: Delete cover image from iDrive first
      if (anime.coverUrl) {
        console.log('[handleDeleteAnime] Anime has coverUrl:', anime.coverUrl)
        try {
          console.log('[handleDeleteAnime] Calling uploadAPI.deleteCover...')
          const deleteResult = await uploadAPI.deleteCover(anime.coverUrl)
          console.log('[handleDeleteAnime] deleteCover result:', deleteResult)
          if (deleteResult?.success) {
            toast.success('Image deleted from storage')
          } else {
            toast.warning('Image deletion may have failed, but continuing with anime deletion')
          }
        } catch (error: any) {
          const errorMsg = error?.message || 'Unknown error'
          console.error('[handleDeleteAnime] Error deleting image:', error)
          toast.warning(`Could not delete image: ${errorMsg}. Continuing with anime deletion...`)
        }
      } else {
        console.log('[handleDeleteAnime] No coverUrl found for anime')
      }
      
      // Step 2: Delete anime from database
      console.log('[handleDeleteAnime] Deleting anime from database...')
      const deleteResult = await animeAPI.delete(anime.id)
      if (!deleteResult?.success) {
        throw new Error('Failed to delete anime from database')
      }
      
      toast.success('Anime deleted successfully!')
      
      // Step 3: Revalidate cache to update home page and slider
      console.log('[handleDeleteAnime] Revalidating home cache...')
      await revalidateHome()
      
      // Step 4: Update local state
      onSuccess()
      
      // Step 5: Close dialog
      onOpenChange(false)
    } catch (error: any) {
      const message = error?.message || 'Error deleting anime'
      console.error('[handleDeleteAnime] Error:', error)
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete Anime</DialogTitle>
          <DialogDescription>
            Confirm deletion of this anime
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground mb-4'>
            Are you sure you want to delete <span className='font-semibold text-foreground'>"{anime?.title}"</span>? This action cannot be undone.
          </p>
          <div className='flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
            <Trash2 className='h-4 w-4 text-destructive' />
            <p className='text-sm text-destructive'>
              All episodes and data associated with this anime will be permanently deleted.
            </p>
          </div>
        </div>
        <div className='flex justify-end gap-3'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDeleteAnime}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
