import React, { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Edit } from 'lucide-react'
import type { Stage, StageStatus, TaskStatus } from '../../types/project'
import AddStageModal from './AddStageModal'
import StageCard from './StageCard'
import { createStage, updateStage, deleteStage } from '../../api/stage'
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
  stages: ApiStage[]
  onStagesChange?: (stages: Stage[]) => void
}

export const ProjectStages = ({ projectId, stages = [], onStagesChange }: ProjectStagesProps) => {
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [transformedStages, setTransformedStages] = useState<Stage[]>([])

  // API 응답 데이터를 Stage 인터페이스에 맞게 변환
  useEffect(() => {
    const transformed = stages.map(stage => ({
      id: stage.id,
      title: stage.name,
      order: stage.stageOrder,
      status: '대기' as StageStatus,
      tasks: stage.tasks.map(task => ({
        id: task.taskId,
        title: task.title,
        description: task.content,
        status: '대기' as TaskStatus,
        order: task.taskOrder,
        stageId: stage.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requests: []
      }))
    }))
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

    // 이동된 위치의 앞뒤 task ID 출력
    const prevTask = newDestinationStage.tasks[destination.index - 1]
    const nextTask = newDestinationStage.tasks[destination.index + 1]
    console.log('Task moved. Surrounding tasks:', {
      stageId: destinationStageId,
      prevTaskId: prevTask?.id,
      movedTaskId: movedTask.id,
      nextTaskId: nextTask?.id
    })

    if (onStagesChange) {
      onStagesChange(newStages)
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

      // API 호출 먼저 수행
      const response = await createStage(projectId, title, prevStageId, nextStageId)
      
      // API 응답으로 stage 객체 생성
      const newStage: Stage = {
        id: response.id,
        title: title,
        order: position,
        status: '대기' as StageStatus,
        tasks: []
      }

      // 새로운 stages 배열 생성
      const updatedStages = [...transformedStages]
      updatedStages.splice(position, 0, newStage)

      // 상태 업데이트
      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }

      // 모달 닫기
      setIsAddStageModalOpen(false)
      setSelectedPosition(null)
    } catch (error) {
      console.error('Failed to add stage:', error)
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
      await updateStage(stageId, newTitle)
      // 스테이지 목록을 업데이트
      const updatedStages = transformedStages.map(stage => 
        stage.id === stageId ? { ...stage, title: newTitle } : stage
      )
      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleStageDelete = async (stageId: number) => {
    try {
      // 삭제할 stage의 정보 저장
      const stageToDelete = transformedStages.find(stage => stage.id === stageId)
      if (!stageToDelete) return

      // 로컬 상태에서 즉시 삭제 (optimistic update)
      const updatedStages = transformedStages.filter(stage => stage.id !== stageId)
      setTransformedStages(updatedStages)
      if (onStagesChange) {
        onStagesChange(updatedStages)
      }

      // API 호출
      await deleteStage(stageId)
    } catch (error) {
      console.error('Failed to delete stage:', error)
      // 실패 시 원래 상태로 복구
      setTransformedStages(transformedStages)
      if (onStagesChange) {
        onStagesChange(transformedStages)
      }
      alert('스테이지 삭제에 실패했습니다. 다시 시도해주세요.')
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
                <React.Fragment key={stage.id}>
                  {isEditMode ? (
                    <Box
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      sx={{
                        width: '24px',
                        minWidth: '24px',
                        height: '600px',
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
                    <Box sx={{ width: '16px', minWidth: '16px' }} />
                  )}
                  <Draggable 
                    draggableId={stage.id.toString()} 
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
                          key={stage.id}
                          stage={stage}
                          stages={transformedStages}
                          projectId={projectId}
                          isEditMode={isEditMode}
                          isDragging={false}
                          onStagesChange={onStagesChange}
                          onStageEdit={handleStageEdit}
                          onStageDelete={handleStageDelete}
                        />
                      </Box>
                    )}
                  </Draggable>
                </React.Fragment>
              ))}
              {/* 마지막 스테이지 뒤의 + 버튼 또는 간격 */}
              {isEditMode ? (
                <Box
                  onMouseEnter={() => setHoveredIndex(transformedStages.length)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  sx={{
                    width: '24px',
                    minWidth: '24px',
                    height: '600px',
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
                  {hoveredIndex === transformedStages.length && (
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
                      onClick={() => handleAddStageClick(transformedStages.length)}
                    >
                      <Plus size={20} />
                    </Button>
                  )}
                </Box>
              ) : (
                <Box sx={{ width: '16px', minWidth: '16px' }} />
              )}
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
