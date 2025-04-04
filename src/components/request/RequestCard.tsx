import React from 'react'
import { Box, Paper, Typography, Chip } from '@mui/material'
import type { Request } from '../../types/request'
import dayjs from 'dayjs'

interface RequestCardProps {
  request: Request
  onClick?: () => void
}

const getStatusColor = (status: Request['status']) => {
  switch (status) {
    case '승인대기중':
      return 'warning'
    case '승인됨':
      return 'success'
    case '반려됨':
      return 'error'
    default:
      return 'default'
  }
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  return (
    <Paper
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {}
      }}
      onClick={onClick}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1
        }}>
        <Box>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: 'bold' }}>
            {request.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary">
            {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}
          </Typography>
        </Box>
        <Chip
          label={request.status}
          color={getStatusColor(request.status)}
          size="small"
        />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary">
        {request.description}
      </Typography>
    </Paper>
  )
}

export default RequestCard
