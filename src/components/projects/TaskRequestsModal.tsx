import React, { useState } from 'react'
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
import type {
  Task,
  Request,
  RequestAttachment,
  RequestAction
} from '../../types/stage'

interface TaskRequestsModalProps {
  open: boolean
  onClose: () => void
  task: Task | null
}

const MAX_ATTACHMENTS = 10
const MAX_FILES = 10
const MAX_LINKS = 10

const TaskRequestsModal: React.FC<TaskRequestsModalProps> = ({
  open,
  onClose,
  task
}) => {
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
    onClose()
  }

  // 더미 데이터
  const dummyRequests: Request[] = [
    // 1. 승인 대기중인 요청사항만 있는 경우 (새 요청 생성 불가)
    {
      id: 1,
      title: '회원가입 UI 디자인 검토 요청',
      content: '회원가입 페이지의 UI 디자인 검토 부탁드립니다.',
      status: '승인 대기중',
      attachments: [
        {
          id: 1,
          type: 'file',
          title: '회원가입_디자인.fig',
          fileName: '회원가입_디자인.fig'
        },
        {
          id: 2,
          type: 'link',
          title: '디자인 시안 Figma',
          url: 'https://figma.com/file/example'
        }
      ],
      createdAt: '2024-02-20T10:00:00',
      updatedAt: '2024-02-20T10:00:00'
    },
    // 2. 승인된 요청사항 (더 이상 요청 생성 불가)
    {
      id: 2,
      title: 'DB 스키마 검토 요청',
      content: '사용자 정보 스키마 설계 검토 부탁드립니다.',
      status: '승인됨',
      attachments: [
        {
          id: 3,
          type: 'file',
          title: 'DB_설계서.pdf',
          fileName: 'DB_설계서.pdf'
        }
      ],
      action: {
        type: '승인',
        actorName: '김승인',
        createdAt: '2024-02-19T16:00:00'
      },
      createdAt: '2024-02-19T15:00:00',
      updatedAt: '2024-02-19T16:00:00'
    },
    // 3. 반려된 요청사항만 있는 경우 (새 요청 생성 가능)
    {
      id: 3,
      title: '소셜 로그인 구현 검토',
      content: '카카오, 네이버 소셜 로그인 기능 구현 검토 요청드립니다.',
      status: '반려됨',
      attachments: [
        {
          id: 4,
          type: 'file',
          title: '소셜로그인_명세서.pdf',
          fileName: '소셜로그인_명세서.pdf'
        },
        {
          id: 5,
          type: 'link',
          title: '구현 가이드',
          url: 'https://example.com/social-login-guide'
        }
      ],
      action: {
        type: '반려',
        actorName: '박반려',
        reason:
          '보안 이슈가 있어 수정이 필요합니다. 아래 보안 가이드라인을 참고해주세요.',
        attachments: [
          {
            id: 6,
            type: 'file',
            title: '보안_가이드라인.pdf',
            fileName: '보안_가이드라인.pdf'
          },
          {
            id: 7,
            type: 'link',
            title: '보안 체크리스트',
            url: 'https://example.com/security-checklist'
          }
        ],
        createdAt: '2024-02-18T14:00:00'
      },
      createdAt: '2024-02-18T11:00:00',
      updatedAt: '2024-02-18T14:00:00'
    }
  ]

  // Task 상태에 따른 요청사항 필터링
  const getFilteredRequests = () => {
    if (!task) return []

    switch (task.status) {
      case '신청 대기 중':
        return [] // 요청사항이 없는 경우
      case '승인 대기 중':
        return dummyRequests.filter(req => req.status === '승인 대기중')
      case '승인':
        return dummyRequests.filter(req => req.status === '승인됨')
      case '반려':
        return dummyRequests.filter(req => req.status === '반려됨')
      default:
        return []
    }
  }

  const requests = task ? getFilteredRequests() : dummyRequests

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
        {isCreatingRequest ? (
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
                key={request.id}
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
                    color={
                      request.status === '승인됨'
                        ? 'success'
                        : request.status === '반려됨'
                          ? 'error'
                          : 'warning'
                    }
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 2 }}>
                  {request.content}
                </Typography>
                {request.attachments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      첨부파일 및 링크
                    </Typography>
                    <List dense>
                      {request.attachments.map(attachment => (
                        <ListItem
                          key={attachment.id}
                          sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={attachment.title}
                            secondary={
                              attachment.type === 'link' ? (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: 'inherit',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                  }}>
                                  {attachment.url}
                                </a>
                              ) : (
                                attachment.fileName
                              )
                            }
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontSize: '0.875rem' }
                            }}
                            secondaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontSize: '0.75rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {request.action && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize: '0.875rem', mb: 1 }}>
                      처리 결과
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ width: 80, color: 'text.secondary' }}>
                          처리자
                        </Typography>
                        <Typography variant="body2">
                          {request.action.actorName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ width: 80, color: 'text.secondary' }}>
                          처리일시
                        </Typography>
                        <Typography variant="body2">
                          {new Date(request.action.createdAt).toLocaleString(
                            'ko-KR',
                            {
                              year: '2-digit',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            }
                          )}
                        </Typography>
                      </Box>
                      {request.action.type === '반려' &&
                        request.action.reason && (
                          <Box sx={{ display: 'flex', mb: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ width: 80, color: 'text.secondary' }}>
                              반려사유
                            </Typography>
                            <Typography variant="body2">
                              {request.action.reason}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                    {request.action.type === '반려' &&
                      request.action.attachments &&
                      request.action.attachments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                            반려 관련 첨부파일 및 링크
                          </Typography>
                          <List dense>
                            {request.action.attachments.map(attachment => (
                              <ListItem
                                key={attachment.id}
                                sx={{ py: 0.25 }}>
                                <ListItemText
                                  primary={attachment.title}
                                  secondary={
                                    attachment.type === 'link' ? (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: 'inherit',
                                          textDecoration: 'underline',
                                          cursor: 'pointer'
                                        }}>
                                        {attachment.url}
                                      </a>
                                    ) : (
                                      attachment.fileName
                                    )
                                  }
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    sx: { fontSize: '0.875rem' }
                                  }}
                                  secondaryTypographyProps={{
                                    variant: 'body2',
                                    sx: { fontSize: '0.75rem' }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                  </Box>
                )}
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
                      onClick={() => handleRejectClick(request.id)}>
                      반려
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleApproveRequest(request.id)}>
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
