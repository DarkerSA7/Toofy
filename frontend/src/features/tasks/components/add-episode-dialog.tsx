'use client'

import { useState, useEffect } from 'react'
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
import { Upload, X, Search, Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { animeAPI } from '@/lib/alova-client'
import { useDropzone } from 'react-dropzone'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

type AddEpisodeDialogProps = {
  open: boolean
  onOpenChange: () => void
}

export function AddEpisodeDialog({ open, onOpenChange }: AddEpisodeDialogProps) {
  const [animes, setAnimes] = useState<any[]>([])
  const [selectedAnimeId, setSelectedAnimeId] = useState('')
  const [openAnimeSearch, setOpenAnimeSearch] = useState(false)
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [episodeFiles, setEpisodeFiles] = useState<File[]>([])
  const [uploadingEpisodes, setUploadingEpisodes] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch animes when dialog opens
  useEffect(() => {
    if (open) {
      fetchAnimes()
    }
  }, [open])

  const fetchAnimes = async () => {
    try {
      const response = await animeAPI.getAll(1, 100)
      if ((response as any)?.success) {
        const data = (response as any).data
        // Validate that data is an array
        if (data && Array.isArray(data)) {
          setAnimes(data)
        } else {
          setAnimes([])
        }
      } else {
        setAnimes([])
      }
    } catch (error) {
      toast.error('Failed to load animes')
      setAnimes([])
    }
  }

  const { getRootProps: getEpisodeProps, getInputProps: getEpisodeInputProps } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mkv', '.avi', '.mov'] },
    multiple: true,
    maxFiles: 50,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setEpisodeFiles(prev => [...prev, ...acceptedFiles])
        toast.success(`${acceptedFiles.length} file(s) added`)
      }
    }
  })

  const removeEpisodeFile = (index: number) => {
    setEpisodeFiles(episodeFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUploadEpisodes = async () => {
    if (!selectedAnimeId) {
      toast.error('Please select an anime first!')
      return
    }
    
    if (!episodeNumber || parseInt(episodeNumber) < 1) {
      toast.error('Please enter episode number!')
      return
    }
    
    if (episodeFiles.length === 0) {
      toast.error('Please select a video file!')
      return
    }
    
    if (uploadingEpisodes) {
      return
    }
    
    try {
      setUploadingEpisodes(true)
      setUploadProgress(0)
      const startEpisode = parseInt(episodeNumber)
      
      // Upload files in parallel (max 3 at a time)
      const uploadPromises = episodeFiles.map(async (file, i) => {
        const currentEpisode = startEpisode + i
        
        try {
          
          // Upload video with all data in one request
          const formData = new FormData()
          formData.append('video', file)
          formData.append('animeId', selectedAnimeId)
          formData.append('episodeNumber', currentEpisode.toString())
          formData.append('title', `Episode ${currentEpisode}`)
          
          const uploadResponse = await fetch('http://localhost:8081/api/episodes/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload episode ${currentEpisode}`)
          }
          
          return { success: true, episode: currentEpisode }
        } catch (error) {
          return { success: false, episode: currentEpisode }
        }
      })
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises)
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      setUploadingEpisodes(false)
      setUploadProgress(100)
      
      if (successCount > 0) {
        toast.success(`${successCount} episode(s) uploaded successfully!`)
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} episode(s) failed to upload`)
      }
      
      if (successCount > 0) {
        setSelectedAnimeId('')
        setEpisodeNumber('')
        setEpisodeFiles([])
        onOpenChange()
      }
      
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      if (errorMessage.includes('already exists')) {
        toast.error('⚠️ This episode number already exists for this anime!')
      } else {
        toast.error('Error uploading episodes: ' + errorMessage)
      }
      setUploadingEpisodes(false)
      setUploadProgress(0)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Episodes</DialogTitle>
          <DialogDescription>Upload episodes for existing anime</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Anime Search */}
          <div className='space-y-2'>
            <Label>Select Anime *</Label>
            <Popover open={openAnimeSearch} onOpenChange={setOpenAnimeSearch}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  className='w-full justify-between'
                >
                  {selectedAnimeId
                    ? animes.find((a) => a.id === selectedAnimeId)?.title
                    : 'Search anime...'}
                  <Search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command>
                  <CommandInput placeholder='Search anime...' />
                  <CommandList>
                    <CommandEmpty>No anime found.</CommandEmpty>
                    <CommandGroup>
                      {animes && animes.length > 0 ? animes.map((anime) => (
                        <CommandItem
                          key={anime.id}
                          value={anime.title}
                          onSelect={() => {
                            setSelectedAnimeId(anime.id)
                            setOpenAnimeSearch(false)
                          }}
                        >
                          <div className='flex items-center gap-3'>
                            <img
                              src={anime.coverImage}
                              alt={anime.title}
                              className='h-12 w-8 object-cover rounded'
                            />
                            <div>
                              <p className='font-medium'>{anime.title}</p>
                              <p className='text-xs text-muted-foreground'>
                                {anime.type} • {anime.status}
                              </p>
                            </div>
                          </div>
                          {selectedAnimeId === anime.id && (
                            <Check className='ml-auto h-4 w-4' />
                          )}
                        </CommandItem>
                      )) : null}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Episode Number */}
          <div className='space-y-2'>
            <Label htmlFor='episode-number'>Starting Episode Number</Label>
            <Input
              id='episode-number'
              type='number'
              placeholder='e.g., 1'
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              For multiple files, episodes will be numbered sequentially
            </p>
          </div>

          {/* Video Upload */}
          <div className='space-y-2'>
            <Label>Upload Episodes</Label>
            <div
              {...getEpisodeProps()}
              className='border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors'
            >
              <input {...getEpisodeInputProps()} />
              <div className='flex flex-col items-center gap-2'>
                <Upload className='h-10 w-10 text-muted-foreground' />
                <p className='text-sm font-medium'>
                  {episodeFiles.length > 0 ? 'Add more episode videos' : 'Click or drag to upload episode videos'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Supports: MP4, MKV, AVI, MOV • Select multiple files at once
                </p>
                {episodeFiles.length > 0 && (
                  <p className='text-xs text-primary font-medium'>
                    {episodeFiles.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compact Files List */}
          {episodeFiles.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label>Selected Files ({episodeFiles.length})</Label>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setEpisodeFiles([])}
                  className='text-xs h-7'
                >
                  Clear All
                </Button>
              </div>
              
              <div className='max-h-48 overflow-y-auto space-y-1 pr-2'>
                {episodeFiles.map((file, index) => {
                  const episodeNum = parseInt(episodeNumber || '1') + index
                  
                  return (
                    <div 
                      key={index} 
                      className='flex items-center gap-2 p-2 border rounded bg-muted/20 hover:bg-muted/40 transition-colors text-sm'
                    >
                      <span className='font-medium text-xs text-muted-foreground w-16'>Ep {episodeNum}</span>
                      <span className='flex-1 truncate text-xs'>{file.name}</span>
                      <span className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</span>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => removeEpisodeFile(index)}
                        className='h-6 w-6'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => {
                onOpenChange()
                setEpisodeFiles([])
                setSelectedAnimeId('')
                setEpisodeNumber('')
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedAnimeId || episodeFiles.length === 0 || uploadingEpisodes}
              onClick={handleUploadEpisodes}
            >
              <Upload className='mr-2 h-4 w-4' />
              {uploadingEpisodes ? `Uploading... ${uploadProgress}%` : 'Upload Episodes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
