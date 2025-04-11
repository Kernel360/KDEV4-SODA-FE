import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Chip,
  Link,
  Paper
} from '@mui/material'
import { Edit2, Link as LinkIcon, FileText } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import {
  getTaskRequests,
  deleteTaskRequest,
  approveTaskRequest,
  rejectTaskRequest
} from '../../api/task'
import type { TaskRequest } from '../../types/request'

interface TaskResponseListProps {
  taskId: number
  onResponseAdded?: () => void
  onResponseUpdated?: () => void
  onResponseDeleted?: () => void
}

const TaskResponseList: React.FC<TaskResponseListProps> = ({
  taskId,
  onResponseDeleted
}) => {
  const [requests, setRequests] = useState<TaskRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setIsCreating] = useState(false)
  const [, setIsEditing] = useState(false)
  const [, setSelectedRequest] = useState<TaskRequest | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Fetching requests for taskId:', taskId)
        const response = await getTaskRequests(taskId)
        console.log('Task requests response:', response)
        if (response.status === 'success' && response.data) {
          console.log('Task requests data:', response.data)
          setRequests(response.data)
        } else {
          setError(response.message || '요청 목록을 불러오는데 실패했습니다.')
          setRequests([])
        }
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError('요청 목록 로딩 중 오류가 발생했습니다.')
        setRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      fetchRequests()
    }
  }, [taskId])

  const handleEditClick = (request: TaskRequest) => {
    setSelectedRequest(request)
    setIsEditing(true)
  }

  const handleDeleteRequest = async (requestId: number) => {
    try {
      const response = await deleteTaskRequest(requestId) as { status: string; message?: string }
      if (response.status === 'success') {
        showToast('요청이 삭제되었습니다.', 'success')
        onResponseDeleted?.()
      } else {
        showToast(response.message || '요청 삭제에 실패했습니다.', 'error')
      }
    } catch (err) {
      showToast('요청 삭제 중 오류가 발생했습니다.', 'error')
      console.error(err)
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      const response = await approveTaskRequest(requestId, {
        comment: '승인합니다.',
        links: []
      })
      
      if (response.status === 'success') {
        // 요청 목록 새로고침
        const updatedRequests = await getTaskRequests(taskId)
        if (updatedRequests.status === 'success' && updatedRequests.data) {
          setRequests(updatedRequests.data)
        }
      } else {
        setError(response.message || '요청 승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      setError('요청 승인 중 오류가 발생했습니다.')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      const response = await rejectTaskRequest(requestId, {
        comment: '반려합니다.',
        links: [],
        projectId: 0
      })
      
      if (response.status === 'success') {
        // 요청 목록 새로고침
        const updatedRequests = await getTaskRequests(taskId)
        if (updatedRequests.status === 'success' && updatedRequests.data) {
          setRequests(updatedRequests.data)
        }
      } else {
        setError(response.message || '요청 반려에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      setError('요청 반려 중 오류가 발생했습니다.')
    }
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography variant="h6">요청 목록</Typography>
        <Button
          variant="contained"
          onClick={() => setIsCreating(true)}
          startIcon={<Edit2 size={20} />}>
          요청 작성
        </Button>
      </Box>

      {isLoading && <Typography>요청 목록 로딩 중...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!isLoading && !error && requests.length === 0 && (
        <Typography color="text.secondary">
          아직 작성된 요청이 없습니다.
        </Typography>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <List>
          {requests.map(request => (
            <ListItem
              key={request.requestId}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                p: 2
              }}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {request.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                    {request.content}
                  </Typography>
                  {request.links && request.links.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>링크</Typography>
                      {request.links.map(link => (
                        <Box key={link.id} sx={{ mb: 1 }}>
                          <Link
                            href={link.urlAddress}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              mb: 0.5
                            }}>
                            <LinkIcon size={14} />
                            {link.urlDescription}
                          </Link>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2.5 }}>
                            {link.urlAddress}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {request.files && request.files.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>첨부파일</Typography>
                      {request.files.map(file => (
                        <Box key={file.id} sx={{ mb: 1 }}>
                          <Link
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              mb: 0.5
                            }}>
                            <FileText size={14} />
                            {file.name}
                          </Link>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2.5 }}>
                            {file.url}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      작성자: {request.memberName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      작성일: {new Date(request.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  <Chip
                    label={request.status === 'PENDING' ? '대기중' : request.status === 'APPROVED' ? '승인됨' : '반려됨'}
                    color={request.status === 'PENDING' ? 'default' : request.status === 'APPROVED' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEditClick(request)}
                  disabled={request.status !== 'PENDING'}>
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteRequest(request.requestId)}
                  disabled={request.status !== 'PENDING'}>
                  삭제
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApprove(request.requestId)}
                  disabled={request.status !== 'PENDING'}>
                  승인
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(request.requestId)}
                  disabled={request.status !== 'PENDING'}>
                  반려
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}

export default TaskResponseList
