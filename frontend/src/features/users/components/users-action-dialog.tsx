'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, Code, Gem, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useUsers } from './users-provider'

// Define roles - matching Backend
const roles = [
  { label: 'Admin', value: 'admin', icon: Zap },
  { label: 'Editor', value: 'editor', icon: Code },
  { label: 'VIP', value: 'vip', icon: Gem },
  { label: 'User', value: 'user', icon: UserIcon },
]

// Role hierarchy for permission checking
const roleHierarchy: Record<string, number> = {
  admin: 3,
  editor: 2,
  vip: 1,
  user: 0,
}

// Define User type
type User = {
  id: string
  displayName: string
  email: string
  role: string
}

const formSchema = z
  .object({
    displayName: z.string().min(1, 'Display Name is required.'),
    email: z.email('Invalid email address.'),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, 'Role is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          displayName: currentRow?.displayName || '',
          email: currentRow?.email || '',
          role: currentRow?.role || '',
          password: '',
          confirmPassword: '',
          isEdit: true,
        }
      : {
          displayName: '',
          email: '',
          role: '',
          password: '',
          confirmPassword: '',
          isEdit: false,
        },
  })

  const { token } = useAuthStore()

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit && currentRow) {
        // Update user role if it changed
        if (currentRow.role !== values.role) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
          const url = `${apiUrl}/users/${currentRow.id}/role`
          
          console.log('[Users] Updating role:', { url, token: !!token, newRole: values.role })
          
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({
              role: values.role,
            }),
          })

          console.log('[Users] Response status:', response.status)

          if (!response.ok) {
            const data = await response.json()
            console.error('[Users] Error response:', data)
            toast.error(data.message || 'Failed to update user role')
            return
          }
          
          toast.success('User role updated successfully!')
          // WebSocket will handle the update
        }
      }

      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error?.message || 'An error occurred'
      toast.error(errorMessage)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='displayName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Display Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='role'
                render={({ field }) => {
                  const currentUserRole = token ? (useAuthStore().user?.role || 'user') : 'user'
                  const currentUserLevel = roleHierarchy[currentUserRole] || 0
                  
                  // Filter roles based on current user's hierarchy
                  const availableRoles = roles.filter((role) => {
                    const roleLevel = roleHierarchy[role.value] || 0
                    // User can only assign roles lower than their own
                    return roleLevel < currentUserLevel
                  })
                  
                  return (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Role
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className='col-span-4'>
                            <SelectValue placeholder='Select a role' />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.length > 0 ? (
                              availableRoles.map((role) => {
                                const Icon = role.icon
                                return (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className='flex items-center gap-2'>
                                      <Icon className='h-4 w-4' />
                                      <span>{role.label}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })
                            ) : (
                              <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                No roles available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              {isPasswordTouched && (
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='submit' form='user-form'>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
