'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth-store'
import { useUsersWebSocket } from '@/hooks/use-users-websocket'
import { usePermission } from '@/hooks/use-permission'
import { Zap, Code, LogOut, LogIn, UserPlus, Gem, User as UserIcon } from 'lucide-react'

export function ProfileDropdown() {
  const router = useRouter()
  const { user: authUser, getCurrentUser, logout, token } = useAuthStore()
  const { hasPermission } = usePermission()

  // Use WebSocket for real-time role updates
  useUsersWebSocket(getCurrentUser, authUser?.id)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Not logged in
  if (!token) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium'>Guest</p>
              <p className='text-xs text-muted-foreground'>Welcome to Toofy</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link href='/login'>
              <LogIn className='mr-2 h-4 w-4' />
              <span>Sign In</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link href='/register'>
              <UserPlus className='mr-2 h-4 w-4' />
              <span>Sign Up</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Logged in
  const displayName = authUser?.displayName || 'User'
  const email = authUser?.email || ''
  const role = authUser?.role || 'user'
  const initials = getInitials(displayName)

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Zap className='h-3 w-3' />
      case 'editor':
        return <Code className='h-3 w-3' />
      case 'vip':
        return <Gem className='h-3 w-3' />
      case 'user':
        return <UserIcon className='h-3 w-3' />
      default:
        return <UserIcon className='h-3 w-3' />
    }
  }

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-br from-red-500/15 to-pink-500/15 text-red-600 dark:text-red-400 border border-red-500/40 dark:border-red-500/60 rounded-full'
      case 'editor':
        return 'bg-gradient-to-br from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/40 dark:border-blue-500/60 rounded-full'
      case 'vip':
        return 'bg-gradient-to-br from-purple-500/15 to-pink-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/40 dark:border-purple-500/60 rounded-full'
      default:
        return 'bg-gradient-to-br from-gray-500/15 to-slate-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/40 dark:border-gray-500/60 rounded-full'
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{displayName}</p>
                <p className='text-xs text-muted-foreground truncate'>{email}</p>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${getRoleBadgeColor()}`}>
                {getRoleIcon()}
                <span className='ml-1 capitalize'>{role}</span>
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
