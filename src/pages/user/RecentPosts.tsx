import React from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

const RecentPosts: React.FC = () => {
  const navigate = useNavigate()

  // TODO: 실제 API 연동 후 데이터로 교체
  const posts = [
    {
      id: 1,
      title: '프로젝트 진행 상황 보고',
      project: 'KDEV4 프로젝트',
      date: '2024-03-20',
      type: '진행보고'
    },
    {
      id: 2,
      title: '기능 개발 완료 안내',
      project: 'SODA 프로젝트',
      date: '2024-03-19',
      type: '완료보고'
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3 }}>
        최근 게시글 (더미 데이터)
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 2, bgcolor: 'background.paper' }}>
        <List>
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <ListItem
                button
                onClick={() => navigate(`/user/projects/${post.id}`)} // 추후 게시글 페이지로 변경 예정
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'medium' }}>
                        {post.title}
                      </Typography>
                      <Chip
                        label={post.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={`프로젝트: ${post.project} | 작성일: ${post.date}`}
                  secondaryTypographyProps={{
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
              {index < posts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  )
}

export default RecentPosts
