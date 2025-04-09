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
  Chip
} from '@mui/material'
import { MoreVertical, Edit, Plus, Trash2 } from 'lucide-react'
import type { Stage, Task, TaskStatus } from '../../types/stage'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult // Import DropResult for handleDragEnd type
} from '@hello-pangea/dnd'
// import { getTaskRequests } from '../../api/task' // Removed as call is moved or handled inside modal
// Removed unused TaskRequest and TaskRequestsResponse types from import
import type { ProjectStageTask } from '../../types/api'

interface StageCardProps {
  stage: Stage
  projectId: number
  onUpdateStage?: (stageId: number, title: string) => void
  onDeleteStage?: (stageId: number) => void
  // Correctly type the onMoveTask callback arguments if needed, based on DropResult
  onMoveTask?: (
    sourceIndex: number,
    destinationIndex: number,
    stageId: number
  ) => void
}

// TaskItem component remains the same
const TaskItem: React.FC<{
  task: Task
  index: number
  provided: DraggableProvided
  isDragging: boolean
  onClick: () => void
}> = ({ task, provided, isDragging, onClick }) => {
  const getStatusColor = (
    status: TaskStatus
  ): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      case 'WAITING_APPROVAL': // Assuming this maps to warning
        return 'warning'
      case 'PENDING': // Assuming this maps to default
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
        bgcolor: '#FFFBE6', // Consider theme-based color
        borderRadius: 1,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        '&:hover': {
          bgcolor: '#FFF8D6' // Consider theme-based hover color
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
            sx: {
              fontWeight: 500,
              fontSize: '0.75rem',
              width: '100%',
              wordBreak: 'break-word'
            } // Prevent overflow
          }}
        />
        <Chip
          label={task.status} // Consider mapping status to Korean or user-friendly text
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
  const [, setIsAddTaskModalOpen] = useState(false)
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false)
  const [, setSelectedTask] = useState<ProjectStageTask | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [newTitle, setNewTitle] = useState(stage.name)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  // Removed async and API call from here
  const handleTaskClick = (task: Task) => {
    // Construct the ProjectStageTask object with all required fields
    const projectStageTask: ProjectStageTask = {
      taskId: task.id,
      title: task.title,
      content: task.description || '', // Add default empty string for content
      taskOrder: task.taskOrder ?? 0, // Use nullish coalescing for default 0
      status: task.status,
      projectId: projectId,
      stageId: stage.id,
      links: [], // Add missing 'links' property with default value
      files: [] // Add missing 'files' property with default value
    }
    setSelectedTask(projectStageTask) // Set state with the correctly typed object
  }

  // Handles opening the Add Task modal (actual task creation is handled by the modal's onSubmit)
  const openAddTaskModal = () => {
    setIsAddTaskModalOpen(true)
    handleMenuClose() // Close stage menu if open
  }

  const handleEditTitleSubmit = () => {
    if (onUpdateStage && newTitle && newTitle !== stage.name) {
      onUpdateStage(stage.id, newTitle)
    }
    setIsEditTitleModalOpen(false)
    handleMenuClose()
  }

  const handleDeleteStageClick = () => {
    // Optional: Add confirmation dialog here
    if (onDeleteStage) {
      onDeleteStage(stage.id)
    }
    handleMenuClose()
  }

  // Type the result using DropResult
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Dropped outside the list or didn't move
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return
    }

    // Ensure it's dropped within the same stage's droppable
    // (Cross-stage D&D would require different logic, likely handled in the parent board component)
    if (source.droppableId === destination.droppableId && onMoveTask) {
      onMoveTask(source.index, destination.index, stage.id)
    }
  }

  return (
    <Paper
      elevation={1} // Add subtle shadow
      sx={{
        p: 1.5,
        height: '100%',
        minHeight: '200px', // Adjust as needed
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100', // Lighter background for stage
        '& .MuiListItem-root': {
          // Base styles for list items (overridden by TaskItem)
          px: 1,
          py: 0.75
        }
      }}>
      {/* Stage Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          px: 0.5 // Add some padding to header
        }}>
        <Typography
          variant="subtitle1" // Slightly larger title
          sx={{ fontWeight: 600, flexGrow: 1, mr: 1, wordBreak: 'break-word' }}>
          {stage.name}
        </Typography>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label="Stage options"
          sx={{
            color: 'text.secondary',
            p: 0.5
          }}>
          <MoreVertical size={16} /> {/* Slightly larger icon */}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem', // Consistent font size
              py: 0.75,
              minHeight: 'auto',
              '& .MuiListItemIcon-root': {
                // Style icon
                minWidth: 'auto',
                marginRight: 1,
                color: 'text.secondary'
              }
            }
          }}>
          <MenuItem
            onClick={() => {
              setNewTitle(stage.name) // Reset title on open
              setIsEditTitleModalOpen(true)
              handleMenuClose()
            }}>
            <ListItemIcon>
              <Edit size={14} />
            </ListItemIcon>
            이름 수정
          </MenuItem>
          <MenuItem onClick={handleDeleteStageClick}>
            <ListItemIcon>
              <Trash2 size={14} />
            </ListItemIcon>
            단계 삭제
          </MenuItem>
        </Menu>
      </Box>

      {/* Task List Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0, // Gap is handled by Droppable/Draggable spacing/margins if needed
          flexGrow: 1,
          overflowY: 'auto' // Allow scrolling if tasks exceed height
          // Add some padding to scroll area if needed
          // mx: -1.5, // Counteract Paper padding if scrollbar appears inside
          // px: 1.5,
        }}>
        {/* Top Add Button Placeholder (optional, consider a dedicated button) */}
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button onClick={openAddTaskModal} sx={{...}}> <Plus size={14} /> </Button>
        </Box> */}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId={`stage-${stage.id}`}
            type="TASK">
            {/* Add type */}
            {(provided: DroppableProvided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1, // Add gap between tasks
                  minHeight: '50px', // Ensure droppable area exists even when empty
                  pb: 1 // Padding at the bottom
                }}>
                {stage.tasks.map((task, index) => (
                  <Draggable
                    key={task.id} // Use task.id which should be unique
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
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      {/* Add Task Button at the bottom */}
      <Button
        onClick={openAddTaskModal}
        startIcon={<Plus size={16} />}
        fullWidth
        sx={{
          mt: 1.5,
          color: 'text.secondary',
          justifyContent: 'flex-start',
          textTransform: 'none'
        }}>
        작업 추가
      </Button>

      {/* Edit Stage Title Dialog */}
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
            variant="outlined" // Explicitly set variant
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditTitleModalOpen(false)}>취소</Button>
          <Button
            onClick={handleEditTitleSubmit}
            variant="contained"
            disabled={!newTitle.trim() || newTitle === stage.name}>
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Modal */}
      {/* <AddTaskModal
        open={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        stageId={stage.id} // Pass stageId to the modal
        projectId={projectId} // Pass projectId if needed by the modal/API
        onSubmit={taskData => {
          // The actual API call to add the task should happen inside AddTaskModal's submit logic.
          // Here, you might trigger a refresh of the stage data via a callback prop if needed.
          console.log(
            'Task creation triggered for stage:',
            stage.id,
            'Data:',
            taskData
          ) // Placeholder
          setIsAddTaskModalOpen(false)
          // Example: onTaskAdded?.(stage.id); // Callback to parent to refetch data
        }}
      /> */}

      {/* Task Details/Requests Modal */}
    </Paper>
  )
}

export default StageCard
