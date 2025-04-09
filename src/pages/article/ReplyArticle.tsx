import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm from '../../components/articles/ArticleForm'
import { PriorityType } from '../../types/article'
import { Stage } from '../../types/stage'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useToast } from '../../contexts/ToastContext'

interface ValidationErrors {
  title?: string
  content?: string
  stageId?: string
}

interface FormData {
  title: string
  content: string
  stageId: number
  priority: PriorityType
  deadLine: Date | null
  files?: File[]
  links?: { title: string; url: string }[]
}

const ReplyArticle = () => {
  const { projectId, articleId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [stages, setStages] = useState<Stage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    stageId: 0,
    priority: PriorityType.MEDIUM,
    deadLine: null,
    files: [],
    links: []
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !articleId) return
      setIsLoading(true)
      setError(null)
      try {
        const [stagesData, articleData] = await Promise.all([
          projectService.getProjectStages(Number(projectId)),
          projectService.getArticleDetail(Number(projectId), Number(articleId))
        ])
        setStages(stagesData)
        if (articleData) {
          setFormData(prev => ({
            ...prev,
            title: `Re: ${articleData.title}`,
            stageId: stagesData[0]?.id || prev.stageId
          }))
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [projectId, articleId])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
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
    if (!validateForm() || !projectId || !articleId) return

    setIsLoading(true)
    try {
      showToast('답글이 성공적으로 작성되었습니다.', 'success')
      navigate(`/user/projects/${projectId}`)
    } catch (err) {
      console.error('Error creating reply:', err)
      showToast('답글 작성 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/users/projects/${projectId}`)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <ArticleForm
      mode="create"
      formData={formData}
      stages={stages}
      isLoading={isLoading}
      validationErrors={validationErrors}
      onChange={setFormData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

export default ReplyArticle
