'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useAuthStore } from '@/stores/auth-store'
import { useUsersWebSocket } from '@/hooks/use-users-websocket'

type User = {
  id: string
  displayName: string
  email: string
  role: string
}

function UsersTableContent() {
  const { token, user: authUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const usersRef = useRef<User[]>([])

  const fetchUsers = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
      
      const response = await fetch(`${apiUrl}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.users) {
          // Check if data changed before updating
          const newData = JSON.stringify(data.data.users)
          const oldData = JSON.stringify(usersRef.current)
          
          if (newData !== oldData) {
            setUsers(data.data.users)
            usersRef.current = data.data.users
          }
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token, fetchUsers])

  // WebSocket for real-time updates
  useUsersWebSocket(fetchUsers, authUser?.id)

  return loading ? (
    <div className='flex items-center justify-center py-8'>
      <p className='text-muted-foreground'>Loading users...</p>
    </div>
  ) : (
    <UsersTable data={users} />
  )
}

export function Users() {
  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTableContent />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
