import React, { useState } from 'react'
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material'
import { getTaskRequests } from '../../api/task'
import type { TaskRequestsResponse } from '../../types/api'

interface TaskProps {
  id: number
  title: string
  description: string
  status: string
}

const Task: React.FC<TaskProps> = ({ id, title, description, status }) => {
  const [requests, setRequests] = useState<TaskRequestsResponse['data']>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTaskClick = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(id)
      if (response.status === 'success') {
        setRequests(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('요청 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={handleTaskClick}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        상태: {status}
      </Typography>

      {isLoading && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography>로딩 중...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {requests.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">요청 목록</Typography>
          <List>
            {requests.map((request) => (
              <React.Fragment key={request.requestId}>
                <ListItem>
                  <ListItemText
                    primary={request.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {request.memberName}
                        </Typography>
                        {` — ${request.content}`}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  )
}

export default Task 