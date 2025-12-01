import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './data-table-row-actions'
import { Zap, Code, Gem, User } from 'lucide-react'

// Define types inline - matching Backend User struct
type User = {
  id: string
  displayName: string
  email: string
  role: string
  createdAt?: string
}

const roles = [
  { label: 'Admin', value: 'admin', icon: Zap, color: 'bg-gradient-to-br from-red-500/15 to-pink-500/15 text-red-600 dark:text-red-400 border border-red-500/40 dark:border-red-500/60 rounded-full' },
  { label: 'Editor', value: 'editor', icon: Code, color: 'bg-gradient-to-br from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/40 dark:border-blue-500/60 rounded-full' },
  { label: 'VIP', value: 'vip', icon: Gem, color: 'bg-gradient-to-br from-purple-500/15 to-pink-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/40 dark:border-purple-500/60 rounded-full' },
  { label: 'User', value: 'user', icon: User, color: 'bg-gradient-to-br from-gray-500/15 to-slate-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/40 dark:border-gray-500/60 rounded-full' },
]

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'avatar',
    header: () => <div className='text-center'>Avatar</div>,
    cell: ({ row }) => {
      const displayName = row.getValue('displayName') as string
      const getInitials = (name: string) => {
        return name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }

      return (
        <div className='flex justify-center'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='text-xs'>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </div>
      )
    },
    meta: { className: 'w-16' },
  },
  {
    accessorKey: 'displayName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('displayName')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const roleConfig = roles.find((r) => r.value === role)

      if (!roleConfig) {
        return <span className='text-sm capitalize'>{role}</span>
      }

      const Icon = roleConfig.icon

      return (
        <Badge className={`${roleConfig.color} text-xs flex w-fit items-center gap-1`}>
          <Icon className='h-3 w-3' />
          <span className='capitalize'>{roleConfig.label}</span>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
