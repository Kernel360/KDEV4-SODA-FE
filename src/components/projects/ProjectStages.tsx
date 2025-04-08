import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
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
import { getProjectStages } from '../../api/project'
import type { ProjectStage as ApiStage } from '../../types/api'

interface ProjectStagesProps {
  projectId: number
}

const defaultStages: Stage[] = [
  { id: 1, title: '요구사항 정의', order: 1, tasks: [] },
  { id: 2, title: '화면 설계', order: 2, tasks: [] },
  { id: 3, title: '디자인', order: 3, tasks: [] },
  { id: 4, title: '퍼블리싱', order: 4, tasks: [] },
  { id: 5, title: '개발', order: 5, tasks: [] },
  { id: 6, title: '검수', order: 6, tasks: [] }
]

const ProjectStages: React.FC<ProjectStagesProps> = ({ projectId }) => {
  const [stages, setStages] = useState<Stage[]>([])
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStages = async () => {
    try {
      const response = await getProjectStages(projectId)
      if (response.status === 'success' && response.data) {
        // API 응답을 Stage 타입으로 변환
        const convertedStages: Stage[] = response.data.map(apiStage => ({
          id: apiStage.id,
          title: apiStage.name,
          order: apiStage.stageOrder,
          tasks: apiStage.tasks.map(task => ({
            id: task.taskId,
            title: task.title,
            description: task.content,
            status: task.status || '신청 대기 중',
            taskOrder: task.taskOrder,
            requests: [], // 초기에는 빈 배열로 설정, 필요한 경우 별도 API 호출로 채워넣을 수 있음
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        }))
        
        // taskOrder 기준으로 정렬
        const sortedStages = convertedStages.map(stage => ({
          ...stage,
          tasks: [...stage.tasks].sort((a, b) => (a as any).taskOrder - (b as any).taskOrder)
        }))
        
        setStages(sortedStages)
      }
    } catch (err) {
      setError('단계 목록을 불러오는데 실패했습니다.')
      console.error('Error fetching stages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStages()
  }, [projectId])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property for each stage
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    setStages(updatedItems)
  }

  const handleAddStage = (index: number) => {
    setSelectedStageIndex(index)
    setIsAddStageModalOpen(true)
  }

  const handleAddStageSubmit = (title: string) => {
    if (selectedStageIndex === null) return

    const newStage: Stage = {
      id: Math.max(...stages.map(s => s.id)) + 1,
      title,
      order: selectedStageIndex + 1,
      tasks: []
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setError(null)
                setIsLoading(true)
                // 데이터 다시 불러오기
                fetchStages()
              }}>
              다시 시도
            </Button>
          }>
          {error}
        </Alert>
      </Box>
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
