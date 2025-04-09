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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper'
        }}>
        <Header />
      </Box>
      <Box sx={{ display: 'flex', flex: 1, mt: '64px' }}>
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            overflowY: 'auto'
          }}>
          {isAdminRoute ? <Sidebar /> : <UserSidebar />}
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: '280px',
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto'
          }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
