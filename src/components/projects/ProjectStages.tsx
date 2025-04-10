import React, { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Edit } from 'lucide-react'
import type { Stage, StageStatus, TaskStatus } from '../../types/project'
import AddStageModal from './AddStageModal'
import StageCard from './StageCard'
import { createStage, updateStage, deleteStage } from '../../api/stage'
import { updateTask } from '../../api/task'
import { client } from '../../api/client'

interface ApiStage {
  id: number
  name: string
  stageOrder: number
  tasks: {
    taskId: number
    title: string
    content: string
    taskOrder: number
  }[]
}

interface ProjectStagesProps {
  projectId: number
  stages: Stage[]
  onStagesChange?: (stages: Stage[]) => void
}

// API 응답을 Stage 타입으로 변환하는 함수
const transformApiStageToStage = (apiStage: ApiStage): Stage => {
  if (!apiStage) {
    throw new Error('Invalid API stage response')
  }
  return {
    id: apiStage.id,
    title: apiStage.name, // Changed name to title to match Stage type
    order: apiStage.stageOrder, // Changed stageOrder to order to match Stage type
    name: apiStage.name,
    stageOrder: apiStage.stageOrder,
    status: '대기' as StageStatus,
    tasks: (apiStage.tasks || []).map(task => ({
      id: task.taskId,
      title: task.title,
      description: task.content || '',
      status: '대기' as TaskStatus,
      order: task.taskOrder || 0,
      stageId: apiStage.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requests: []
    }))
  }
}

// Stage 타입을 API 요청 형식으로 변환하는 함수

export const ProjectStages = ({ projectId, stages = [], onStagesChange }: ProjectStagesProps) => {
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [transformedStages, setTransformedStages] = useState<Stage[]>([])

  // stages prop이 변경될 때 transformedStages 업데이트
  useEffect(() => {
    const transformed = stages.map(stage => transformApiStageToStage(stage as unknown as ApiStage))
    setTransformedStages(transformed)
  }, [stages])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, type } = result

    // Stage 이동
    if (type === 'stage') {
      const items = Array.from(transformedStages)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      // 이동된 위치의 앞뒤 스테이지 ID 찾기
      const prevStage = items[destination.index - 1]
      const nextStage = items[destination.index + 1]
      
      // UI를 먼저 업데이트
      setTransformedStages(items)
      if (onStagesChange) {
        onStagesChange(items)
      }
      
      try {
        // API 호출
        await client.put(`/stages/${reorderedItem.id}/move`, {
          prevStageId: prevStage?.id || null,
          nextStageId: nextStage?.id || null
        })
      } catch (error) {
        console.error('Failed to move stage:', error)
        // API 호출 실패 시 원래 위치로 되돌리기
        const originalItems = Array.from(transformedStages)
        setTransformedStages(originalItems)
        if (onStagesChange) {
          onStagesChange(originalItems)
        }
        // 사용자에게 알림
        alert('스테이지 이동에 실패했습니다. 다시 시도해주세요.')
      }
      return
    }

    // Task 이동
    const sourceStageId = parseInt(source.droppableId.split('-')[1])
    const destinationStageId = parseInt(destination.droppableId.split('-')[1])
    
    const sourceStage = transformedStages.find(s => s.id === sourceStageId)
    const destinationStage = transformedStages.find(s => s.id === destinationStageId)
    
    if (!sourceStage || !destinationStage) return

    const newStages = transformedStages.map(stage => ({...stage}))
    const newSourceStage = newStages.find(s => s.id === sourceStageId)!
    const newDestinationStage = newStages.find(s => s.id === destinationStageId)!

    const [movedTask] = newSourceStage.tasks.splice(source.index, 1)
    newDestinationStage.tasks.splice(destination.index, 0, movedTask)

    // 이동된 위치의 앞뒤 task ID 찾기
    const prevTask = newDestinationStage.tasks[destination.index - 1]
    const nextTask = newDestinationStage.tasks[destination.index + 1]

    // UI를 먼저 업데이트
    setTransformedStages(newStages)
    if (onStagesChange) {
      onStagesChange(newStages)
    }

    try {
      // API 호출
      await client.patch(`/tasks/${movedTask.id}/move`, {
        prevTaskId: prevTask?.id || null,
        nextTaskId: nextTask?.id || null
      })
    } catch (error) {
      console.error('Failed to move task:', error)
      // API 호출 실패 시 원래 위치로 되돌리기
      setTransformedStages(transformedStages)
      if (onStagesChange) {
        onStagesChange(transformedStages)
      }
      // 사용자에게 알림
      alert('작업 이동에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleAddStage = async (title: string) => {
    try {
      // 선택된 위치의 이전/다음 stage ID를 찾음
      const position = selectedPosition ?? transformedStages.length
      const prevStage = position > 0 ? transformedStages[position - 1] : null
      const nextStage = position < transformedStages.length ? transformedStages[position] : null
      
      const prevStageId = prevStage?.id || null
      const nextStageId = nextStage?.id || null

      // Optimistic update: 먼저 UI에 stage 추가
      const newStage: Stage = {
        id: Date.now(), // 임시 ID
        title: title,
        order: position,
        status: '대기' as StageStatus,
        tasks: [],
        stageOrder: undefined,
        name: undefined
      }

      const updatedStages = [...transformedStages]
      updatedStages.splice(position, 0, newStage)

      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }

      // API 호출
      const response = await createStage(projectId, title, prevStageId, nextStageId)
      if (!response) {
        throw new Error('Invalid API response')
      }

      // API 응답으로 실제 stage로 교체
      const finalUpdatedStages = updatedStages.map(stage => 
        stage.id === newStage.id ? {
          id: response.id,
          title: response.name,
          order: response.stageOrder,
          status: '대기' as StageStatus,
          tasks: []
        } : stage
      )

      setTransformedStages(finalUpdatedStages as Stage[])
      if (onStagesChange) {
        onStagesChange(finalUpdatedStages as Stage[])
      }

      // 모달 닫기
      setIsAddStageModalOpen(false)
      setSelectedPosition(null)
    } catch (error) {
      console.error('Failed to add stage:', error)
      // 실패 시 원래 상태로 복구
      setTransformedStages(transformedStages)
      if (onStagesChange) {
        onStagesChange(transformedStages)
      }
      throw error
    }
  }

  // 모달 상태 변경을 감지하는 useEffect
  useEffect(() => {
    if (!isAddStageModalOpen) {
      setSelectedPosition(null)
    }
  }, [isAddStageModalOpen])

  const handleAddStageClick = (position: number) => {
    // stage 개수 제한 확인
    if (transformedStages.length >= 10) {
      alert('스테이지는 최대 10개까지 생성할 수 있습니다.')
      return
    }

    setSelectedPosition(position)
    setIsAddStageModalOpen(true)
  }

  const handleStageEdit = async (stageId: number, newTitle: string) => {
    try {
      const response = await updateStage(stageId, newTitle) as ApiStage
      const updatedStage = transformApiStageToStage(response)
      
      const updatedStages = transformedStages.map(stage => 
        stage.id === stageId ? updatedStage : stage
      )
      
      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
      throw error
    }
  }

  const handleStageDelete = async (stageId: number) => {
    try {
      // Optimistic update: 먼저 UI에서 stage 제거
      const updatedStages = transformedStages.filter(stage => stage.id !== stageId)
      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }

      // API 호출
      await deleteStage(stageId)

      // 게시판 쪽 stage 목록 새로고침
      const stagesResponse = await client.get(`/projects/${projectId}/stages`)
      if (stagesResponse.data && stagesResponse.data.data && Array.isArray(stagesResponse.data.data)) {
        const refreshedStages = stagesResponse.data.data.map((stage: ApiStage) => transformApiStageToStage(stage))
        setTransformedStages(refreshedStages)
        if (onStagesChange) {
          onStagesChange(refreshedStages)
        }
      }
    } catch (error) {
      console.error('Failed to delete stage:', error)
      // 실패 시 원래 상태로 복구
      setTransformedStages(transformedStages)
      if (onStagesChange) {
        onStagesChange(transformedStages)
      }
      throw error
    }
  }


  const handleTaskEdit = async (taskId: number, title: string, content: string) => {
    try {
      // Optimistic update: 먼저 UI 업데이트
      const updatedStages = transformedStages.map(stage => ({
        ...stage,
        tasks: stage.tasks.map(task => 
          task.id === taskId ? {
            ...task,
            title,
            description: content,
            updatedAt: new Date().toISOString()
          } : task
        )
      }))

      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }

      // API 호출
      await updateTask(taskId, { title, content })
    } catch (error) {
      // 실패 시 원래 상태로 복구
      setTransformedStages(transformedStages)
      if (onStagesChange) {
        onStagesChange(transformedStages)
      }
      throw error
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Stages</Typography>
        <Button
          variant="contained"
          startIcon={<Edit size={20} />}
          onClick={() => setIsEditMode(!isEditMode)}
          color={isEditMode ? "primary" : "inherit"}
        >
          {isEditMode ? "수정완료" : "수정모드"}
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages" direction="horizontal" type="stage">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                overflowX: 'auto',
                pb: 2,
                position: 'relative',
                gap: 0
              }}
            >
              {transformedStages.map((stage, index) => (
                <React.Fragment key={`stage-${stage.id}-${index}`}>
                  {isEditMode ? (
                    <Box
                      key={`add-button-${index}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      sx={{
                        width: '24px',
                        minWidth: '24px',
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                        transition: 'width 0.2s ease',
                        '&:hover': {
                          width: '40px',
                          minWidth: '40px'
                        }
                      }}
                    >
                      {hoveredIndex === index && (
                      <Button
                        sx={{
                            minWidth: '32px',
                            width: '32px',
                            height: '32px',
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'background.paper',
                          boxShadow: 1,
                          borderRadius: '50%',
                            p: 0,
                          '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              transform: 'translateX(-50%) scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleAddStageClick(index)}
                        >
                          <Plus size={20} />
                      </Button>
                      )}
                    </Box>
                  ) : (
                    <Box key={`spacer-${index}`} sx={{ width: '16px', minWidth: '16px' }} />
                  )}
                    <Draggable
                    key={`draggable-${stage.id}`}
                    draggableId={stage?.id?.toString() || `stage-${index}`} 
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        sx={{
                          cursor: isEditMode ? 'grab' : 'default',
                          position: 'relative',
                          zIndex: 0
                        }}
                      >
                          <StageCard
                          key={`stage-card-${stage.id}`}
                            stage={stage}
                          stages={transformedStages}
                            projectId={projectId}
                          isEditMode={isEditMode}
                          isDragging={false}
                          onStagesChange={onStagesChange}
                          onStageEdit={handleStageEdit}
                          onStageDelete={handleStageDelete}
                          onTaskEdit={handleTaskEdit}
                          />
                        </Box>
                      )}
                    </Draggable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <AddStageModal
        open={isAddStageModalOpen}
        onClose={() => setIsAddStageModalOpen(false)}
        onAddStage={handleAddStage}
        projectId={projectId}
        stages={transformedStages}
        selectedPosition={selectedPosition}
      />
    </Box>
  )
}

export default ProjectStages
