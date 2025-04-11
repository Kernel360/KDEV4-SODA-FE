import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  DialogContentText
} from '@mui/material'
import { Check, X, ArrowLeft, Link as LinkIcon } from 'lucide-react'
import type { TaskRequest } from '../../types/request'

interface RequestDetailProps {
  request: TaskRequest
  onBack: () => void
  onApprove?: (request: TaskRequest) => void
  onReject?: (
    request: TaskRequest,
    comment: string,
    links: Array<{ urlAddress: string; urlDescription: string }>
  ) => void
}

const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onBack,
  onApprove,
  onReject
}) => {
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectForm, setRejectForm] = useState({
    comment: '',
    links: [] as { urlAddress: string; urlDescription: string }[]
  })
  const [newLink, setNewLink] = useState({ urlAddress: '', urlDescription: '' })

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

  const handleAddLink = () => {
    if (newLink.urlAddress.trim() && newLink.urlDescription.trim()) {
      setRejectForm(prev => ({
        ...prev,
        links: [...prev.links, newLink]
      }))
      setNewLink({ urlAddress: '', urlDescription: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setRejectForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const handleRejectClick = () => {
    if (!isRejecting) {
      setIsRejecting(true)
      return
    }

    if (onReject && rejectForm.comment.trim()) {
      onReject(request, rejectForm.comment, rejectForm.links)
      setIsRejecting(false)
      setRejectForm({ comment: '', links: [] })
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography variant="h5">{request.title}</Typography>
        <Chip
          label={getStatusText(request.status)}
          color={getStatusColor(request.status)}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap' }}>
          {request.content}
        </Typography>
      </Box>

      {isRejecting && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2 }}>
            반려 사유 입력
          </Typography>
          <DialogContentText sx={{ mb: 2 }}>
            반려 사유를 입력하고 필요한 경우 참고 링크를 추가해주세요.
          </DialogContentText>
          <TextField
            label="반려 사유"
            value={rejectForm.comment}
            onChange={e =>
              setRejectForm(prev => ({ ...prev, comment: e.target.value }))
            }
            multiline
            rows={4}
            fullWidth
            required
            sx={{ mb: 3 }}
          />

          <Typography
            variant="subtitle2"
            sx={{ mb: 1 }}>
            참고 링크
          </Typography>
          <Box sx={{ mb: 2 }}>
            {rejectForm.links.map((link, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LinkIcon size={16} />
                <Typography
                  variant="body2"
                  sx={{ flex: 1 }}>
                  {link.urlDescription} ({link.urlAddress})
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveLink(index)}>
                  <X size={16} />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="링크 주소"
              value={newLink.urlAddress}
              onChange={e =>
                setNewLink(prev => ({ ...prev, urlAddress: e.target.value }))
              }
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="링크 설명"
              value={newLink.urlDescription}
              onChange={e =>
                setNewLink(prev => ({
                  ...prev,
                  urlDescription: e.target.value
                }))
              }
              size="small"
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddLink}
              disabled={
                !newLink.urlAddress.trim() || !newLink.urlDescription.trim()
              }>
              추가
            </Button>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3
        }}>
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
              <Tooltip title={isRejecting ? '반려하기' : '반려'}>
                <IconButton
                  color="error"
                  onClick={handleRejectClick}>
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
