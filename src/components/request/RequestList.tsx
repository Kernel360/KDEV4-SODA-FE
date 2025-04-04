import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import dayjs from 'dayjs'
import type { Request } from '../../types/request'

interface RequestWithProject extends Request {
  projectName: string
}

interface RequestListProps {
  requests: RequestWithProject[]
  title?: string
  onRequestClick?: (requestId: number) => void
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  title = '최근 요청사항',
  onRequestClick
}) => {
  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {requests.map(request => (
          <Paper
            key={request.id}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => onRequestClick?.(request.id)}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold' }}>
                {request.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color:
                    request.status === '승인됨'
                      ? 'success.main'
                      : request.status === '반려됨'
                        ? 'error.main'
                        : 'warning.main'
                }}>
                {request.status}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}>
              {request.projectName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary">
              {dayjs(request.createdAt).format('YYYY.MM.DD HH:mm')}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default RequestList
