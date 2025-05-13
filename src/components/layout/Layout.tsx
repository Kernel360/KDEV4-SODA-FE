import React, { useState, useEffect } from 'react'
import { Box, useTheme, useMediaQuery, Drawer } from '@mui/material'
import { useUserStore } from '../../stores/userStore'
import SideBar from './Sidebar'
import UserSidebar from './UserSidebar'
import Header from './Header'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { user, setUser } = useUserStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  useEffect(() => {
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  const handleSidebarToggle = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen)
    } else {
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  const sidebarContent =
    user?.role === 'ADMIN' ? (
      <SideBar
        isOpen={isMobile ? true : isSidebarOpen}
        onClose={() => setDrawerOpen(false)}
      />
    ) : (
      <UserSidebar
        isOpen={isMobile ? true : isSidebarOpen}
        onClose={() => setDrawerOpen(false)}
      />
    )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />
      {isMobile ? (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: 280 }
          }}>
          {sidebarContent}
        </Drawer>
      ) : (
        sidebarContent
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 1 : 3,
          width: '100%',
          marginLeft: !isMobile && isSidebarOpen ? '280px' : 0,
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
