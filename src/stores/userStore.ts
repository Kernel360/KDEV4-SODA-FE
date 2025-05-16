import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as ApiUser } from '../types/api'
import type { MemberStatus } from '../types/member'
import { memberService } from '../services/memberService'
import { authService } from '../services/authService'

interface UserState {
  user: ApiUser | null
  setUser: (user: ApiUser | null) => void
  clearUser: () => void
  logout: () => Promise<void>
  updateStatus: (newStatus: MemberStatus) => Promise<void>
}

// localStorage에서 user 데이터 가져오기

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: user => set({ user }),
      clearUser: () => {
        localStorage.removeItem('user')
        set({ user: null })
      },
      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          set({ user: null })
        }
      },
      updateStatus: async (newStatus: MemberStatus) => {
        const currentUser = get().user
        if (!currentUser) return

        try {
          await memberService.updateMemberStatus(
            currentUser.memberId,
            newStatus
          )
          set({
            user: {
              ...currentUser,
              status: newStatus
            }
          })
        } catch (error) {
          console.error('Failed to update status:', error)
          throw error
        }
      }
    }),
    {
      name: 'user-storage'
    }
  )
)
