import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  CircularProgress
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { getTaskRequests } from '../../api/task'
import { Request as TaskRequest } from '../../types/request'

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  projectId: number
  stageId: number
  taskId: number
  onTaskAdded: () => void
}

interface NewRequest {
  title: string
  content: string
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  onClose,
  taskId,
}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddRequestModalOpen, setIsAddRequestModalOpen] = useState(false)
  const [newRequest, setNewRequest] = useState<NewRequest>({ title: '', content: '' })

  useEffect(() => {
    if (open && taskId) {
      fetchRequests()
    }
  }, [open, taskId])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskRequests(taskId)
      console.log('Task requests response:', response)
      if (response.data) {
        setRequests(response.data.map(taskRequest => ({
          id: taskRequest.requestId, // Changed requestId to id to match Request type
          requestId: taskRequest.requestId,
          taskId: taskRequest.taskId,
          memberId: taskRequest.memberId,
          memberName: taskRequest.memberName,
          title: taskRequest.title,
          content: taskRequest.content,
          links: taskRequest.links,
          files: taskRequest.files,
          status: taskRequest.status as "승인 대기중" | "승인됨" | "반려됨",
          createdAt: taskRequest.createdAt,
          updatedAt: taskRequest.updatedAt,
          attachments: []
        })))
      } else {
        setError('요청 목록을 불러오는데 실패했습니다.')
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Task 요청 목록</Typography>
          <IconButton
            color="primary"
            onClick={() => setIsAddRequestModalOpen(true)}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box>
            {requests.map((request) => (
              <Box
                key={request.id}
                mb={2}
                p={2}
                border="1px solid #e0e0e0"
                borderRadius={1}
              >
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1">{request.title}</Typography>
                  <Chip
                    label={request.status}
                    size="small"
                    color={
                      request.status === '승인됨'
                        ? 'success'
                        : request.status === '반려됨'
                        ? 'error'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {request.content}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>

      {/* 요청 추가 모달 */}
      <Dialog
        open={isAddRequestModalOpen}
        onClose={() => setIsAddRequestModalOpen(false)}
      >
        <DialogTitle>새 요청 추가</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="제목"
              fullWidth
              value={newRequest.title}
              onChange={(e) =>
                setNewRequest({ ...newRequest, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              rows={4}
              value={newRequest.content}
              onChange={(e) =>
                setNewRequest({ ...newRequest, content: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddRequestModalOpen(false)}>취소</Button>
          <Button onClick={handleAddRequest} color="primary">
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default TaskDetailModal 