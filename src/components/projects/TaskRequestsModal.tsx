import React, { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Paper,
  Stack
} from '@mui/material'
import { Plus, X, Link as LinkIcon, FileText } from 'lucide-react'
import { getTaskRequests } from '../../api/task'
import type { TaskRequest, TaskRequestsResponse } from '../../types/api'

interface TaskRequestsModalProps {
  open: boolean
  onClose: () => void
  task: TaskRequest | null
}

const MAX_ATTACHMENTS = 10
const MAX_FILES = 10
const MAX_LINKS = 10

const TaskRequestsModal: React.FC<TaskRequestsModalProps> = ({
  open,
  onClose,
  task
}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    content: '',
    attachments: [] as RequestAttachment[]
  })
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionAttachments, setRejectionAttachments] = useState<
    RequestAttachment[]
  >([])
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  )

  useEffect(() => {
    if (task) {
      fetchRequests()
    }
  }, [task])

  const fetchRequests = async () => {
    if (!task) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(task.taskId)
      if (response.status === 'success' && response.data) {
        setRequests(response.data)
      } else {
        setError(response.message || '요청 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      setError('요청 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRequest = () => {
    if (!task) return

    const request: Request = {
      id: Date.now(),
      title: newRequest.title,
      content: newRequest.content,
      status: '승인 대기중',
      attachments: newRequest.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // TODO: API 호출로 대체
    console.log('Create request:', request)
    setIsCreatingRequest(false)
    setNewRequest({ title: '', content: '', attachments: [] })
  }

  const handleApproveRequest = (requestId: number) => {
    if (!task) return

    const action: RequestAction = {
      type: '승인',
      actorName: '관리자', // TODO: 실제 사용자 정보로 대체
      createdAt: new Date().toISOString()
    }

    // TODO: API 호출로 대체
    console.log('Approve request:', requestId, action)
  }

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId)
    setIsRejecting(true)
  }

  const handleRejectRequest = () => {
    if (!task || !rejectionReason || !selectedRequestId) return

    const action: RequestAction = {
      type: '반려',
      actorName: '관리자', // TODO: 실제 사용자 정보로 대체
      reason: rejectionReason,
      attachments: rejectionAttachments,
      createdAt: new Date().toISOString()
    }

    // TODO: API 호출로 대체
    console.log('Reject request:', selectedRequestId, action)
    setIsRejecting(false)
    setRejectionReason('')
    setRejectionAttachments([])
    setSelectedRequestId(null)
  }

  const getFileCount = (attachments: RequestAttachment[]) => {
    return attachments.filter(a => a.type === 'file').length
  }

  const getLinkCount = (attachments: RequestAttachment[]) => {
    return attachments.filter(a => a.type === 'link').length
  }

  const handleAddAttachment = (type: 'file' | 'link') => {
    if (type === 'link' && (!newLink.title || !newLink.url)) return

    const attachment: RequestAttachment = {
      id: Date.now(),
      type,
      title: type === 'link' ? newLink.title : '첨부파일',
      url: type === 'link' ? newLink.url : '',
      fileName: type === 'file' ? '파일명' : undefined
    }

    if (isRejecting) {
      if (type === 'file' && getFileCount(rejectionAttachments) >= MAX_FILES)
        return
      if (type === 'link' && getLinkCount(rejectionAttachments) >= MAX_LINKS)
        return
      setRejectionAttachments([...rejectionAttachments, attachment])
    } else {
      if (type === 'file' && getFileCount(newRequest.attachments) >= MAX_FILES)
        return
      if (type === 'link' && getLinkCount(newRequest.attachments) >= MAX_LINKS)
        return
      setNewRequest({
        ...newRequest,
        attachments: [...newRequest.attachments, attachment]
      })
    }

    if (type === 'link') {
      setNewLink({ title: '', url: '' })
      setIsAddingLink(false)
    }
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isRejection: boolean
  ) => {
    const files = event.target.files
    if (!files) return

    const currentAttachments = isRejection
      ? rejectionAttachments
      : newRequest.attachments
    const currentFileCount = getFileCount(currentAttachments)
    const remainingSlots = MAX_FILES - currentFileCount

    if (remainingSlots <= 0) return

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach(file => {
        const attachment: RequestAttachment = {
          id: Date.now(),
          type: 'file',
          title: file.name,
          fileName: file.name
        }

        if (isRejection) {
          setRejectionAttachments([...rejectionAttachments, attachment])
        } else {
          setNewRequest({
            ...newRequest,
            attachments: [...newRequest.attachments, attachment]
          })
        }
      })
  }

  const handleRemoveAttachment = (id: number, isRejection: boolean) => {
    if (isRejection) {
      setRejectionAttachments(rejectionAttachments.filter(a => a.id !== id))
    } else {
      setNewRequest({
        ...newRequest,
        attachments: newRequest.attachments.filter(a => a.id !== id)
      })
    }
  }

  const canCreateRequest = () => {
    if (!task) return false
    if (task.status === '승인') return false

    // 신청 대기중인 경우 항상 요청사항 생성 가능
    if (task.status === '신청 대기 중') return true

    // 현재 승인 대기중인 요청사항이 있는지 확인
    const hasPendingRequest = requests.some(req => req.status === '승인 대기중')
    // 반려된 요청사항이 있는지 확인
    const hasRejectedRequest = requests.some(req => req.status === '반려됨')

    // 승인 대기중인 요청사항이 없고, 반려된 요청사항이 있는 경우에만 새 요청사항 생성 가능
    return !hasPendingRequest && hasRejectedRequest
  }

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setIsCreatingRequest(false)
    setNewRequest({ title: '', content: '', attachments: [] })
    setNewLink({ title: '', url: '' })
    setIsAddingLink(false)
    setIsRejecting(false)
    setRejectionReason('')
    setRejectionAttachments([])
    setSelectedRequestId(null)
    setRequests([])
    setError(null)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#22c55e', backgroundColor: '#f0fdf4' }
      case 'REJECTED':
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      case 'PENDING':
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Typography variant="h6">{task?.title}</Typography>
          {canCreateRequest() && (
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setIsCreatingRequest(true)}
              size="small">
              요청사항 추가
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>로딩 중...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ color: 'error.main', p: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!isLoading && !error && requests.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>등록된 요청이 없습니다.</Typography>
          </Box>
        )}

        {!isLoading && !error && isCreatingRequest ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="제목"
              fullWidth
              value={newRequest.title}
              onChange={e =>
                setNewRequest({ ...newRequest, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={4}
              value={newRequest.content}
              onChange={e =>
                setNewRequest({ ...newRequest, content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}>
                첨부파일 ({getFileCount(newRequest.attachments)}/10) 및 링크 (
                {getLinkCount(newRequest.attachments)}/10)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileText size={16} />}
                  size="small"
                  disabled={getFileCount(newRequest.attachments) >= MAX_FILES}>
                  파일 첨부
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={e => handleFileUpload(e, false)}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon size={16} />}
                  size="small"
                  onClick={() => setIsAddingLink(true)}
                  disabled={getLinkCount(newRequest.attachments) >= MAX_LINKS}>
                  링크 추가
                </Button>
              </Stack>
              {isAddingLink && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="링크 제목"
                    size="small"
                    value={newLink.title}
                    onChange={e =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                  />
                  <TextField
                    label="URL"
                    size="small"
                    value={newLink.url}
                    onChange={e =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddAttachment('link')}
                    disabled={!newLink.title || !newLink.url}>
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingLink(false)}>
                    취소
                  </Button>
                </Box>
              )}
              <List>
                {newRequest.attachments.map(attachment => (
                  <ListItem
                    key={attachment.id}
                    sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={attachment.title}
                      secondary={
                        attachment.type === 'link'
                          ? attachment.url
                          : attachment.fileName
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleRemoveAttachment(attachment.id, false)
                        }>
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsCreatingRequest(false)}>취소</Button>
              <Button
                variant="contained"
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.content}>
                생성
              </Button>
            </Box>
          </Box>
        ) : isRejecting ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="반려 사유"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}>
                첨부파일 ({getFileCount(rejectionAttachments)}/10) 및 링크 (
                {getLinkCount(rejectionAttachments)}/10)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileText size={16} />}
                  size="small"
                  disabled={getFileCount(rejectionAttachments) >= MAX_FILES}>
                  파일 첨부
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={e => handleFileUpload(e, true)}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon size={16} />}
                  size="small"
                  onClick={() => setIsAddingLink(true)}
                  disabled={getLinkCount(rejectionAttachments) >= MAX_LINKS}>
                  링크 추가
                </Button>
              </Stack>
              {isAddingLink && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="링크 제목"
                    size="small"
                    value={newLink.title}
                    onChange={e =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                  />
                  <TextField
                    label="URL"
                    size="small"
                    value={newLink.url}
                    onChange={e =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddAttachment('link')}
                    disabled={!newLink.title || !newLink.url}>
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingLink(false)}>
                    취소
                  </Button>
                </Box>
              )}
              <List>
                {rejectionAttachments.map(attachment => (
                  <ListItem
                    key={attachment.id}
                    sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={attachment.title}
                      secondary={
                        attachment.type === 'link'
                          ? attachment.url
                          : attachment.fileName
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          handleRemoveAttachment(attachment.id, true)
                        }>
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsRejecting(false)}>취소</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectRequest}
                disabled={!rejectionReason}>
                반려
              </Button>
            </Box>
          </Box>
        ) : (
          <List>
            {requests.map(request => (
              <Paper
                key={request.requestId}
                sx={{ mb: 2, p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                  <Typography variant="subtitle1">{request.title}</Typography>
                  <Chip
                    label={request.status}
                    size="small"
                    sx={{
                      color: getStatusColor(request.status).color,
                      backgroundColor: getStatusColor(request.status).backgroundColor,
                      borderRadius: '16px',
                      border: 'none'
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 2 }}>
                  {request.content}
                </Typography>
                {request.links.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      링크
                    </Typography>
                    <List dense>
                      {request.links.map(link => (
                        <ListItem
                          key={link.id}
                          sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={link.urlDescription}
                            secondary={
                              <a
                                href={link.urlAddress}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'inherit',
                                  textDecoration: 'underline',
                                  cursor: 'pointer'
                                }}>
                                {link.urlAddress}
                              </a>
                            }
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontSize: '0.875rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                  <Typography
                    variant="body2"
                    color="text.secondary">
                    {request.memberName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary">
                    {new Date(request.createdAt).toLocaleString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Typography>
                </Box>
                {request.status === '승인 대기중' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 1,
                      mt: 2
                    }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRejectClick(request.requestId)}>
                      반려
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleApproveRequest(request.requestId)}>
                      승인
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TaskRequestsModal
