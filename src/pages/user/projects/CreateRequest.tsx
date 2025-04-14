import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material'
import { Stage } from '../../../types/project'
import { client } from '../../../api/client'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'

const CreateRequest: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [selectedStage, setSelectedStage] = useState<number | ''>('')
  const [selectedTask, setSelectedTask] = useState<number | ''>('')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    const fetchStages = async () => {
      try {
        if (!projectId) return
        const response = await client.get(`/projects/${projectId}/stages`)
        setStages(response.data)
      } catch (err) {
        setError('단계 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStages()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    try {
      await client.post(`/tasks/${selectedTask}/requests`, formData)
      navigate(`/user/projects/${projectId}`)
    } catch (error) {
      console.error('Failed to create request:', error)
      setError('요청 생성에 실패했습니다.')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )

  const selectedStageData = stages.find(stage => stage.id === selectedStage)

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h5"
          sx={{ mb: 3 }}>
          새로운 요청 생성
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>단계</InputLabel>
              <Select
                value={selectedStage}
                label="단계"
                onChange={e => {
                  setSelectedStage(e.target.value as number)
                  setSelectedTask('')
                }}>
                {stages.map(stage => (
                  <MenuItem
                    key={stage.id}
                    value={stage.id}>
                    {stage.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              disabled={!selectedStage}>
              <InputLabel>태스크</InputLabel>
              <Select
                value={selectedTask}
                label="태스크"
                onChange={e => setSelectedTask(e.target.value as number)}>
                {selectedStageData?.tasks.map(task => (
                  <MenuItem
                    key={task.id}
                    value={task.id}>
                    {task.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="제목"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="내용"
              multiline
              rows={4}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/user/projects/${projectId}`)}
                sx={{
                  borderColor: '#FFB800',
                  color: '#FFB800',
                  '&:hover': {
                    borderColor: '#FFB800',
                    opacity: 0.8
                  }
                }}>
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  !selectedTask || !formData.title || !formData.description
                }
                sx={{
                  bgcolor: '#FFB800',
                  '&:hover': {
                    bgcolor: '#FFB800',
                    opacity: 0.8
                  }
                }}>
                생성
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateRequest
