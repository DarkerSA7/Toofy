import { Plus, Upload, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('addEpisode')}
      >
        <span>Add Episodes</span> <Upload size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('bulkAddAnime')}
      >
        <span>Bulk Add Anime</span> <ListPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('addAnime')}>
        <span>Add Anime</span> <Plus size={18} />
      </Button>
    </div>
  )
}
