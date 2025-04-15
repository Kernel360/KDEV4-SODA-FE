import React from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
// import { useNavigate } from 'react-router-dom'

const RequestList: React.FC = () => {
  //const navigate = useNavigate()

  // TODO: 실제 API 연동 후 데이터로 교체
  const requests = [
    {
      id: 1,
      title: '프로젝트 일정 변경 요청',
      status: '대기',
      date: '2024-03-20'
    },
    {
      id: 2,
      title: '기능 추가 요청',
      status: '진행중',
      date: '2024-03-19'
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3 }}>
        요청사항 목록 (더미 데이터)
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 2, bgcolor: 'background.paper' }}>
        <List>
          {requests.map((request, index) => (
            <React.Fragment key={request.id}>
              <ListItem
                button
                //onClick={() => navigate(`/user/requests/${request.id}`)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}>
                <ListItemText
                  primary={request.title}
                  secondary={`상태: ${request.status} | 요청일: ${request.date}`}
                  primaryTypographyProps={{
                    fontWeight: 'medium'
                  }}
                  secondaryTypographyProps={{
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
              {index < requests.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  )
}

export default RequestList
