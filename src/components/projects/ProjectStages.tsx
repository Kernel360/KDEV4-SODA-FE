import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided
} from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import type { Stage } from '../../types/stage'
import type { Task } from '../../types/task'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import AddStageModal from './AddStageModal'
import StageCard from './StageCard'

interface ProjectStagesProps {
  projectId: number
}

interface StageWithTasks extends Stage {
  tasks: Task[]
}

const ProjectStages: React.FC<ProjectStagesProps> = ({ projectId }) => {
  const [stages, setStages] = useState<StageWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(
    null
  )

  useEffect(() => {
    const fetchStagesAndTasks = async () => {
      try {
        // Fetch stages
        const stagesData = await projectService.getProjectStages(projectId)

        // Fetch tasks for each stage
        const stagesWithTasks = await Promise.all(
          stagesData.map(async stage => {
            const tasks = await projectService.getStageTasks(stage.id)
            return { ...stage, tasks: tasks || [] } // tasks가 undefined일 경우 빈 배열로 초기화
          })
        )

        setStages(stagesWithTasks)
      } catch (err) {
        setError('단계 및 작업 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStagesAndTasks()
  }, [projectId])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStages(items)
  }

  const handleAddStage = (index: number) => {
    setSelectedStageIndex(index)
    setIsAddStageModalOpen(true)
  }

  const handleAddStageSubmit = (name: string) => {
    if (selectedStageIndex === null) return

    const newStage: StageWithTasks = {
      id: Math.max(...stages.map(s => s.id)) + 1,
      name,
      stageOrder: selectedStageIndex + 1,
      tasks: [] // 새로 추가된 스테이지는 빈 tasks 배열로 초기화
    }

    const updatedStages = [
      ...stages.slice(0, selectedStageIndex),
      newStage,
      ...stages.slice(selectedStageIndex)
    ].map((stage, index) => ({
      ...stage,
      stageOrder: index + 1
    }))

    setStages(updatedStages)
    setIsAddStageModalOpen(false)
    setSelectedStageIndex(null)
  }

  const handleUpdateStage = (stageId: number, title: string) => {
    const updatedStages = stages.map(stage =>
      stage.id === stageId ? { ...stage, title } : stage
    )
    setStages(updatedStages)
  }

  const handleDeleteStage = (stageId: number) => {
    const updatedStages = stages
      .filter(stage => stage.id !== stageId)
      .map((stage, index) => ({
        ...stage,
        order: index + 1
      }))
    setStages(updatedStages)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
        <Typography variant="h6">단계</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}>
          단계 추가
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages">
          {(provided: DroppableProvided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2
              }}>
              {stages.map((stage, index) => (
                <Draggable
                  key={stage.id}
                  draggableId={stage.id.toString()}
                  index={index}>
                  {(provided: DraggableProvided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        minWidth: 300,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        p: 2,
                        boxShadow: 1
                      }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2 }}>
                        {stage.name}
                      </Typography>
                      {stage.tasks &&
                        stage.tasks.map(task => (
                          <Card
                            key={task.taskId}
                            sx={{ mb: 1 }}>
                            <CardContent>
                              <Typography variant="subtitle2">
                                {task.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                {task.content}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <AddStageModal
        open={isAddStageModalOpen}
        onClose={() => {
          setIsAddStageModalOpen(false)
          setSelectedStageIndex(null)
        }}
        onSubmit={handleAddStageSubmit}
      />
    </Box>
  )
}

export default ProjectStages
