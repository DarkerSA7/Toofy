'use client'

import { useAuthStore } from '@/stores/auth-store'
import { UnauthorizedError } from './unauthorized-error'

interface AdminProtectionProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string | string[]
}

export function AdminProtection({
  children,
  requiredPermission,
  requiredRole,
}: AdminProtectionProps) {
  const { token, user } = useAuthStore()

  // Helper functions
  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes(permission)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.role) return false
    return roles.includes(user.role)
  }

  // Not authenticated
  if (!token || !user) {
    return <UnauthorizedError />
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedError />
  }

  // Check role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!hasAnyRole(roles)) {
      return <UnauthorizedError />
    }
  }

  return <>{children}</>
}
