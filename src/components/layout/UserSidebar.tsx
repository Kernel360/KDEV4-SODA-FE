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
  ClipboardList,
  FileText,
  Briefcase
} from 'lucide-react'

interface UserSidebarProps {
  isOpen: boolean
}

const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const menuItems = [
    {
      path: '/user',
      icon: <LayoutDashboard size={24} />,
      text: '대시보드'
    },
    {
      path: '/user/requests',
      icon: <ClipboardList size={24} />,
      text: '승인요청 목록'
    },
    {
      path: '/user/articles',
      icon: <FileText size={24} />,
      text: '질문 목록'
    },
    {
      path: '/user/projects',
      icon: <Briefcase size={24} />,
      text: '프로젝트 목록'
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

export default UserSidebar
