import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material'
import { MoreVertical, Plus, X, Check } from 'lucide-react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult
} from '@hello-pangea/dnd'
import TaskDetailModal from './TaskDetailModal'
import { createTask } from '../../api/task'

interface StageCardProps {
  stage: {
    id: number
    name: string
    order: number
    tasks: {
      id: number
      title: string
      description: string
      order: number
    }[]
  }
  projectId: number
  onUpdateStage?: (stageId: number, title: string) => void
  onDeleteStage?: (stageId: number) => void
  onMoveTask?: (sourceIndex: number, destinationIndex: number, stageId: number) => void
  onAddTask?: (stageId: number, title: string) => void
}

interface TaskItemProps {
  task: {
    id: number
    title: string
    description: string
    order: number
  }
  index: number
  provided: DraggableProvided
  isDragging: boolean
  onClick: () => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, provided, isDragging, onClick }) => {
  return (
    <Box
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      sx={{
        bgcolor: '#FFFBE6',
        borderRadius: 1,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        '&:hover': {
          bgcolor: '#FFF8D6'
        }
      }}>
      <ListItem
        sx={{
          py: 0.5,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
        <ListItemText
          primary={task.title}
          primaryTypographyProps={{
            variant: 'body2',
            sx: {
              fontWeight: 500,
              fontSize: '0.875rem',
              width: '100%',
              wordBreak: 'break-word'
            }
          }}
        />
      </ListItem>
    </Box>
  )
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  projectId,
  onUpdateStage,
  onDeleteStage,
  onMoveTask,
  onAddTask
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(stage.name)
  const [selectedTask, setSelectedTask] = useState<{
    id: number
    title: string
    description: string
    order: number
  } | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleTaskClick = (task: {
    id: number
    title: string
    description: string
    order: number
  }) => {
    setSelectedTask(task)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onUpdateStage && title?.trim() && title !== stage.name) {
      onUpdateStage(stage.id, title)
    }
    setIsEditing(false)
    handleMenuClose()
  }

  const handleCancel = () => {
    setTitle(stage.name)
    setIsEditing(false)
  }

  const handleDeleteStageClick = () => {
    if (onDeleteStage) {
      onDeleteStage(stage.id)
    }
    handleMenuClose()
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onMoveTask) return

    const { source, destination } = result
    onMoveTask(source.index, destination.index, stage.id)
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      // 현재 클릭된 작업 추가 버튼의 인덱스를 찾습니다
      const currentIndex = stage.tasks.findIndex(task => task.id === selectedTask?.id)
      
      // 위아래 작업의 ID를 설정합니다
      const prevTaskId = currentIndex > 0 ? stage.tasks[currentIndex - 1].id : undefined
      const nextTaskId = currentIndex < stage.tasks.length - 1 ? stage.tasks[currentIndex + 1].id : undefined

      const taskData = {
        stageId: stage.id,
        title: newTaskTitle,
        content: newTaskDescription,
        prevTaskId,
        nextTaskId
      }

      const response = await createTask(taskData)
      if (response.status === 'success') {
        // 작업 추가 성공 시 모달 닫기
        setIsAddTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
        // 작업 목록 새로고침
        if (onAddTask) {
          onAddTask(stage.id, newTaskTitle)
        }
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        height: '100%',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100',
        '& .MuiListItem-root': {
          px: 1,
          py: 0.75
        }
      }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        {isEditing ? (
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            fullWidth
            autoFocus
          />
        ) : (
          <Typography variant="h6">{stage.name}</Typography>
        )}
        <Box>
          {isEditing ? (
            <>
              <IconButton onClick={handleSave} size="small">
                <Check />
              </IconButton>
              <IconButton onClick={handleCancel} size="small">
                <X />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertical />
            </IconButton>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>수정</MenuItem>
        <MenuItem onClick={handleDeleteStageClick}>삭제</MenuItem>
      </Menu>

      <Dialog
        open={isEditing}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>단계 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="단계 제목"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>취소</Button>
          <Button onClick={handleSave} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          flexGrow: 1,
          overflowY: 'auto'
        }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId={`stage-${stage.id}`}
            type="TASK">
            {(provided: DroppableProvided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: '50px',
                  pb: 1
                }}>
                {stage.tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <Draggable
                      draggableId={`task-${task.id}`}
                      index={index}>
                      {(providedDraggable: DraggableProvided, snapshot) => (
                        <TaskItem
                          task={task}
                          index={index}
                          provided={providedDraggable}
                          isDragging={snapshot.isDragging}
                          onClick={() => handleTaskClick(task)}
                        />
                      )}
                    </Draggable>
                    <Button
                      onClick={() => {
                        setNewTaskTitle('')
                        setNewTaskDescription('')
                        setIsAddTaskModalOpen(true)
                      }}
                      startIcon={<Plus size={16} />}
                      fullWidth
                      sx={{
                        color: 'text.secondary',
                        justifyContent: 'center',
                        textTransform: 'none',
                        py: 0.5,
                        px: 1,
                        minHeight: '32px',
                        opacity: 0,
                        '&:hover': {
                          opacity: 1
                        }
                      }}>
                    </Button>
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      <Dialog
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>새 작업 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="작업 제목"
            type="text"
            fullWidth
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="작업 설명"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddTaskModalOpen(false)}>취소</Button>
          <Button
            onClick={handleAddTask}
            variant="contained"
            disabled={!newTaskTitle.trim()}>
            추가
          </Button>
        </DialogActions>
      </Dialog>

      <TaskDetailModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        taskId={selectedTask?.id || 0}
        projectId={projectId}
      />
    </Paper>
  )
}

export default StageCard
