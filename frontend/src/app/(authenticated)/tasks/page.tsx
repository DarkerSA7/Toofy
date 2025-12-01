'use client'

import { Tasks } from '@/features/tasks'
import { AdminProtection } from '@/components/admin-protection'
import { PERMISSIONS } from '@/hooks/use-permission'

export default function TasksPage() {
  return (
    <AdminProtection requiredPermission={PERMISSIONS.ACCESS_ADMIN}>
      <Tasks />
    </AdminProtection>
  )
}
