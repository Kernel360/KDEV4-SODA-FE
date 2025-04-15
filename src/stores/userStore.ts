import { create } from 'zustand'

interface Company {
  id: number
  name: string
  phoneNumber: string
  companyNumber: string
}

interface User {
  id?: number
  name: string
  authId: string
  position: string
  phoneNumber: string
  role: 'ADMIN' | 'USER'
  firstLogin: boolean
  email?: string
  company?: Company
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
  logout: () => void
}

// localStorage에서 user 데이터 가져오기
const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  }
  return null
}

export const useUserStore = create<UserState>(set => ({
  user: getStoredUser(),
  setUser: user => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },
  clearUser: () => {
    localStorage.removeItem('user')
    set({ user: null })
  },
  logout: () => {
    localStorage.removeItem('user')
    set({ user: null })
  }
}))
