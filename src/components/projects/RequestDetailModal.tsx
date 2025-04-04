import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField
} from '@mui/material'

interface Request {
  id: number
  taskId: number
  title: string
  content: string
  status: '승인대기중' | '승인됨' | '반려됨'
  createdAt: string
  updatedAt: string
}

interface RejectFormData {
  reason: string
  attachments?: File[]
  links?: string[]
}

interface RequestDetailModalProps {
  open: boolean
  onClose: () => void
  request: Request | null
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  open,
  onClose,
  request
}) => {
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectForm, setRejectForm] = useState<RejectFormData>({
    reason: ''
  })

  const handleApprove = () => {
    // TODO: API 호출로 대체
    console.log('Approve request:', request?.id)
    onClose()
  }

  const handleReject = () => {
    if (!isRejecting) {
      setIsRejecting(true)
      return
    }

    // TODO: API 호출로 대체
    console.log('Reject request:', request?.id, rejectForm)
    setIsRejecting(false)
    onClose()
  }

  if (!request) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>요청사항 상세</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
            <Typography variant="h6">{request.title}</Typography>
            <Chip
              label={request.status}
              color={
                request.status === '승인됨'
                  ? 'success'
                  : request.status === '반려됨'
                    ? 'error'
                    : 'warning'
              }
            />
          </Box>
          <Typography
            variant="body1"
            sx={{ mb: 2 }}>
            {request.content}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary">
            작성일: {new Date(request.createdAt).toLocaleString()}
          </Typography>
        </Box>

        {isRejecting && (
          <TextField
            label="반려 사유"
            value={rejectForm.reason}
            onChange={e =>
              setRejectForm(prev => ({ ...prev, reason: e.target.value }))
            }
            multiline
            rows={4}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {request.status === '승인대기중' && (
          <>
            <Button
              onClick={handleReject}
              color="error"
              variant={isRejecting ? 'contained' : 'outlined'}
              disabled={isRejecting && !rejectForm.reason}>
              {isRejecting ? '반려하기' : '반려'}
            </Button>
            {!isRejecting && (
              <Button
                onClick={handleApprove}
                variant="contained">
                승인
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default RequestDetailModal
