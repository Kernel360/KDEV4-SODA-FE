import React from 'react'
import { Box, Theme } from '@mui/material'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import UserSidebar from './UserSidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        sx={{
          position: 'fixed',
          width: '100%',
          zIndex: (theme: Theme) => theme.zIndex.drawer + 1
        }}
      />
      <Box
        component="nav"
        sx={{
          width: 280,
          flexShrink: 0,
          position: 'fixed',
          height: '100vh',
          borderRight: '1px solid',
          borderColor: 'divider',
          mt: '64px',
          backgroundColor: 'background.paper'
        }}>
        {isAdminRoute ? <Sidebar /> : <UserSidebar />}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: '280px'
        }}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout
