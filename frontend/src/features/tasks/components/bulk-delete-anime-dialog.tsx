'use client'

import { useState } from 'react'
import { animeAPI, uploadAPI } from '@/lib/alova-client'
import { revalidateHome } from '@/app/(authenticated)/home/actions'
import { toast } from 'sonner'
import { Trash2, AlertTriangle } from 'lucide-react'

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

interface BulkDeleteAnimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAnimes: Anime[]
  onSuccess: () => Promise<void>
}

export function BulkDeleteAnimeDialog({ open, onOpenChange, selectedAnimes, onSuccess }: BulkDeleteAnimeDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleBulkDeleteAnime = async () => {
    if (selectedAnimes.length === 0) return
    
    try {
      setDeleting(true)
      
      // Delete cover images from iDrive first (with error handling)
      const deleteImagePromises = selectedAnimes
        .filter(anime => anime.coverUrl)
        .map(anime => 
          uploadAPI.deleteCover(anime.coverUrl!).catch((error) => {
            // Log but don't stop the process if image deletion fails
            console.warn(`Failed to delete image for ${anime.title}:`, error)
          })
        )
      
      if (deleteImagePromises.length > 0) {
        await Promise.all(deleteImagePromises)
      }
      
      // Delete all selected animes from database
      const deletePromises = selectedAnimes.map(anime => 
        animeAPI.delete(anime.id).catch((error) => {
          throw new Error(`Failed to delete ${anime.title}: ${error.message}`)
        })
      )
      
      await Promise.all(deletePromises)
      
      // Show success message
      toast.success(`Successfully deleted ${selectedAnimes.length} anime(s)!`)
      
      // Revalidate home page cache (updates slider and anime list)
      await revalidateHome()
      
      // Call onSuccess to refresh the table
      await onSuccess()
      
      // Close dialog
      onOpenChange(false)
    } catch (error: any) {
      const message = error?.message || 'Error deleting animes'
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete Multiple Anime</DialogTitle>
          <DialogDescription>
            Confirm deletion of selected anime
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground mb-4'>
            Are you sure you want to delete <span className='font-semibold text-foreground'>{selectedAnimes.length} anime(s)</span>? This action cannot be undone.
          </p>
          
          {/* List of selected animes */}
          <div className='mb-4 max-h-[200px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-3'>
            <div className='space-y-2'>
              {selectedAnimes.map((anime) => (
                <div key={anime.id} className='flex items-center gap-2 text-sm'>
                  <div className='h-2 w-2 rounded-full bg-destructive' />
                  <span className='truncate text-foreground'>{anime.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className='flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3'>
            <AlertTriangle className='h-5 w-5 text-destructive flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm font-semibold text-destructive mb-1'>Warning</p>
              <p className='text-sm text-destructive/90'>
                All episodes and data associated with these anime will be permanently deleted.
              </p>
            </div>
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
            onClick={handleBulkDeleteAnime}
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
                Delete {selectedAnimes.length} Anime
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
