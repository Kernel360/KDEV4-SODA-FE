import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material'
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  PlusCircle
} from 'lucide-react'

const menuGroups = [
  {
    title: '프로젝트',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        icon: LayoutDashboard,
        path: '/admin'
      },
      {
        id: 'projects',
        label: '프로젝트 관리',
        icon: ClipboardList,
        path: '/admin/projects'
      },
      {
        id: 'project-create',
        label: '프로젝트 생성',
        icon: PlusCircle,
        path: '/admin/projects/create'
      }
    ]
  },
  {
    title: '계정',
    items: [
      {
        id: 'accounts',
        label: '계정 관리',
        icon: Users,
        path: '/admin/accounts'
      },
      {
        id: 'account-create',
        label: '계정 생성',
        icon: PlusCircle,
        path: '/admin/accounts/create'
      }
    ]
  },
  {
    title: '회사',
    items: [
      {
        id: 'companies',
        label: '회사 관리',
        icon: Building2,
        path: '/admin/companies'
      },
      {
        id: 'company-create',
        label: '회사 생성',
        icon: PlusCircle,
        path: '/admin/companies/create'
      }
    ]
  }
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const MenuItem = ({ item }: { item: (typeof menuGroups)[0]['items'][0] }) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => navigate(item.path)}
        selected={isActive(item.path)}
        sx={{
          borderRadius: 1,
          mx: 1,
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
        <ListItemIcon sx={{ minWidth: 40 }}>
          <item.icon size={20} />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: '0.875rem'
          }}
        />
      </ListItemButton>
    </ListItem>
  )

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        backgroundColor: 'background.paper',
        position: 'fixed',
        left: 0,
        top: 64, // Header height
        pt: 2
      }}>
      {menuGroups.map((group, index) => (
        <React.Fragment key={group.title}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          <Typography
            variant="overline"
            sx={{
              px: 3,
              py: 1,
              color: 'text.secondary',
              fontWeight: 500
            }}>
            {group.title}
          </Typography>
          <List>
            {group.items.map(item => (
              <MenuItem
                key={item.id}
                item={item}
              />
            ))}
          </List>
        </React.Fragment>
      ))}
    </Box>
  )
}

export default Sidebar
