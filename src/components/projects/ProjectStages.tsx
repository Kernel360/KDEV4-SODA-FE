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
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import AddStageModal from './AddStageModal'
import StageCard from './StageCard'

interface ProjectStagesProps {
  projectId: number
}

const ProjectStages: React.FC<ProjectStagesProps> = ({ projectId }) => {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(
    null
  )

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const data = await projectService.getProjectStages(projectId)
        setStages(data)
      } catch (err) {
        setError('단계 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStages()
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

    const newStage: Stage = {
      id: Math.max(...stages.map(s => s.id)) + 1,
      name,
      stageOrder: selectedStageIndex + 1
    }

    const updatedStages = [
      ...stages.slice(0, selectedStageIndex),
      newStage,
      ...stages.slice(selectedStageIndex)
    ].map((stage, index) => ({
      ...stage,
      order: index + 1
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
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 1 }}>
          프로젝트 단계
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary">
          각 단계를 드래그하여 순서를 변경할 수 있습니다
        </Typography>
      </Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="stages"
          direction="horizontal">
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
                          transition:
                            'opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
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
                    <Draggable
                      draggableId={String(stage.id)}
                      index={index}>
                      {(provided: DraggableProvided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ px: 0.5 }}>
                          <StageCard
                            stage={stage}
                            onUpdateStage={handleUpdateStage}
                            onDeleteStage={handleDeleteStage}
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
                    transition:
                      'opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
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
