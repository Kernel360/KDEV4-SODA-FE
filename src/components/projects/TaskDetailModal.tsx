import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  IconButton
} from '@mui/material'
import { X } from 'lucide-react'
import { getTaskRequests } from '../../api/task'
import type { TaskRequest } from '../../types/api'

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  projectId: number
  stageId: number
  taskId: number
  onTaskAdded: () => void
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  onClose,
  stageId}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddRequestModalOpen, setIsAddRequestModalOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({ title: '', content: '' })

  useEffect(() => {
    if (open) {
      fetchRequests()
    }
  }, [open])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(stageId)
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

  const handleAddRequest = () => {
    // TODO: API 호출 구현
    setIsAddRequestModalOpen(false)
    setNewRequest({ title: '', content: '' })
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">작업 상세</Typography>
            <IconButton onClick={onClose} size="small">
              <X />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">요청사항</Typography>
              <Button
                variant="contained"
                onClick={() => setIsAddRequestModalOpen(true)}>
                요청사항 추가
              </Button>
            </Box>

            {isLoading && <Typography>로딩 중...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            <List>
              {requests.map(request => (
                <ListItem
                  key={request.requestId}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{request.title}</Typography>
                        <Chip
                          label={request.status}
                          size="small"
                          color={
                            request.status === '승인'
                              ? 'success'
                              : request.status === '반려'
                              ? 'error'
                              : 'default'
                          }
                        />
                      </Box>
                    }
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAddRequestModalOpen}
        onClose={() => setIsAddRequestModalOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>새 요청사항 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="제목"
            fullWidth
            value={newRequest.title}
            onChange={e =>
              setNewRequest({ ...newRequest, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="내용"
            fullWidth
            multiline
            rows={4}
            value={newRequest.content}
            onChange={e =>
              setNewRequest({ ...newRequest, content: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddRequestModalOpen(false)}>취소</Button>
          <Button
            onClick={handleAddRequest}
            variant="contained"
            disabled={!newRequest.title.trim() || !newRequest.content.trim()}>
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TaskDetailModal 