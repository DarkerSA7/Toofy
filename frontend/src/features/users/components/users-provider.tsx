'use client'

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type User = any // Temporary type definition
type UsersDialogType = 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onUserUpdated: (() => void) | null
  setOnUserUpdated: (callback: (() => void) | null) => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [onUserUpdated, setOnUserUpdated] = useState<(() => void) | null>(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow, onUserUpdated, setOnUserUpdated }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
