import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

type UsersUpdateCallback = () => void

export function useUsersWebSocket(callback: UsersUpdateCallback, userID?: string) {
  const { getCurrentUser } = useAuthStore()

  useEffect(() => {
    if (!userID) return

    // Build WebSocket URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'
    const baseUrl = apiUrl.replace('/api', '').replace('http://', '').replace('https://', '')
    const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${baseUrl}/ws?userID=${userID}`
    
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // On user update, refresh both users list and current user
        if (data.type === 'user_update') {
          callback()
          getCurrentUser()
        }
      } catch (error) {
        // Silent error handling
      }
    }

    ws.onerror = (error) => {
      // Silent error handling
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [userID, callback, getCurrentUser])
}
