import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { ArrowForward } from '@mui/icons-material'

interface DashboardItem {
  id: number
  title: string
  date: string
  status?: string
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate()

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const recentRequests: DashboardItem[] = [
    { id: 1, title: '요청사항 1', date: '2024-03-15', status: '진행중' },
    { id: 2, title: '요청사항 2', date: '2024-03-14', status: '완료' },
    { id: 3, title: '요청사항 3', date: '2024-03-13', status: '대기중' }
  ]

  const recentQuestions: DashboardItem[] = [
    { id: 1, title: '질문 1', date: '2024-03-15' },
    { id: 2, title: '질문 2', date: '2024-03-14' },
    { id: 3, title: '질문 3', date: '2024-03-13' }
  ]

  const ongoingProjects: DashboardItem[] = [
    { id: 1, title: '프로젝트 1', date: '2024-03-15', status: '진행중' },
    { id: 2, title: '프로젝트 2', date: '2024-03-14', status: '진행중' },
    { id: 3, title: '프로젝트 3', date: '2024-03-13', status: '진행중' }
  ]

  const handleItemClick = (type: string, id: number) => {
    switch (type) {
      case 'request':
        navigate(`/requests/${id}`)
        break
      case 'question':
        navigate(`/questions/${id}`)
        break
      case 'project':
        navigate(`/projects/${id}`)
        break
    }
  }

  const renderDashboardSection = (
    title: string,
    items: DashboardItem[],
    type: string,
    viewAllPath: string
  ) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate(viewAllPath)}
            size="small">
            더보기
          </Button>
        </Box>
        <List>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem
                button
                onClick={() => handleItemClick(type, item.id)}
                sx={{ px: 0 }}>
                <ListItemText
                  primary={item.title}
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                      {item.status && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: item.status === '진행중' ? 'primary.main' : 'text.secondary'
                          }}>
                          {item.status}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        대시보드
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderDashboardSection(
            '최근 요청사항',
            recentRequests,
            'request',
            '/requests'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderDashboardSection(
            '최근 질문',
            recentQuestions,
            'question',
            '/questions'
          )}
        </Grid>
        <Grid item xs={12}>
          {renderDashboardSection(
            '진행중인 프로젝트',
            ongoingProjects,
            'project',
            '/projects'
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserDashboard 