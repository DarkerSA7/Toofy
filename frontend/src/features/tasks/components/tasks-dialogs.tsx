'use client'

import { AddAnimeDialog } from './add-anime-dialog'
import { AddEpisodeDialog } from './add-episode-dialog'
import { BulkAddAnimeDialog } from './bulk-add-anime-dialog'
import { useTasks } from './tasks-provider'
import { useCallback } from 'react'

export function TasksDialogs() {
  const { open, setOpen } = useTasks()
  
  const handleSuccess = useCallback(() => {
    // Dialog will handle data refresh via onSuccess callback
    // which calls handleDialogSuccess in RecentLeadsTable
  }, [])
  
  return (
    <>
      <AddAnimeDialog
        key='add-anime'
        open={open === 'addAnime'}
        onOpenChange={() => setOpen(open === 'addAnime' ? null : 'addAnime')}
        onSuccess={handleSuccess}
      />

      <AddEpisodeDialog
        key='add-episode'
        open={open === 'addEpisode'}
        onOpenChange={() => setOpen(open === 'addEpisode' ? null : 'addEpisode')}
      />

      <BulkAddAnimeDialog
        key='bulk-add-anime'
        open={open === 'bulkAddAnime'}
        onOpenChange={() => setOpen(open === 'bulkAddAnime' ? null : 'bulkAddAnime')}
        onSuccess={handleSuccess}
      />
    </>
  )
}
