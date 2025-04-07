import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Paper
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { Stage } from '@/types/stage'
import {
  PriorityType,
  ArticleCreateRequest,
  LinkUploadDTO
} from '@/types/article'
import { projectService } from '@/services/projectService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

interface FormData extends Omit<ArticleCreateRequest, 'deadLine'> {
  deadLine: Date | null
}

const initialFormData: FormData = {
  projectId: 0,
  title: '',
  content: '',
  priority: PriorityType.MEDIUM,
  deadLine: null,
  stageId: 0,
  linkList: []
}

const CreateArticle = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    content?: string
    stageId?: string
  }>({})

  useEffect(() => {
    const fetchStages = async () => {
      try {
        if (!projectId) return
        const data = await projectService.getProjectStages(parseInt(projectId))
        setStages(data)
      } catch (err) {
        console.error('Error fetching stages:', err)
        setError('단계 목록을 불러오는데 실패했습니다.')
      }
    }

    fetchStages()
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId: parseInt(projectId) }))
    }
  }, [projectId])

  const validateForm = () => {
    const errors: typeof validationErrors = {}
    if (!formData.title.trim()) {
      errors.title = '제목을 입력해주세요.'
    }
    if (!formData.content.trim()) {
      errors.content = '내용을 입력해주세요.'
    }
    if (!formData.stageId) {
      errors.stageId = '단계를 선택해주세요.'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const requestData: ArticleCreateRequest = {
        ...formData,
        deadLine: formData.deadLine?.toISOString()
      }
      await projectService.createArticle(requestData)
      navigate(`/user/projects/${projectId}`)
    } catch (err) {
      console.error('Error creating article:', err)
      setError('게시글 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom>
          게시글 작성
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl error={!!validationErrors.stageId}>
              <InputLabel>단계 선택</InputLabel>
              <Select
                value={formData.stageId}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    stageId: e.target.value as number
                  }))
                }
                label="단계 선택"
                required>
                {stages.map(stage => (
                  <MenuItem
                    key={stage.id}
                    value={stage.id}>
                    {stage.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.stageId && (
                <FormHelperText>{validationErrors.stageId}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="제목"
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              error={!!validationErrors.title}
              helperText={validationErrors.title}
              required
            />

            <TextField
              label="내용"
              value={formData.content}
              onChange={e =>
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              multiline
              rows={4}
              error={!!validationErrors.content}
              helperText={validationErrors.content}
              required
            />

            <FormControl>
              <InputLabel>우선순위</InputLabel>
              <Select
                value={formData.priority}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as PriorityType
                  }))
                }
                label="우선순위">
                <MenuItem value={PriorityType.HIGH}>높음</MenuItem>
                <MenuItem value={PriorityType.MEDIUM}>중간</MenuItem>
                <MenuItem value={PriorityType.LOW}>낮음</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label="마감일"
              value={formData.deadLine}
              onChange={newValue =>
                setFormData(prev => ({ ...prev, deadLine: newValue }))
              }
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/user/projects/${projectId}`)}>
                취소
              </Button>
              <Button
                type="submit"
                variant="contained">
                작성
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateArticle
