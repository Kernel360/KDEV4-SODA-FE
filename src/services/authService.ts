import { client } from '../api/client'

export const authService = {
  // ... existing code ...

  async logout() {
    try {
      await client.post('/logout')
    } catch (error) {
      console.error('Failed to logout:', error)
      throw error
    }
  }
}
