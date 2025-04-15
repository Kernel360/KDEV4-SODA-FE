import React, { useState, useEffect } from 'react'
import { Box, useTheme } from '@mui/material'
import { useUserStore } from '../../stores/userStore'
import SideBar from './Sidebar'
import UserSidebar from './UserSidebar'
import Header from './Header'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme()
  const { user, setUser } = useUserStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [setUser])

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />
      {user?.role === 'ADMIN' ? (
        <SideBar isOpen={isSidebarOpen} />
      ) : (
        <UserSidebar isOpen={isSidebarOpen} />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          marginLeft: isSidebarOpen ? '280px' : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }}>
        <Box sx={{ height: 64 }} /> {/* Header height spacer */}
        {children}
      </Box>
    </Box>
  )
}

export default Layout
