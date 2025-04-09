import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Chip,
  Stack,
  Link,
  Paper
} from '@mui/material'
import { Trash2, Edit2, Link as LinkIcon, FileText } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import {
  deleteTaskResponse,
  getTaskResponses // <<-- 이 함수가 필요합니다 (api/task.ts에 정의되어 있다고 가정)
} from '../../api/task'
import type { TaskResponse } from '../../types/api' // ApiResponse 타입 추가 가정
import type { CreateTaskResponseRequest } from '../../api/task'

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
  const [responses, setResponses] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setIsCreating] = useState(false)
  // setNewResponse 제거
  // const [newResponse] = useState<CreateTaskResponseRequest>({
  //   content: '',
  //   links: []
  // })
  const [, setIsEditing] = useState(false)
  const [, setEditForm] = useState<CreateTaskResponseRequest>({
    content: '',
    links: []
  })
  const [, setSelectedResponse] = useState<TaskResponse | null>(null)
  const { showToast } = useToast() // useToast 사용

  // 답변 목록 불러오기 Effect 추가
  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // getTaskResponses 함수가 ApiResponse<TaskResponse[]> 를 반환한다고 가정
        const response = await getTaskResponses(taskId)
        if (response.status === 'success' && response.data) {
          setResponses(response.data)
        } else {
          setError(response.message || '답변 목록을 불러오는데 실패했습니다.')
          setResponses([]) // 에러 발생 시 목록 비우기
        }
      } catch (err) {
        setError('답변 목록 로딩 중 오류가 발생했습니다.')
        setResponses([]) // 에러 발생 시 목록 비우기
        console.error(err) // 콘솔에 에러 로그 출력
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      fetchResponses()
    }
  }, [taskId]) // taskId가 변경될 때마다 다시 불러옴

  const handleEditClick = (response: TaskResponse) => {
    setSelectedResponse(response)
    setIsEditing(true)
    setEditForm({
      content: response.content,
      links: response.links.map(link => ({
        urlAddress: link.urlAddress,
        urlDescription: link.urlDescription || '' // Ensure description is string or empty string
      }))
      // file handling for edit would be more complex, omitted for brevity
    })
  }

  // const handleEditModalClose = () => {
  //   setIsEditing(false)
  //   setSelectedResponse(null)
  //   setEditForm({
  //     content: '',
  //     links: []
  //   })
  // }

  // async/await 및 에러 핸들링 추가
  // const handleEditSubmit = async () => {
  //   if (!selectedResponse) return

  //   try {
  //     // updateTaskResponse가 ApiResponse를 반환한다고 가정
  //     // const response = await updateTaskResponse(selectedResponse.responseId, {
  //     //   comment: data.content,
  //     //   // projectId: taskId, // 백엔드 API 디자인에 따라 필요할 수도 있음
  //     //   links: data.links || []
  //     //   // files: data.files || [] // 파일 수정 로직 추가 필요
  //     // })
  //     // if (response.status === 'success') {
  //     //   showToast('답변이 수정되었습니다.', 'success')
  //     //   handleEditModalClose()
  //     //   onResponseUpdated?.() // 부모 컴포넌트에 알림 (리프레시 등)
  //     //   // Optionally update local state directly instead of full refresh via parent
  //     //   // setResponses(prev => prev.map(r => r.responseId === selectedResponse.responseId ? { ...r, ...response.data } : r));
  //     // } else {
  //     //   showToast(response.message || '답변 수정에 실패했습니다.', 'error')
  //     // }
  //   } catch (err) {
  //     showToast('답변 수정 중 오류가 발생했습니다.', 'error')
  //     console.error(err)
  //   }
  //   // handleEditModalClose() // try/catch 후 finally 또는 각 경로에서 호출
  // }

  // async/await 및 에러 핸들링 추가
  const handleDeleteResponse = async (responseId: number) => {
    // Optional: Add confirmation dialog here
    // if (!window.confirm('정말로 이 답변을 삭제하시겠습니까?')) return;

    try {
      // deleteTaskResponse가 ApiResponse를 반환한다고 가정
      const response = await deleteTaskResponse(responseId)
      if (response.status === 'success') {
        showToast('답변이 삭제되었습니다.', 'success')
        onResponseDeleted?.() // 부모 컴포넌트에 알림
        // Optionally update local state directly
        // setResponses(prev => prev.filter(r => r.responseId !== responseId));
      } else {
        showToast(response.message || '답변 삭제에 실패했습니다.', 'error')
      }
    } catch (err) {
      showToast('답변 삭제 중 오류가 발생했습니다.', 'error')
      console.error(err)
    }
  }

  // async/await 및 에러 핸들링 추가
  // const handleCreateSubmit = async (data: CreateTaskResponseRequest) => {
  //   try {
  //     // createTaskResponse가 ApiResponse<TaskResponse> 를 반환한다고 가정
  //     const response = await createTaskResponse(taskId, data)
  //     if (response.status === 'success') {
  //       showToast('답변이 작성되었습니다.', 'success')
  //       setIsCreating(false)
  //       onResponseAdded?.() // 부모 컴포넌트에 알림
  //       // Optionally update local state directly
  //       // if (response.data) {
  //       //   setResponses(prev => [...prev, response.data]);
  //       // }
  //     } else {
  //       showToast(response.message || '답변 작성에 실패했습니다.', 'error')
  //     }
  //   } catch (err) {
  //     showToast('답변 작성 중 오류가 발생했습니다.', 'error')
  //     console.error(err)
  //   }
  // }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography variant="h6">답변 목록</Typography>
        <Button
          variant="contained"
          onClick={() => setIsCreating(true)}
          startIcon={<Edit2 size={20} />}>
          답변 작성
        </Button>
      </Box>

      {/* 로딩 및 에러 상태 표시 */}
      {isLoading && <Typography>답변 목록 로딩 중...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!isLoading && !error && responses.length === 0 && (
        <Typography color="text.secondary">
          아직 작성된 답변이 없습니다.
        </Typography>
      )}

      {/* 답변 목록 렌더링 */}
      {!isLoading && !error && responses.length > 0 && (
        <List>
          {responses.map(response => (
            <ListItem
              key={response.responseId}
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
                  {' '}
                  {/* 내용 영역이 늘어나도록 */}
                  {/* content를 pre-wrap으로 처리하여 줄바꿈 유지 */}
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                    {response.content}
                  </Typography>
                  {/* 링크 표시 */}
                  {response.links && response.links.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 1, flexWrap: 'wrap' }}>
                      {' '}
                      {/* 링크 많을 시 줄바꿈 */}
                      {response.links.map(link => (
                        <Chip
                          key={link.linkId}
                          icon={<LinkIcon size={16} />}
                          label={link.urlDescription || link.urlAddress}
                          size="small"
                          component="a"
                          href={link.urlAddress}
                          target="_blank"
                          clickable
                          sx={{ maxWidth: '100%' }} // 긴 링크 잘림 방지
                        />
                      ))}
                    </Stack>
                  )}
                  {/* 파일 개수 표시 (개별 파일 표시는 아래) */}
                  {response.files && response.files.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}>
                      첨부파일: {response.files.length}개
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary">
                    작성일: {new Date(response.createdAt).toLocaleString()}
                  </Typography>
                  {/* 개별 파일 목록 표시 */}
                  {response.files && response.files.length > 0 && (
                    <Box sx={{ mt: 1, width: '100%' }}>
                      {response.files.map(file => (
                        <Box
                          key={file.fileId}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5 // 간격 줄임
                          }}>
                          <FileText
                            size={14} // 아이콘 크기 약간 줄임
                            style={{ marginRight: 6, flexShrink: 0 }} // 아이콘 안 줄어들게
                          />
                          <Link
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2" // 파일 이름 폰트 크기 약간 줄임
                            sx={{
                              textDecoration: 'none',
                              wordBreak: 'break-all', // 긴 파일명 줄바꿈
                              display: 'inline-block'
                            }}>
                            {file.fileName}
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
                {/* 수정/삭제 버튼 영역 */}
                <Box sx={{ flexShrink: 0 }}>
                  {' '}
                  {/* 버튼 영역 안 줄어들게 */}
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(response)}
                    aria-label="Edit response"
                    sx={{ mr: 0.5 }}>
                    {' '}
                    {/* 간격 약간 줄임 */}
                    <Edit2 size={18} /> {/* 아이콘 크기 약간 줄임 */}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteResponse(response.responseId)}
                    aria-label="Delete response">
                    <Trash2 size={18} /> {/* 아이콘 크기 약간 줄임 */}
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {/* 생성 모달 */}
      {/* <TaskResponseModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreateSubmit} // 수정된 핸들러 연결
        initialData={newResponse}
        mode="create"
        taskId={taskId} // taskId 전달 (파일 업로드 등에 필요할 수 있음)
      />

      {/* 수정 모달 */}
      {/* <TaskResponseModal
        open={isEditing}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit} // 수정된 핸들러 연결
        initialData={editForm}
        mode="edit"
        taskId={taskId} // taskId 전달
        responseId={selectedResponse?.responseId} // responseId 전달
      /> */}
    </Paper>
  )
}

export default TaskResponseList
