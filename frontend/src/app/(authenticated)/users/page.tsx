'use client'

import { Users } from '@/features/users'
import { AdminProtection } from '@/components/admin-protection'
import { PERMISSIONS } from '@/hooks/use-permission'

export default function UsersPage() {
  return (
    <AdminProtection requiredPermission={PERMISSIONS.LIST_USERS}>
      <Users />
    </AdminProtection>
  )
}
