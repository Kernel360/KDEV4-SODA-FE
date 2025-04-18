import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemAvatar,
  Avatar,
  Tooltip
} from '@mui/material'
import { Edit2, Trash2, Link as LinkIcon, FileText } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { getTaskDetail, deleteTask } from '../../api/task'
import type { ProjectStageTask } from '../../types/api'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types/user'

interface TaskDetailProps {
  taskId: number
  projectId: number
  onTaskUpdated?: () => void
  onTaskDeleted?: () => void
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  // projectId,
  // onTaskUpdated,
  onTaskDeleted
}) => {
  const [task, setTask] = useState<ProjectStageTask | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setIsEditing] = useState(false)
  const { showToast } = useToast()
  const { userRole } = useAuth()
  const [showResponseDialog, setShowResponseDialog] = useState(false)

  useEffect(() => {
    fetchTaskDetail()
  }, [taskId])

  const fetchTaskDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getTaskDetail(taskId)
      if (response.status === 'success' && response.data) {
        setTask(response.data)
      } else {
        setError(response.message || '작업 정보를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      setError('작업 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  // const handleEditModalClose = () => {
  //   setIsEditing(false)
  // }

  // const handleEditSubmit = async (data: Partial<ProjectStageTask>) => {
  //   if (!task) return

  //   try {
  //     const response = await updateTask(taskId, {
  //       ...task,
  //       ...data
  //     })

  //     if (response.status === 'success') {
  //       showToast('작업이 수정되었습니다.', 'success')
  //       onTaskUpdated?.()
  //       await fetchTaskDetail()
  //       handleEditModalClose()
  //     } else {
  //       showToast(response.message || '작업 수정에 실패했습니다.', 'error')
  //     }
  //   } catch (error) {
  //     showToast('작업 수정 중 오류가 발생했습니다.', 'error')
  //   }
  // }

  const handleDeleteTask = async () => {
    if (!task) return

    try {
      const response = await deleteTask(taskId)
      if (response.status === 'success') {
        showToast('작업이 삭제되었습니다.', 'success')
        onTaskDeleted?.()
      } else {
        showToast(response.message || '작업 삭제에 실패했습니다.', 'error')
      }
    } catch (error) {
      showToast('작업 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  if (isLoading) {
    return <Typography>로딩 중...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  if (!task) {
    return <Typography>작업 정보를 찾을 수 없습니다.</Typography>
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2
          }}>
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 1 }}>
              {task.title}
            </Typography>
            <Stack
              direction="row"
              spacing={1}>
              <Chip
                label={task.status}
                color={
                  task.status === 'APPROVED'
                    ? 'success'
                    : task.status === 'REJECTED'
                      ? 'error'
                      : 'warning'
                }
                size="small"
              />
            </Stack>
          </Box>
          <Box>
            <IconButton
              onClick={handleEditClick}
              sx={{ mr: 1 }}>
              <Edit2 size={20} />
            </IconButton>
            <IconButton onClick={handleDeleteTask}>
              <Trash2 size={20} />
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
          {task.content}
        </Typography>

        {(task.links?.length > 0 || task.files?.length > 0) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              {task.links?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}>
                    링크
                  </Typography>
                  <List>
                    {task.links.map(link => (
                      <ListItem
                        key={link.id}
                        sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box>
                              <Link
                                href={link.urlAddress}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                <LinkIcon size={14} />
                                {link.urlDescription}
                              </Link>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2.5 }}>
                                {link.urlAddress}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {task.files?.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}>
                    첨부파일
                  </Typography>
                  <List>
                    {task.files.map(file => (
                      <ListItem
                        key={file.id}
                        sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box>
                              <Link
                                href={file.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                <LinkIcon size={14} />
                                {file.name || '알 수 없는 파일'}
                              </Link>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2.5 }}>
                                {file.url}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Task Responses Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">응답 목록</Typography>
          {userRole === UserRole.USER && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowResponseDialog(true)}
            >
              응답 작성
            </Button>
          )}
        </Box>
        
        <List>
          {task?.responses?.map((response) => (
            <ListItem
              key={response.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper'
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={response.content}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {response.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(response.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </Typography>
                  </Stack>
                }
              />
              {userRole === UserRole.ADMIN && (
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteResponse(response.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default TaskDetail
