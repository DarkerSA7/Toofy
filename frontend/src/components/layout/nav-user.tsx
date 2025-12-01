'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, LogOut, LogIn, UserPlus, Zap, Code, Gem, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { useUsersWebSocket } from '@/hooks/use-users-websocket'

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { user: authUser, logout, getCurrentUser, token } = useAuthStore()

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
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>G</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>Guest</span>
                  <span className='truncate text-xs'>Welcome to Toofy</span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarFallback className='rounded-lg'>G</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>Guest</span>
                    <span className='truncate text-xs'>Welcome to Toofy</span>
                  </div>
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
        </SidebarMenuItem>
      </SidebarMenu>
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{displayName}</span>
                <span className='truncate text-xs'>{email}</span>
              </div>
              <ChevronsUpDown className='ms-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight min-w-0'>
                  <span className='truncate font-semibold'>{displayName}</span>
                  <span className='truncate text-xs'>{email}</span>
                </div>
                <Badge className={`text-xs flex-shrink-0 ${getRoleBadgeColor()}`}>
                  {getRoleIcon()}
                  <span className='ml-1 capitalize'>{role}</span>
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
