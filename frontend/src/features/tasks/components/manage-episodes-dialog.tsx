'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Video, Trash2, Edit, Check, Clock } from 'lucide-react'
import { animeAPI } from '@/lib/alova-client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface Anime {
  id: string
  title: string
  episodes?: number | string
}

interface Episode {
  id: string
  animeId: string
  episodeNumber: number
  title: string
  videoUrl: string
  createdAt: string
}

interface ManageEpisodesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anime: Anime | null
  onSuccess: () => void
}

export function ManageEpisodesDialog({ open, onOpenChange, anime, onSuccess }: ManageEpisodesDialogProps) {
  const [animeEpisodes, setAnimeEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [deletingEpisodes, setDeletingEpisodes] = useState(false)
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null)
  const [editingEpisodeNumber, setEditingEpisodeNumber] = useState('')

  const showFeatureDisabledMessage = () => {
    if (open && anime) {
      setTimeout(() => {
        toast.info('Episode management feature is not available yet')
      }, 500);
    }
  }
  
  useState(() => {
    if (open) {
      showFeatureDisabledMessage();
    }
  });
  
  const fetchEpisodes = () => {
    setLoadingEpisodes(true);
    setTimeout(() => {
      setAnimeEpisodes([]);
      setLoadingEpisodes(false);
    }, 1000);
  }

  const toggleEpisodeSelection = (episodeId: string, index: number, shiftKey: boolean = false) => {
    if (shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeIds = animeEpisodes.slice(start, end + 1).map(ep => ep.id)
      
      setSelectedEpisodes(prev => {
        const newSelection = new Set(prev)
        rangeIds.forEach(id => newSelection.add(id))
        return Array.from(newSelection)
      })
    } else {
      setSelectedEpisodes(prev => 
        prev.includes(episodeId) 
          ? prev.filter(id => id !== episodeId)
          : [...prev, episodeId]
      )
    }
    setLastSelectedIndex(index)
  }

  const toggleSelectAll = () => {
    if (selectedEpisodes.length === animeEpisodes.length) {
      setSelectedEpisodes([])
    } else {
      setSelectedEpisodes(animeEpisodes.map(ep => ep.id))
    }
  }

  const updateEpisodeNumber = (episodeId: string, newNumber: number) => {
    toast.info('Episode number update feature is not available yet')
    
    setEditingEpisodeId(null)
    setEditingEpisodeNumber('')
  }

  const deleteSelectedEpisodes = () => {
    if (selectedEpisodes.length === 0) {
      toast.error('Please select at least one episode')
      return
    }

    setDeletingEpisodes(true)
    
    setTimeout(() => {
      toast.info('Episode deletion feature is not available yet')
      
      setSelectedEpisodes([])
      setDeletingEpisodes(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Edit Episodes</DialogTitle>
          <DialogDescription className='text-base'>
            {anime?.title}
          </DialogDescription>
        </DialogHeader>
        
        {loadingEpisodes ? (
          <div className='flex justify-center items-center py-12'>
            <div className='flex flex-col items-center gap-3'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading...</p>
            </div>
          </div>
        ) : animeEpisodes.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 gap-3'>
            <div className='rounded-full bg-muted p-4'>
              <Video className='h-8 w-8 text-muted-foreground' />
            </div>
            <p className='text-muted-foreground'>No episodes uploaded</p>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'>
              <div className='flex items-center gap-3'>
                <Checkbox
                  checked={selectedEpisodes.length === animeEpisodes.length && animeEpisodes.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id='select-all'
                />
                <label htmlFor='select-all' className='text-sm font-medium cursor-pointer'>
                  Select All ({animeEpisodes.length})
                </label>
                {selectedEpisodes.length > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {selectedEpisodes.length} selected
                  </Badge>
                )}
              </div>
              
              {selectedEpisodes.length > 0 && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={deleteSelectedEpisodes}
                  disabled={deletingEpisodes}
                >
                  {deletingEpisodes ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2' />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete Selected ({selectedEpisodes.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Episodes List */}
            <div className='flex-1 overflow-y-auto space-y-2 pr-2'>
              {animeEpisodes.map((episode, index) => (
                <div
                  key={episode.id}
                  onClick={(e) => toggleEpisodeSelection(episode.id, index, e.shiftKey)}
                  className={`group flex items-center gap-4 p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                    selectedEpisodes.includes(episode.id) 
                      ? 'bg-primary/5 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={selectedEpisodes.includes(episode.id)}
                    onCheckedChange={() => toggleEpisodeSelection(episode.id, index, false)}
                    onClick={(e) => e.stopPropagation()}
                    id={`episode-${episode.id}`}
                  />
                  
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      {editingEpisodeId === episode.id ? (
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            value={editingEpisodeNumber}
                            onChange={(e) => setEditingEpisodeNumber(e.target.value)}
                            className='w-20 h-8'
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateEpisodeNumber(episode.id, parseInt(editingEpisodeNumber))
                              } else if (e.key === 'Escape') {
                                setEditingEpisodeId(null)
                                setEditingEpisodeNumber('')
                              }
                            }}
                          />
                          <Button
                            size='sm'
                            onClick={() => updateEpisodeNumber(episode.id, parseInt(editingEpisodeNumber))}
                            className='h-7'
                          >
                            Save
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                              setEditingEpisodeId(null)
                              setEditingEpisodeNumber('')
                            }}
                            className='h-7'
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h4 className='font-semibold text-base'>Episode {episode.episodeNumber}</h4>
                          {episode.videoUrl && (
                            <Badge variant='outline' className='text-xs bg-green-50 text-green-700 border-green-200'>
                              <Check className='h-3 w-3 mr-1' />
                              Uploaded
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      {episode.createdAt ? new Date(episode.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No date'}
                    </div>
                  </div>
                  
                  {editingEpisodeId !== episode.id && (
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingEpisodeId(episode.id)
                        setEditingEpisodeNumber(episode.episodeNumber.toString())
                      }}
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className='flex justify-between items-center pt-4 border-t'>
          <p className='text-sm text-muted-foreground'>
            {(() => {
              let totalEpisodes = 0;
              
              if (anime) {
                if (typeof anime.episodes === 'string' && anime.episodes.includes('/')) {
                  const parts = anime.episodes.split('/');
                  totalEpisodes = parseInt(parts[1]) || 0;
                } else {
                  if (typeof anime.episodes === 'number') {
                    totalEpisodes = anime.episodes;
                  } else if (typeof anime.episodes === 'string') {
                    totalEpisodes = parseInt(anime.episodes) || 0;
                  }
                }
              }
              
              return (
                <>
                  <span className='font-semibold text-primary'>0</span>/{totalEpisodes} episodes uploaded
                </>
              );
            })()} 
          </p>
          <Button variant='outline' onClick={() => {
            onOpenChange(false)
            setSelectedEpisodes([])
          }}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
