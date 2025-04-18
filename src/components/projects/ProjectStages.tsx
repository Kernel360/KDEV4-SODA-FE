import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, IconButton, Stack } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Plus, Edit, Delete } from 'lucide-react'
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(transformedStages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update stageOrder
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      stageOrder: index + 1
    }))

    setTransformedStages(updatedStages)
    if (onStagesChange) {
      onStagesChange(updatedStages)
    }

    // API 호출
    const movedStage = updatedStages[result.destination.index]
    const prevStage = result.destination.index > 0 ? updatedStages[result.destination.index - 1] : null
    const nextStage = result.destination.index < updatedStages.length - 1 ? updatedStages[result.destination.index + 1] : null

    await client.put(`/stages/${movedStage.id}/move`, {
      prevStageId: prevStage?.id || null,
      nextStageId: nextStage?.id || null
    })
  }

  const handleAddStage = async (title: string) => {
    if (!title.trim()) return

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
        title: title.trim(),
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
      const response = await createStage(projectId, title.trim(), prevStageId, nextStageId)
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
      await updateStage(stageId, newTitle)
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleStageDelete = async (stageId: number) => {
    try {
      await deleteStage(stageId)
    } catch (error) {
      console.error('Failed to delete stage:', error)
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
        <Droppable droppableId="stages">
          {(provided) => (
            <Stack
              direction="row"
              spacing={2}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {transformedStages.map((stage, index) => (
                <Draggable key={stage.id} draggableId={stage.id.toString()} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{ p: 2, minWidth: 200 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">{stage.title}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleStageDelete(stage.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      <AddStageModal
        open={isAddStageModalOpen}
        onClose={() => setIsAddStageModalOpen(false)}
        onSubmit={handleAddStage}
      />
    </Box>
  )
}

export default ProjectStages
