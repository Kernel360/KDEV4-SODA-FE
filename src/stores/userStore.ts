import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as ApiUser } from '../types/api'

interface UserState {
  user: ApiUser | null
  setUser: (user: ApiUser | null) => void
  clearUser: () => void
  logout: () => void
}

// localStorage에서 user 데이터 가져오기

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => {
        localStorage.removeItem('user')
        set({ user: null })
      },
      logout: () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        set({ user: null })
      }
    }),
    {
      name: 'user-storage'
    }
  )
)
