import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material'
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Database
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      path: '/admin',
      icon: <LayoutDashboard size={24} />,
      text: '대시보드'
    },
    {
      path: '/admin/companies',
      icon: <Building2 size={24} />,
      text: '회사 관리'
    },
    {
      path: '/admin/accounts',
      icon: <Users size={24} />,
      text: '계정 관리'
    },
    {
      path: '/admin/projects',
      icon: <ClipboardList size={24} />,
      text: '프로젝트 관리'
    },
    {
      path: '/admin/data',
      icon: <Database size={24} />,
      text: '데이터 관리'
    }
  ]

  return (
    <Box
      sx={{
        width: isOpen ? 280 : 0,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        backgroundColor: 'background.paper',
        position: 'fixed',
        left: 0,
        top: 64,
        pt: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 1200,
        boxShadow: '4px 0 8px rgba(0, 0, 0, 0.1)'
      }}>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem
              disablePadding
              sx={{ mb: index === 0 ? 2 : 1 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.50',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.100'
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main'
                    }
                  }
                }}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index === 0 && <Divider sx={{ my: 2 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}

export default Sidebar
