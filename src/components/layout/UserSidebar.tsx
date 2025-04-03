import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from '@mui/material'
import { ClipboardList } from 'lucide-react'

// 실제로는 API에서 받아올 데이터
const mockProjects = [
  {
    id: 1,
    title: '웹사이트 리뉴얼 프로젝트'
  },
  {
    id: 2,
    title: '모바일 앱 개발'
  },
  {
    id: 3,
    title: 'ERP 시스템 구축'
  }
]

const UserSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const MenuItem = ({ id, title }: { id: number; title: string }) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => navigate(`/user/projects/${id}`)}
        selected={isActive(`/user/projects/${id}`)}
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
          <ClipboardList size={20} />
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            noWrap: true
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
      <Typography
        variant="overline"
        sx={{
          px: 3,
          py: 1,
          color: 'text.secondary',
          fontWeight: 500
        }}>
        내 프로젝트
      </Typography>
      <List>
        {mockProjects.map(project => (
          <MenuItem
            key={project.id}
            id={project.id}
            title={project.title}
          />
        ))}
      </List>
    </Box>
  )
}

export default UserSidebar
