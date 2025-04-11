import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import TaskRequestsModal from './TaskRequestsModal'
import { Stage, Task, TaskStatus } from '../../types/project'
import { createTask } from '../../api/task'
import { updateStage, deleteStage } from '../../api/stage'
import { client } from '../../api/client'

interface StageCardProps {
  stage: Stage
  stages: Stage[]
  projectId: number
  isEditMode: boolean
  isDragging: boolean
  onStagesChange?: (stages: Stage[]) => void
  onTaskClick?: (taskId: number) => void
  onStageEdit: (stageId: number, newTitle: string) => Promise<void>
  onStageDelete: (stageId: number) => Promise<void>
  onTaskEdit: (taskId: number, title: string, content: string) => Promise<void>
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  stages,
  projectId,
  isEditMode,
  onStagesChange,
  onStageEdit,
  onStageDelete,
  onTaskEdit
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskContent, setNewTaskContent] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState<null | HTMLElement>(
    null
  )
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<{
    taskId: number
    title: string
    status: string
  } | null>(null)
  const [editedStageTitle, setEditedStageTitle] = useState(stage.title)
  const [editedTaskTitle, setEditedTaskTitle] = useState('')
  const [editedTaskContent, setEditedTaskContent] = useState('')

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleEditClick = () => {
    handleMenuClose()
    setIsEditStageModalOpen(true)
  }

  const handleDeleteClick = async () => {
    try {
      handleMenuClose()
      await deleteStage(stage.id)
      if (onStageDelete) {
        onStageDelete(stage.id)
      }
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const handleEditStage = async () => {
    try {
      await updateStage(stage.id, editedStageTitle)
      if (onStageEdit) {
        onStageEdit(stage.id, editedStageTitle)
      }
      // 현재 스테이지의 title을 업데이트
      const updatedStage = {
        ...stage,
        title: editedStageTitle
      }
      if (onStagesChange) {
        const updatedStages = stages.map(s =>
          s.id === stage.id ? updatedStage : s
        )
        onStagesChange(updatedStages)
      }
      setIsEditStageModalOpen(false)
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleTaskMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    taskId: number
  ) => {
    event.stopPropagation()
    setTaskMenuAnchorEl(event.currentTarget)
    setSelectedTaskId(taskId)
    const task = stage.tasks.find(t => t.id === taskId)
    if (task) {
      setEditedTaskTitle(task.title)
      setEditedTaskContent(task.description)
    }
  }

  const handleTaskMenuClose = () => {
    setTaskMenuAnchorEl(null)
  }

  const handleEditTaskClick = () => {
    console.log('Edit task clicked, selectedTaskId:', selectedTaskId)
    handleTaskMenuClose()
    setIsEditTaskModalOpen(true)
  }

  const handleDeleteTaskClick = async () => {
    handleTaskMenuClose()
    if (!selectedTaskId) return

    try {
      // Optimistic update: 먼저 UI에서 task 제거
      const updatedStage = {
        ...stage,
        tasks: stage.tasks.filter(task => task.id !== selectedTaskId)
      }

      if (onStagesChange) {
        const updatedStages = stages.map(s =>
          s.id === stage.id ? updatedStage : s
        )
        onStagesChange(updatedStages)
      }

      // API 호출
      await client.delete(`/tasks/${selectedTaskId}`)
    } catch (error) {
      console.error('Failed to delete task:', error)
      // 실패 시 원래 상태로 복구
      if (onStagesChange) {
        onStagesChange(stages)
      }
      alert('작업 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleEditTask = async () => {
    console.log('handleEditTask called, selectedTaskId:', selectedTaskId)
    if (!selectedTaskId) {
      console.log('No selected task ID')
      return
    }

    try {
      console.log(
        'Editing task:',
        selectedTaskId,
        editedTaskTitle,
        editedTaskContent
      )

      // Optimistic update: 먼저 UI에서 task 수정
      const updatedStage = {
        ...stage,
        tasks: stage.tasks.map(task =>
          task.id === selectedTaskId
            ? {
                ...task,
                title: editedTaskTitle,
                description: editedTaskContent
              }
            : task
        )
      }

      if (onStagesChange) {
        const updatedStages = stages.map(s =>
          s.id === stage.id ? updatedStage : s
        )
        onStagesChange(updatedStages)
      }

      // API 호출
      console.log(
        'Calling onTaskEdit with:',
        selectedTaskId,
        editedTaskTitle,
        editedTaskContent
      )
      await onTaskEdit(selectedTaskId, editedTaskTitle, editedTaskContent)
      setIsEditTaskModalOpen(false)
      setSelectedTaskId(null) // 수정 완료 후 초기화
    } catch (error) {
      console.error('Failed to update task:', error)
      // 실패 시 원래 상태로 복구
      if (onStagesChange) {
        onStagesChange(stages)
      }
      alert('작업 수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      // Optimistic update: 먼저 UI에 task 추가
      const newTask: Task = {
        id: Date.now(), // 임시 ID
        title: newTaskTitle,
        description: newTaskContent,
        status: 'TODO' as TaskStatus,
        order: selectedPosition || 0,
        stageId: stage.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requests: []
      }

      const updatedStage = {
        ...stage,
        tasks: [
          ...stage.tasks.slice(0, selectedPosition || 0),
          newTask,
          ...stage.tasks.slice(selectedPosition || 0)
        ]
      }

      if (onStagesChange) {
        const updatedStages = stages.map(s =>
          s.id === stage.id ? updatedStage : s
        )
        onStagesChange(updatedStages)
      }

      // API 호출
      const response = await createTask({
        stageId: stage.id,
        title: newTaskTitle,
        content: newTaskContent,
        prevTaskId:
          selectedPosition && selectedPosition > 0
            ? stage.tasks[selectedPosition - 1]?.id
            : undefined,
        nextTaskId:
          selectedPosition && selectedPosition < stage.tasks.length
            ? stage.tasks[selectedPosition]?.id
            : undefined
      })

      // API 응답으로 실제 task로 교체
      const actualTask: Task = {
        id: response.id,
        title: response.title,
        description: response.description,
        status: response.status,
        order: response.order,
        stageId: response.stageId,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        requests: response.requests
      }

      const finalUpdatedStage = {
        ...stage,
        tasks: [
          ...stage.tasks.slice(0, selectedPosition || 0),
          actualTask,
          ...stage.tasks.slice(selectedPosition || 0)
        ]
      }

      if (onStagesChange) {
        const finalUpdatedStages = stages.map(s =>
          s.id === stage.id ? finalUpdatedStage : s
        )
        onStagesChange(finalUpdatedStages)
      }

      setNewTaskTitle('')
      setNewTaskContent('')
      setSelectedPosition(null)
      setIsAddTaskModalOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
      // 에러 발생 시 optimistic update 롤백
      if (onStagesChange) {
        onStagesChange(stages)
      }
      alert('작업 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleAddTaskClick = (position: number) => {
    const prevTask = stage.tasks[position - 1]
    const nextTask = stage.tasks[position]

    console.log('Surrounding tasks:', {
      prevTaskId: prevTask?.id,
      nextTaskId: nextTask?.id
    })

    setSelectedPosition(position)
    setIsAddTaskModalOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    if (!isEditMode) {
      setSelectedTask({
        taskId: task.id,
        title: task.title,
        status: task.status
      })
      setIsRequestModalOpen(true)
    }
  }

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          width: 250,
          height: 400,
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}>
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <Typography variant="h6">{stage.title}</Typography>
            {isEditMode && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}>
                <MoreVertical size={16} />
              </IconButton>
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary">
            {stage.tasks.length}개의 작업
          </Typography>
        </Box>

        <Droppable
          droppableId={`stage-${stage.id}`}
          type="task">
          {provided => (
            <List
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555'
                }
              }}>
              {isEditMode && (
                <Box
                  key="add-task-top"
                  onMouseEnter={() => setHoveredTaskIndex(0)}
                  onMouseLeave={() => setHoveredTaskIndex(null)}
                  sx={{
                    height: '16px',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'height 0.2s ease',
                    '&:hover': {
                      height: '40px'
                    }
                  }}>
                  {hoveredTaskIndex === 0 && (
                    <Button
                      sx={{
                        minWidth: '32px',
                        width: '32px',
                        height: '32px',
                        p: 0,
                        borderRadius: '50%',
                        backgroundColor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleAddTaskClick(0)}>
                      <Plus size={20} />
                    </Button>
                  )}
                </Box>
              )}
              {stage.tasks.map((task, index) => (
                <React.Fragment key={`task-${task.id}`}>
                  <Draggable
                    draggableId={`task-${task.id}`}
                    index={index}
                    isDragDisabled={!isEditMode}>
                    {provided => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: isEditMode ? 'grab' : 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          },
                          mb: isEditMode ? 0.5 : 0.5
                        }}
                        onClick={() => {
                          if (!isEditMode) {
                            setSelectedTaskId(task.id)
                            handleTaskClick(task)
                          }
                        }}>
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              gutterBottom>
                              {task.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              {task.description}
                            </Typography>
                          </Box>
                          {isEditMode && (
                            <IconButton
                              size="small"
                              sx={{ ml: 1, mt: -0.5 }}
                              onClick={e => handleTaskMenuOpen(e, task.id)}>
                              <MoreVertical size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </ListItem>
                    )}
                  </Draggable>
                  {isEditMode && (
                    <Box
                      key={`add-task-${index}`}
                      onMouseEnter={() => setHoveredTaskIndex(index + 1)}
                      onMouseLeave={() => setHoveredTaskIndex(null)}
                      sx={{
                        height: '8px',
                        mb: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'height 0.2s ease',
                        '&:hover': {
                          height: '32px'
                        }
                      }}>
                      {hoveredTaskIndex === index + 1 && (
                        <Button
                          sx={{
                            minWidth: '28px',
                            width: '28px',
                            height: '28px',
                            p: 0,
                            borderRadius: '50%',
                            backgroundColor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleAddTaskClick(index + 1)}>
                          <Plus size={18} />
                        </Button>
                      )}
                    </Box>
                  )}
                </React.Fragment>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}>
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <Pencil size={16} />
            </ListItemIcon>
            <ListItemText>수정</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Trash2 size={16} />
            </ListItemIcon>
            <ListItemText>삭제</ListItemText>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={taskMenuAnchorEl}
          open={Boolean(taskMenuAnchorEl)}
          onClose={handleTaskMenuClose}>
          <MenuItem onClick={handleEditTaskClick}>
            <ListItemIcon>
              <Pencil size={16} />
            </ListItemIcon>
            <ListItemText>수정</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteTaskClick}>
            <ListItemIcon>
              <Trash2 size={16} />
            </ListItemIcon>
            <ListItemText>삭제</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={isEditStageModalOpen}
          onClose={() => setIsEditStageModalOpen(false)}>
          <DialogTitle>스테이지 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="스테이지 제목"
              fullWidth
              value={editedStageTitle}
              onChange={e => setEditedStageTitle(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditStageModalOpen(false)}>취소</Button>
            <Button
              onClick={handleEditStage}
              variant="contained">
              수정
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}>
          <DialogTitle>작업 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="작업 제목"
              fullWidth
              value={editedTaskTitle}
              onChange={e => setEditedTaskTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="작업 내용"
              fullWidth
              multiline
              rows={4}
              value={editedTaskContent}
              onChange={e => setEditedTaskContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditTaskModalOpen(false)}>취소</Button>
            <Button
              onClick={handleEditTask}
              variant="contained">
              수정
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isAddTaskModalOpen}
          onClose={() => {
            setIsAddTaskModalOpen(false)
            setSelectedPosition(null)
          }}>
          <DialogTitle>작업 추가</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="작업 제목"
              fullWidth
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="작업 내용"
              fullWidth
              multiline
              rows={4}
              value={newTaskContent}
              onChange={e => setNewTaskContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsAddTaskModalOpen(false)
                setSelectedPosition(null)
              }}>
              취소
            </Button>
            <Button
              onClick={handleAddTask}
              variant="contained">
              추가
            </Button>
          </DialogActions>
        </Dialog>

        <TaskRequestsModal
          open={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false)
            setSelectedTask(null)
          }}
          task={selectedTask}
          projectId={projectId}
          stageId={stage.id}
        />
      </Paper>
    </>
  )
}

export default StageCard
