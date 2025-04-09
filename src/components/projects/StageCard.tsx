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
  Button,
  ListItemIcon,
  Chip,
  Stack,
  Tooltip,
  Badge
} from '@mui/material'
import {
  MoreVertical,
  Edit,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { Stage, Task, TaskStatus } from '../../types/stage'
import TaskRequestsModal from './TaskRequestsModal'
import AddTaskModal from './AddTaskModal'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided
} from '@hello-pangea/dnd'
import { getTaskRequests } from '../../api/task'
import type { TaskRequest, TaskRequestsResponse, ProjectStageTask } from '../../types/api'

interface StageCardProps {
  stage: Stage
  projectId: number
  onUpdateStage?: (stageId: number, title: string) => void
  onDeleteStage?: (stageId: number) => void
  onMoveTask?: (dragIndex: number, hoverIndex: number, stageId: number) => void
}

const TaskItem: React.FC<{
  task: Task
  index: number
  provided: DraggableProvided
  isDragging: boolean
  onClick: () => void
}> = ({ task, provided, isDragging, onClick }) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      case 'WAITING_APPROVAL':
        return 'warning'
      case 'PENDING':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Box
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      sx={{
        bgcolor: '#FFFBE6',
        borderRadius: 1,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          bgcolor: '#FFF8D6'
        }
      }}>
      <ListItem
        onClick={onClick}
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
            sx: { fontWeight: 500, fontSize: '0.75rem' }
          }}
        />
        <Chip
          label={task.status}
          color={getStatusColor(task.status)}
          size="small"
          sx={{
            mt: 0.5,
            height: '20px',
            '& .MuiChip-label': {
              px: '8px',
              fontSize: '0.65rem'
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
  onMoveTask
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ProjectStageTask | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [newTitle, setNewTitle] = useState(stage.title)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleTaskClick = async (task: Task) => {
    try {
      const projectStageTask: ProjectStageTask = {
        taskId: task.id,
        title: task.title,
        content: task.description,
        taskOrder: task.taskOrder || 0,
        status: task.status,
        projectId: projectId,
        stageId: stage.id
      }
      setSelectedTask(projectStageTask)

      const response = await getTaskRequests(task.id)
      if (response.status === 'success' && Array.isArray(response.data)) {
        console.log('Fetched requests:', response.data)
      }
    } catch (error) {
      console.error('요청 목록을 불러오는 중 오류가 발생했습니다:', error)
    }
  }

  const handleAddTask = (
    position: number,
    task?: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    // TODO: API 호출로 대체
    console.log('Add task at position:', position, 'task:', task)
    setIsAddTaskModalOpen(true)
    handleMenuClose()
  }

  const handleEditTitle = () => {
    if (onUpdateStage) {
      onUpdateStage(stage.id, newTitle)
    }
    setIsEditTitleModalOpen(false)
    handleMenuClose()
  }

  const handleDeleteStage = () => {
    if (onDeleteStage) {
      onDeleteStage(stage.id)
    }
    handleMenuClose()
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    onMoveTask?.(result.source.index, result.destination.index, stage.id)
  }

  return (
    <Paper
      sx={{
        p: 1.5,
        height: '100%',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiListItem-root': {
          px: 1,
          py: 0.75
        }
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5
        }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 500 }}>
          {stage.title}
        </Typography>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          sx={{
            color: 'text.secondary',
            p: 0.5,
            mr: -0.5
          }}>
          <MoreVertical size={14} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiMenuItem-root': {
              py: 0.75,
              minHeight: 'auto'
            }
          }}>
          <MenuItem
            onClick={() => {
              setIsEditTitleModalOpen(true)
              handleMenuClose()
            }}>
            <ListItemIcon>
              <Edit size={14} />
            </ListItemIcon>
            <ListItemText>수정</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteStage}>
            <ListItemIcon>
              <Trash2 size={14} />
            </ListItemIcon>
            <ListItemText>삭제</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          flexGrow: 1
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
          <Button
            onClick={() => handleAddTask(0)}
            sx={{
              width: '100%',
              color: 'text.secondary',
              py: 0.25,
              minWidth: 'auto',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
                opacity: 1
              }
            }}>
            <Plus size={14} />
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`stage-${stage.id}`}>
            {(provided: DroppableProvided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0
                }}>
                {stage.tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <Draggable
                      draggableId={`task-${task.id}`}
                      index={index}>
                      {(provided: DraggableProvided, snapshot) => (
                        <TaskItem
                          task={task}
                          index={index}
                          provided={provided}
                          isDragging={snapshot.isDragging}
                          onClick={() => handleTaskClick(task)}
                        />
                      )}
                    </Draggable>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                      }}>
                      <Button
                        onClick={() => handleAddTask(index + 1)}
                        sx={{
                          width: '100%',
                          color: 'text.secondary',
                          py: 0.25,
                          minWidth: 'auto',
                          opacity: 0,
                          transition: 'opacity 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            opacity: 1
                          }
                        }}>
                        <Plus size={14} />
                      </Button>
                    </Box>
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      <Dialog
        open={isEditTitleModalOpen}
        onClose={() => setIsEditTitleModalOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>단계 이름 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="단계 이름을 입력하세요"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditTitleModalOpen(false)}>취소</Button>
          <Button
            onClick={handleEditTitle}
            variant="contained"
            disabled={!newTitle || newTitle === stage.title}>
            수정
          </Button>
        </DialogActions>
      </Dialog>

      <AddTaskModal
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={task => {
          handleAddTask(stage.tasks.length, task)
          setIsAddTaskModalOpen(false)
        }}
      />

      {selectedTask && (
        <TaskRequestsModal
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          stageId={stage.id}
        />
      )}
    </Paper>
  )
}

export default StageCard
