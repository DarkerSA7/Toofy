'use client'

import { Edit, Trash2, Video } from 'lucide-react'
import { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { animeAPI, episodesAPI, uploadAPI } from '@/lib/alova-client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from '@/components/data-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { cn, getPageNumbers } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EditAnimeDialog } from './edit-anime-dialog'
import { ManageEpisodesDialog } from './manage-episodes-dialog'
import { DeleteAnimeDialog } from './delete-anime-dialog'
import { BulkDeleteAnimeDialog } from './bulk-delete-anime-dialog'

type AnimeData = {
  id: string
  title: string
  slug: string
  alternativeNames: string[]
  description: string
  coverUrl: string
  genres: string[]
  status: "ongoing" | "completed" | "upcoming"
  type: "TV" | "Movie" | "OVA" | "ONA" | "Special"
  episodeCount: number
  studio: string
  season: "spring" | "summer" | "fall" | "winter" | ""
  seasonYear: number
  createdAt: string
  updatedAt: string
}

const createColumns = (
  onEdit: (anime: any) => void,
  onEditEpisodes: (anime: any) => void,
  onDelete: (anime: any) => void,
  onRowClick: (index: number, event: React.MouseEvent) => void
): ColumnDef<AnimeData>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => onRowClick(row.index, e)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'coverUrl',
    header: 'Cover',
    cell: ({ row }) => {
      let url = row.original.coverUrl
      if (!url) {
        return null
      }
      // Convert relative URLs to absolute
      if (url.startsWith('/api')) {
        url = `${process.env.NEXT_PUBLIC_API_URL}${url.replace('/api', '')}`
      }
      return (
        <img
          src={url}
          alt={row.original.title}
          className='h-[50px] w-12 object-cover rounded'
          crossOrigin='anonymous'
          onError={(e) => {
            // Hide the image if it fails to load - no placeholder
            e.currentTarget.style.display = 'none'
          }}
        />
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = row.original.title
      const shouldTruncate = title.length > 30
      const displayTitle = shouldTruncate ? title.slice(0, 30) + '...' : title

      return (
        <div>
          <div className='flex items-center gap-2'>
            <div className='relative flex h-2 w-2'>
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                row.original.status === 'ongoing' ? 'bg-green-400' : 
                row.original.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
              }`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                row.original.status === 'ongoing' ? 'bg-green-500' : 
                row.original.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
              }`}></span>
            </div>
            {shouldTruncate ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className='font-medium cursor-help transition-colors hover:text-primary'>
                      {displayTitle}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent 
                    side='top'
                    sideOffset={8}
                    align='center'
                    className='max-w-xs px-4 py-2.5 bg-popover/95 backdrop-blur-sm text-popover-foreground border-2 shadow-xl'
                  >
                    <p className='text-sm font-medium leading-relaxed text-center'>{title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className='font-medium'>{displayTitle}</p>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            {row.original.createdAt ? 
              new Date(row.original.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : 
              'Upload date not available'}
          </p>
        </div>
      )
    },
    enableHiding: false,
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id)
      return String(cellValue).toLowerCase().includes(String(value).toLowerCase())
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge variant='outline'>{row.original.type}</Badge>,
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <div className='flex justify-center'>Status</div>,
    cell: ({ row }) => {
      const statusCapitalized = row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
      return (
        <div className='flex justify-center'>
          <Badge
            variant={
              row.original.status === 'ongoing'
                ? 'default'
                : row.original.status === 'completed'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {statusCapitalized}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'studio',
    header: ({ column }) => <div className='flex justify-center'>Studio</div>,
    cell: ({ row }) => <div className='flex justify-center'><span className='text-sm text-muted-foreground'>{row.original.studio}</span></div>,
    enableSorting: false,
  },
  {
    accessorKey: 'genres',
    header: ({ column }) => <div className='flex justify-center'>Genres</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <div className='flex flex-wrap gap-1 justify-center'>
          {row.original.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant='secondary' className='text-xs'>
              {genre}
            </Badge>
          ))}
          {row.original.genres.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{row.original.genres.length - 2}
            </Badge>
          )}
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'episodeCount',
    header: ({ column }) => <div className='flex justify-center'>Episodes</div>,
    cell: ({ row }) => <div className='flex justify-center'><span className='font-semibold text-primary'>{row.original.episodeCount || '0'}</span></div>,
    enableSorting: false,
  },
  {
    accessorKey: 'season',
    header: ({ column }) => <div className='flex justify-center'>Season</div>,
    cell: ({ row }) => {
      const season = row.original.season
      const year = row.original.seasonYear
      
      // Capitalize first letter of season
      const capitalizedSeason = season 
        ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
        : '-'
      
      // Display season and year together
      const displayText = season && year ? `${capitalizedSeason} ${year}` : year ? `${year}` : '-'
      
      return <div className='flex justify-center'><span className='text-sm'>{displayText}</span></div>
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: ({ column }) => <div className='flex justify-center'>Actions</div>,
    cell: ({ row }) => (
      <div className='flex w-full items-center justify-center gap-2'>
        <Button 
          variant='ghost' 
          size='icon'
          title='Edit Anime'
          onClick={() => onEdit(row.original)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button 
          variant='ghost' 
          size='icon'
          title='Edit Episodes'
          onClick={() => onEditEpisodes(row.original)}
        >
          <Video className='h-4 w-4' />
        </Button>
        <Button 
          variant='ghost' 
          size='icon'
          title='Delete Anime'
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
]

export function RecentLeadsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<AnimeData[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 6,
  })
  
  // Handle pagination change
  const onPaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination)
  }

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [manageEpisodesDialogOpen, setManageEpisodesDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<any>(null)

  // Handlers for dialogs
  const handleEdit = (anime: any) => {
    // Make a deep copy to ensure we're not affected by reference issues
    const animeCopy = JSON.parse(JSON.stringify(anime));
    
    // Ensure alternativeNames is always an array
    if (!animeCopy.alternativeNames) {
      animeCopy.alternativeNames = [];
    }
    
    setSelectedAnime(animeCopy);
    setEditDialogOpen(true);
  }

  const handleEditEpisodes = (anime: any) => {
    setSelectedAnime(anime)
    setManageEpisodesDialogOpen(true)
  }

  const handleDelete = (anime: any) => {
    setSelectedAnime(anime)
    setDeleteDialogOpen(true)
  }

  const handleDialogSuccess = async () => {
    try {
      const response = await animeAPI.getAll(1, 1000);
      
      if ((response as any)?.success) {
        const animes = (response as any).data?.data || (response as any).data;
        
        if (animes && Array.isArray(animes)) {
          const transformedData: AnimeData[] = animes.map((anime: any) => ({
            id: anime.id,
            title: anime.title,
            slug: anime.slug || '',
            alternativeNames: anime.alternativeNames || [],
            description: anime.description || '',
            coverUrl: anime.coverUrl || '',
            genres: anime.genres || [],
            status: anime.status || 'ongoing',
            type: anime.type || 'TV',
            episodeCount: anime.episodeCount || 0,
            studio: anime.studio || '',
            season: anime.season || '',
            seasonYear: anime.seasonYear || 0,
            createdAt: anime.createdAt || '',
            updatedAt: anime.updatedAt || '',
          }));
          
          setData(transformedData);
        }
      }
    } catch (error) {
    }
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('Please select at least one anime to delete')
      return
    }

    setBulkDeleteDialogOpen(true)
  }

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    try {
      setDeletingBulk(true)
      
      await handleDialogSuccess()
      setRowSelection({})
    } catch (error: any) {
      toast.error('Error deleting animes: ' + (error.message || 'Unknown error'))
    } finally {
      setDeletingBulk(false)
    }
  }

  // Handle row click with Shift key for range selection
  const handleRowClick = (index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Select range between lastSelectedIndex and current index
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      
      const newSelection: Record<string, boolean> = { ...rowSelection }
      for (let i = start; i <= end; i++) {
        newSelection[i] = true
      }
      
      setRowSelection(newSelection)
    } else {
      setLastSelectedIndex(index)
    }
  }

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleEditEpisodes, handleDelete, handleRowClick)

  // State for loading and data fetching
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // Fetch anime data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await animeAPI.getAll(1, 1000)
        
        if (result?.success) {
          const animes = result.data?.data || result.data || []
          
          if (!animes || !Array.isArray(animes)) {
            setData([])
            setInitialLoad(false)
            return
          }
          
          const transformedData: AnimeData[] = animes.map((anime: any) => ({
            id: anime.id,
            title: anime.title,
            slug: anime.slug || '',
            alternativeNames: anime.alternativeNames || [],
            description: anime.description || '',
            coverUrl: anime.coverUrl || '',
            genres: anime.genres || [],
            status: anime.status || 'ongoing',
            type: anime.type || 'TV',
            episodeCount: anime.episodeCount || 0,
            studio: anime.studio || '',
            season: anime.season || '',
            seasonYear: anime.seasonYear || 0,
            createdAt: anime.createdAt || '',
            updatedAt: anime.updatedAt || '',
          }))
          
          setData(transformedData)
          setInitialLoad(false)
        }
      } catch (error) {
        toast.error('Failed to load anime data')
        setData([])
        setInitialLoad(false)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      setPagination(updater)
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
  })

  if (loading && initialLoad) {
    return (
      <div className='flex justify-center items-center min-h-[600px]'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }
  
  // If no data, don't show the table at all
  if (data.length === 0) {
    return (
      <>
        <DataTableToolbar
          table={table}
          searchPlaceholder='Search anime by title...'
          searchKey='title'
          filters={[
            {
              columnId: 'status',
              title: 'Status',
              options: [
                { label: 'Ongoing', value: 'ongoing' },
                { label: 'Completed', value: 'completed' },
                { label: 'Upcoming', value: 'upcoming' },
              ],
            },
            {
              columnId: 'type',
              title: 'Type',
              options: [
                { label: 'TV', value: 'TV' },
                { label: 'Movie', value: 'Movie' },
                { label: 'OVA', value: 'OVA' },
                { label: 'ONA', value: 'ONA' },
                { label: 'Special', value: 'Special' },
              ],
            },
          ]}
        />
        <div className='flex justify-center items-center min-h-[400px]'>
          <p className='text-muted-foreground'>لا توجد أنميات لعرضها</p>
        </div>
      </>
    )
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search anime by title...'
        searchKey='title'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Ongoing', value: 'ongoing' },
              { label: 'Completed', value: 'completed' },
              { label: 'Upcoming', value: 'upcoming' },
            ],
          },
          {
            columnId: 'type',
            title: 'Type',
            options: [
              { label: 'TV', value: 'TV' },
              { label: 'Movie', value: 'Movie' },
              { label: 'OVA', value: 'OVA' },
              { label: 'ONA', value: 'ONA' },
              { label: 'Special', value: 'Special' },
            ],
          },
        ]}
      />

      {/* Bulk Delete Toast-like Notification */}
      {selectedCount > 0 && (
        <div className='fixed bottom-4 right-4 flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg z-50 max-w-xs'>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>
              {selectedCount} anime(s) selected
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setRowSelection({})}
            disabled={deletingBulk}
            className='flex-shrink-0'
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleBulkDelete}
            disabled={deletingBulk}
            className='flex-shrink-0'
          >
            {deletingBulk ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
            ) : (
              <>
                <Trash2 className='h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Table container */}
      <div className='overflow-hidden rounded-lg border border-border bg-card shadow-lg'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-b border-border/50 hover:bg-muted/70'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-semibold'>
                    {header.isPlaceholder
                      ? null
                      : typeof header.column.columnDef.header === 'function'
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='h-[68px]'>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='py-3'>
                    {typeof cell.column.columnDef.cell === 'function'
                      ? cell.column.columnDef.cell(cell.getContext())
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className='flex items-center justify-between overflow-clip px-2 mt-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className='flex items-center gap-2'>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue>{table.getState().pagination.pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent side='top'>
                {[6, 12, 18, 24, 30].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          </div>
        </div>

        <div className='flex items-center space-x-2 ml-8'>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to first page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          {/* Page number buttons */}
          {getPageNumbers(table.getState().pagination.pageIndex + 1, table.getPageCount()).map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='text-muted-foreground px-1 text-sm'>...</span>
              ) : (
                <Button
                  variant={table.getState().pagination.pageIndex + 1 === pageNumber ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                >
                  <span className='sr-only'>Go to page {pageNumber}</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Go to last page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <EditAnimeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        anime={selectedAnime}
        onSuccess={handleDialogSuccess}
      />
      
      <ManageEpisodesDialog
        open={manageEpisodesDialogOpen}
        onOpenChange={setManageEpisodesDialogOpen}
        anime={selectedAnime}
        onSuccess={handleDialogSuccess}
      />
      
      <DeleteAnimeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        anime={selectedAnime}
        onSuccess={handleDialogSuccess}
      />
      
      <BulkDeleteAnimeDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedAnimes={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        onSuccess={handleBulkDeleteConfirm}
      />
    </>
  )
}
