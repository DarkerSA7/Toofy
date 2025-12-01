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
    const wsUrl = `ws://${baseUrl}/ws?userID=${userID}`
    
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
        console.error('WebSocket parse error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [userID, callback, getCurrentUser])
}
