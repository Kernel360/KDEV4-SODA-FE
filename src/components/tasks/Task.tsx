import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import { getTaskRequests } from '../../api/task'
import type { TaskRequest } from '../../types/api'

interface TaskProps {
  id: number
  title: string
  description: string
  status: string
}

const Task: React.FC<TaskProps> = ({ id, title, description, status }) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(id)
      if (response.status === 'success' && Array.isArray(response.data)) {
        setRequests(response.data)
      } else {
        setError(response.message || '요청 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Error fetching task requests:', error)
      setError('요청 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={fetchRequests}>
      <Typography variant="h6">{title}</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}>
        {description}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}>
        상태: {status}
      </Typography>

      {isLoading && <Typography>로딩 중...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {requests.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">요청 목록:</Typography>
          <List>
            {requests.map(request => (
              <ListItem key={request.requestId}>
                <ListItemText
                  primary={request.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary">
                        {request.content}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary">
                        작성자: {request.memberName} | 작성일:{' '}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  )
}

export default Task
