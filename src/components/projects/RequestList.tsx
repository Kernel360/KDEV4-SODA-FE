import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Collapse,
  Divider,
  Button,
  TextField,
  DialogContentText,
  IconButton
} from '@mui/material'
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  User,
  Link as LinkIcon
} from 'lucide-react'
import type { TaskRequest } from '../../types/request'

interface RequestListProps {
  requests: TaskRequest[]
  onRequestClick: (request: TaskRequest) => void
  onEdit: (request: TaskRequest) => void
  onDelete: (request: TaskRequest) => void
  onApprove: (request: TaskRequest) => void
  onReject: (
    request: TaskRequest,
    comment: string,
    links: Array<{ urlAddress: string; urlDescription: string }>
  ) => void
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  onEdit,
  onDelete,
  onApprove,
  onReject
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(
    null
  )
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

  const handleRequestClick = (request: TaskRequest) => {
    setExpandedId(expandedId === request.requestId ? null : request.requestId)
  }

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

  const handleRejectClick = (request: TaskRequest) => {
    if (rejectingRequestId !== request.requestId) {
      setRejectingRequestId(request.requestId)
      return
    }

    if (rejectForm.comment.trim()) {
      onReject(request, rejectForm.comment, rejectForm.links)
      setRejectingRequestId(null)
      setRejectForm({ comment: '', links: [] })
    }
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">등록된 요청이 없습니다.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {requests.map(request => (
        <Paper
          key={request.requestId}
          elevation={1}
          sx={{
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleRequestClick(request)}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">{request.title}</Typography>
                <Typography
                  variant="caption"
                  color={getStatusColor(request.status)}
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: `${getStatusColor(request.status)}.light`,
                    color: `${getStatusColor(request.status)}.dark`
                  }}>
                  {getStatusText(request.status)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap>
                {request.content}
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <User size={14} />
                  <Typography
                    variant="caption"
                    color="text.secondary">
                    {request.requester?.name || '알 수 없음'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={14} />
                  <Typography
                    variant="caption"
                    color="text.secondary">
                    {new Date(request.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {expandedId === request.requestId ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Box>
          </Box>
          <Collapse in={expandedId === request.requestId}>
            <Divider />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {request.content}
              </Typography>

              {rejectingRequestId === request.requestId && (
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
                      setRejectForm(prev => ({
                        ...prev,
                        comment: e.target.value
                      }))
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
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1
                        }}>
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
                        setNewLink(prev => ({
                          ...prev,
                          urlAddress: e.target.value
                        }))
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
                        !newLink.urlAddress.trim() ||
                        !newLink.urlDescription.trim()
                      }>
                      추가
                    </Button>
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mt: 2
                }}>
                {request.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<X size={16} />}
                      onClick={e => {
                        e.stopPropagation()
                        handleRejectClick(request)
                      }}>
                      {rejectingRequestId === request.requestId
                        ? '반려하기'
                        : '반려'}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Check size={16} />}
                      onClick={e => {
                        e.stopPropagation()
                        onApprove(request)
                      }}>
                      승인
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Edit size={16} />}
                  onClick={e => {
                    e.stopPropagation()
                    onEdit(request)
                  }}>
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={16} />}
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(request)
                  }}>
                  삭제
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  )
}

export default RequestList
