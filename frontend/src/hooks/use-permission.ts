import { useAuthStore } from '@/stores/auth-store'

// Permission constants
export const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  LIST_USERS: 'list_users',

  // Role Management
  MANAGE_ROLES: 'manage_roles',

  // Anime Management
  CREATE_ANIME: 'create_anime',
  EDIT_ANIME: 'edit_anime',
  DELETE_ANIME: 'delete_anime',
  LIST_ANIME: 'list_anime',

  // Slider Management
  MANAGE_SLIDER: 'manage_slider',

  // System
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  ACCESS_ADMIN: 'access_admin',
}

export function usePermission() {
  const { user } = useAuthStore()

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions?.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false
    return permissions.some((perm) => user.permissions?.includes(perm))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false
    return permissions.every((perm) => user.permissions?.includes(perm))
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const canAccessAdmin = (): boolean => {
    return hasPermission(PERMISSIONS.ACCESS_ADMIN)
  }

  const canManageUsers = (): boolean => {
    return hasPermission(PERMISSIONS.LIST_USERS)
  }

  const canManageAnime = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.CREATE_ANIME,
      PERMISSIONS.EDIT_ANIME,
      PERMISSIONS.DELETE_ANIME,
    ])
  }

  const canManageSlider = (): boolean => {
    return hasPermission(PERMISSIONS.MANAGE_SLIDER)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
    canManageUsers,
    canManageAnime,
    canManageSlider,
  }
}
