import React, { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided
} from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import type { Stage } from '../../types/stage'
import AddStageModal from './AddStageModal'
import StageCard from './StageCard'
import { client } from '../../api/client'

interface ProjectStagesProps {
  projectId: number
}

const ProjectStages: React.FC<ProjectStagesProps> = ({ projectId }) => {
  const [stages, setStages] = useState<Stage[]>([])
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchStages()
  }, [projectId])

  const fetchStages = async () => {
    try {
      const response = await client.get(`http://localhost:8080/projects/${projectId}/stages`)
      if (response.data.status === 'success') {
        setStages(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stages:', error)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    setStages(updatedItems)

    try {
      await client.put(`/projects/${projectId}/stages/order`, {
        stages: updatedItems.map(stage => ({
          id: stage.id,
          order: stage.order
        }))
      })
    } catch (error) {
      console.error('Failed to update stage order:', error)
      // Revert changes if API call fails
      fetchStages()
    }
  }

  const handleAddStage = (index: number) => {
    setSelectedStageIndex(index)
    setIsAddStageModalOpen(true)
  }

  const handleAddStageSubmit = async (name: string) => {
    if (selectedStageIndex === null) return

    try {
      const response = await client.post(`/projects/${projectId}/stages`, {
        name,
        order: selectedStageIndex + 1
      })

      if (response.data.status === 'success') {
        const newStage = response.data.data
        const updatedStages = [
          ...stages.slice(0, selectedStageIndex),
          newStage,
          ...stages.slice(selectedStageIndex)
        ].map((stage, index) => ({
          ...stage,
          order: index + 1
        }))

        setStages(updatedStages)
      }
    } catch (error) {
      console.error('Failed to add stage:', error)
    }

    setIsAddStageModalOpen(false)
    setSelectedStageIndex(null)
  }

  const handleUpdateStage = async (stageId: number, name: string) => {
    try {
      const response = await client.put(`/projects/${projectId}/stages/${stageId}`, {
        name
      })

      if (response.data.status === 'success') {
        const updatedStages = stages.map(stage =>
          stage.id === stageId ? { ...stage, name } : stage
        )
        setStages(updatedStages)
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleDeleteStage = async (stageId: number) => {
    try {
      const response = await client.delete(`/projects/${projectId}/stages/${stageId}`)

      if (response.data.status === 'success') {
        const updatedStages = stages
          .filter(stage => stage.id !== stageId)
          .map((stage, index) => ({
            ...stage,
            order: index + 1
          }))
        setStages(updatedStages)
      }
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const handleMoveTask = async (taskId: number, fromStageId: number, toStageId: number) => {
    try {
      const response = await client.put(`/projects/${projectId}/stages/${fromStageId}/tasks/${taskId}/move`, {
        toStageId
      })

      if (response.data.status === 'success') {
        // 서버에서 업데이트된 stages를 받아와서 상태를 업데이트
        fetchStages()
      }
    } catch (error) {
      console.error('Failed to move task:', error)
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          프로젝트 단계
        </Typography>
        <Typography variant="body2" color="text.secondary">
          각 단계를 드래그하여 순서를 변경할 수 있습니다
        </Typography>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                gap: 0,
                overflowX: 'auto',
                pb: 2,
                '& > .stage-container': {
                  minWidth: '200px',
                  maxWidth: '200px'
                },
                '& > .add-stage-container': {
                  minWidth: '20px',
                  maxWidth: '20px'
                }
              }}>
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  {index > 0 && (
                    <Box
                      className="add-stage-container"
                      sx={{
                        position: 'relative',
                        alignSelf: 'stretch',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <Button
                        className="add-stage-button"
                        onClick={() => handleAddStage(index)}
                        sx={{
                          position: 'relative',
                          minWidth: 'auto',
                          width: '16px',
                          height: '16px',
                          p: 0,
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          borderRadius: '50%',
                          zIndex: 1,
                          opacity: 0,
                          transition: 'opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            opacity: 1
                          }
                        }}>
                        <Plus size={12} />
                      </Button>
                    </Box>
                  )}
                  <Box className="stage-container">
                    <Draggable draggableId={String(stage.id)} index={index}>
                      {(provided: DraggableProvided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ px: 0.5 }}>
                          <StageCard
                            stage={{
                              id: stage.id,
                              name: stage.name,
                              order: stage.order,
                              tasks: stage.tasks.map(task => ({
                                id: task.id,
                                title: task.title,
                                description: task.description,
                                order: task.order
                              }))
                            }}
                            projectId={projectId}
                            onUpdateStage={handleUpdateStage}
                            onDeleteStage={handleDeleteStage}
                            onMoveTask={handleMoveTask}
                          />
                        </Box>
                      )}
                    </Draggable>
                  </Box>
                </React.Fragment>
              ))}
              {provided.placeholder}
              <Box
                className="add-stage-container"
                sx={{
                  position: 'relative',
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <Button
                  className="add-stage-button"
                  onClick={() => handleAddStage(stages.length)}
                  sx={{
                    position: 'relative',
                    minWidth: 'auto',
                    width: '16px',
                    height: '16px',
                    p: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    borderRadius: '50%',
                    zIndex: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      opacity: 1
                    }
                  }}>
                  <Plus size={12} />
                </Button>
              </Box>
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
