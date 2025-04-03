import React from 'react'
import { Box } from '@mui/material'
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {isAdminRoute ? <Sidebar /> : <UserSidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: '#F9FAFB',
            minHeight: 'calc(100vh - 64px)',
            ml: '280px',
            mt: '64px'
          }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
