import React from 'react'
import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material'
import { Check, X, ArrowLeft } from 'lucide-react'
import type { TaskRequest } from '../../types/request'

interface RequestDetailProps {
  request: TaskRequest
  onBack: () => void
  onApprove?: (request: TaskRequest) => void
  onReject?: (request: TaskRequest) => void
}

const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onBack,
  onApprove,
  onReject
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인됨'
      case 'REJECTED':
        return '반려됨'
      default:
        return '대기중'
    }
  }

  const isPending = request.status === 'PENDING'

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{request.title}</Typography>
        <Chip
          label={getStatusText(request.status)}
          color={getStatusColor(request.status)}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {request.content}
        </Typography>
      </Box>

      {request.links && request.links.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            첨부 링크
          </Typography>
          {request.links.map((link, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">{link.urlDescription}</Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                component="a"
                href={link.urlAddress}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {link.urlAddress}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {request.files && request.files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            첨부 파일
          </Typography>
          {request.files.map((file, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography 
                variant="body2"
                component="a"
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {file.fileName}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}>
          목록으로 돌아가기
        </Button>
        {isPending && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onApprove && (
              <Tooltip title="승인">
                <IconButton
                  color="success"
                  onClick={() => onApprove(request)}>
                  <Check size={20} />
                </IconButton>
              </Tooltip>
            )}
            {onReject && (
              <Tooltip title="반려">
                <IconButton
                  color="error"
                  onClick={() => onReject(request)}>
                  <X size={20} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default RequestDetail 