import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArticleForm from '../../components/articles/ArticleForm'
import { PriorityType } from '../../types/article'
import { Stage, TaskStatus } from '../../types/stage'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useToast } from '../../contexts/ToastContext'
import type { ArticleFormData } from '../../components/articles/ArticleForm'

interface ValidationErrors {
  title?: string
  content?: string
  priority?: string
  deadLine?: string
  stageId?: string
}

const ReplyArticle: React.FC = () => {
  const navigate = useNavigate()
  const { projectId, articleId } = useParams<{
    projectId: string
    articleId: string
  }>()
  const { showToast } = useToast()

  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    priority: PriorityType.MEDIUM,
    deadLine: null,
    stageId: 0,
    links: [],
    files: []
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !articleId) return
      setLoading(true)
      setError(null)
      try {
        const [stagesData, articleData] = await Promise.all([
          projectService.getProjectStages(parseInt(projectId)),
          projectService.getArticleDetail(
            parseInt(projectId),
            parseInt(articleId)
          )
        ])
        const transformedStages = stagesData.map(stage => ({
          id: stage.id,
          name: stage.name,
          stageOrder: stage.stageOrder,
          order: stage.stageOrder,
          tasks: stage.tasks.map(task => ({
            id: task.taskId,
            taskId: task.taskId,
            title: task.title,
            description: task.content,
            content: task.content,
            status: '대기' as TaskStatus,
            order: task.taskOrder,
            taskOrder: task.taskOrder,
            requests: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        }))
        setStages(transformedStages)
        if (articleData) {
          setFormData(prev => ({
            ...prev,
            title: `RE: ${articleData.title}`,
            stageId: transformedStages[0]?.id || prev.stageId
          }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, articleId])

  const validateForm = () => {
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

    setLoading(true)
    try {
      const parsedProjectId = parseInt(projectId)
      const request = {
        projectId: parsedProjectId,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        stageId: formData.stageId,
        deadLine: formData.deadLine?.toISOString(),
        parentArticleId: parseInt(articleId),
        linkList:
          formData.links?.map(link => ({
            urlAddress: link.url,
            urlDescription: link.title
          })) || [],
        files: formData.files
      }

      // 답글 생성
      const response = await projectService.createArticle(
        parsedProjectId,
        request
      )
      console.log('Created reply response:', response)

      // 파일이 있는 경우 파일 업로드
      if (formData.files && formData.files.length > 0 && response.data?.id) {
        try {
          await projectService.uploadArticleFiles(
            response.data.id,
            formData.files
          )
          console.log(
            'Files uploaded successfully for reply:',
            response.data.id
          )
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError)
          showToast('파일 업로드에 실패했습니다.', 'error')
          // 파일 업로드 실패해도 답글은 작성 완료로 처리
        }
      }

      showToast('답글이 성공적으로 작성되었습니다.', 'success')
      navigate(`/user/projects/${projectId}`)
    } catch (err) {
      console.error('Error creating reply:', err)
      showToast('답글 작성 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <ArticleForm
      mode="create"
      formData={formData}
      stages={stages}
      isLoading={loading}
      validationErrors={validationErrors}
      onChange={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/user/projects/${projectId}`)}
    />
  )
}

export default ReplyArticle
