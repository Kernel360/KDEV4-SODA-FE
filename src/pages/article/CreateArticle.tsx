import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm, {
  ArticleFormData
} from '../../components/articles/ArticleForm'
import { projectService } from '@/services/projectService'
import { PriorityType } from '@/types/article'
import { Stage } from '@/types/stage'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { useToast } from '@/contexts/ToastContext'

const CreateArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { showToast } = useToast()

  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    content?: string
    stageId?: string
  }>({})

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    stageId: 0,
    priority: PriorityType.MEDIUM,
    deadLine: null,
    files: [],
    links: []
  })

  useEffect(() => {
    const fetchStages = async () => {
      try {
        if (!projectId) return
        const data = await projectService.getProjectStages(parseInt(projectId))
        setStages(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, stageId: data[0].id }))
        }
      } catch (err) {
        console.error('Error fetching stages:', err)
        setError('단계 목록을 불러오는데 실패했습니다.')
      }
    }

    fetchStages()
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
    if (!validateForm() || !projectId) return

    try {
      setLoading(true)
      await projectService.createArticle({
        ...formData,
        projectId: parseInt(projectId),
        deadLine: formData.deadLine?.toISOString()
      })
      showToast('게시글이 성공적으로 작성되었습니다.', 'success')
      navigate(`/user/projects/${projectId}`)
    } catch (err) {
      console.error('Error creating article:', err)
      showToast('게시글 작성에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/user/projects/${projectId}`)
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <Box sx={{ p: 3 }}>
      <ArticleForm
        mode="create"
        formData={formData}
        stages={stages}
        isLoading={loading}
        validationErrors={validationErrors}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={handleCancel}
      />
    </Box>
  )
}

export default CreateArticle
